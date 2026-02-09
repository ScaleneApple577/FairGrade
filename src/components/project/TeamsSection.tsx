import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  UserPlus,
  X,
  Loader2,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// API response types
interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface TeamsSectionProps {
  projectId: string;
}

export function TeamsSection({ projectId }: TeamsSectionProps) {
  // TODO: Need endpoint to get teams for a project
  // e.g., GET /api/projects/projects/{project_id}/teams
  // For now, store teams locally after creation
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Create team form
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Load teams from localStorage on mount (temporary until backend supports project-team association)
  useEffect(() => {
    const storedTeams = localStorage.getItem(`project_${projectId}_teams`);
    if (storedTeams) {
      try {
        setTeams(JSON.parse(storedTeams));
      } catch (e) {
        console.error("Failed to parse stored teams:", e);
      }
    }
  }, [projectId]);

  // Persist teams to localStorage
  const persistTeams = (updatedTeams: Team[]) => {
    localStorage.setItem(`project_${projectId}_teams`, JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setIsCreating(true);
    try {
      // POST /api/teams — Body: { name, description }
      const response = await api.post<Team>("/api/teams", {
        name: teamName.trim(),
        description: teamDescription.trim() || null,
      });
      
      // TODO: Need endpoint to associate team with project
      // e.g., POST /api/projects/projects/{project_id}/teams with { team_id }
      // For now, store locally
      const updatedTeams = [...teams, response];
      persistTeams(updatedTeams);
      
      toast({
        title: "✅ Team created",
        description: `"${response.name}" is ready. Now invite students to join.`,
      });
      
      setShowCreateModal(false);
      setTeamName("");
      setTeamDescription("");
    } catch (error) {
      console.error("Failed to create team:", error);
      toast({ title: "Failed to create team", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewMembers = async (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
    setIsLoadingMembers(true);
    try {
      // GET /api/teams/{id}/members
      const members = await api.get<TeamMember[]>(`/api/teams/${team.id}/members`);
      setTeamMembers(members);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      setTeamMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleOpenInviteModal = (team: Team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  const handleInviteToTeam = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    setIsInviting(true);
    try {
      // POST /api/teams/{id}/invite — Body: { email }
      await api.post(`/api/teams/${selectedTeam.id}/invite`, {
        email: inviteEmail.trim(),
      });
      
      toast({
        title: "✅ Invitation sent",
        description: `${inviteEmail} has been invited to ${selectedTeam.name}`,
      });
      
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Failed to invite to team:", error);
      toast({ title: "Failed to send invitation", variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getFullName = (member: TeamMember): string => {
    if (member.first_name && member.last_name) {
      return `${member.first_name} ${member.last_name}`;
    }
    if (member.first_name) {
      return member.first_name;
    }
    return member.email;
  };

  // Avatar colors
  const avatarColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];

  const getAvatarColor = (index: number): string => {
    return avatarColors[index % avatarColors.length];
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-lg font-semibold">Teams</h2>
          <p className="text-slate-400 text-sm mt-1">Organize students into groups</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No teams created yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Create teams to organize your students into groups
          </p>
        </div>
      ) : (
        /* Teams Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="bg-white/[0.04] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{team.name}</h3>
                  {team.description && (
                    <p className="text-slate-400 text-sm mt-1">{team.description}</p>
                  )}
                </div>
                <div className={`w-8 h-8 ${getAvatarColor(index)} rounded-lg flex items-center justify-center`}>
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  onClick={() => handleViewMembers(team)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/10 border-white/10 text-white hover:bg-white/15"
                >
                  View Members
                </Button>
                <Button
                  onClick={() => handleOpenInviteModal(team)}
                  size="sm"
                  className="flex-1 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Invite
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Create a Team</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Team Name</Label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Team Alpha"
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-white text-sm font-medium">Description (optional)</Label>
                <Input
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                onClick={handleCreateTeam}
                disabled={!teamName.trim() || isCreating}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl mt-4"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite to Team Modal */}
      {showInviteModal && selectedTeam && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">
                Add Student to {selectedTeam.name}
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Student Email</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter student email..."
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                onClick={handleInviteToTeam}
                disabled={!inviteEmail.trim() || isInviting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl mt-4"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Invite to Team
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Team Members Modal */}
      {showMembersModal && selectedTeam && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowMembersModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">
                {selectedTeam.name} Members
              </h3>
              <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No members yet</p>
                <p className="text-slate-500 text-sm mt-1">Invite students to join this team</p>
                <Button
                  onClick={() => {
                    setShowMembersModal(false);
                    setShowInviteModal(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm mt-4"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Students
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-3"
                  >
                    <div className={`w-10 h-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {getInitials(member.first_name, member.last_name, member.email)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{getFullName(member)}</p>
                      <p className="text-slate-500 text-xs">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {teamMembers.length > 0 && (
              <Button
                onClick={() => {
                  setShowMembersModal(false);
                  setShowInviteModal(true);
                }}
                variant="outline"
                className="w-full bg-white/10 border-white/10 text-white hover:bg-white/15 mt-4"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite More Students
              </Button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
