import { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

// API response types
interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface MyTeamSectionProps {
  projectId: string;
}

export function MyTeamSection({ projectId }: MyTeamSectionProps) {
  // TODO: Need endpoint to get student's team for a project
  // e.g., GET /api/projects/{project_id}/my-team
  // or include team info in project detail response
  
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load team from localStorage (temporary until backend supports this)
  useEffect(() => {
    const storedTeamId = localStorage.getItem(`student_project_${projectId}_team`);
    const storedTeamName = localStorage.getItem(`student_project_${projectId}_team_name`);
    
    if (storedTeamId && storedTeamName) {
      setTeamName(storedTeamName);
      fetchTeamMembers(storedTeamId);
    }
  }, [projectId]);

  const fetchTeamMembers = async (teamId: string) => {
    setIsLoading(true);
    try {
      // TODO: Get team members from api.get('/api/teams/{team_id}/members')
      const members = await api.get<TeamMember[]>(`/api/teams/${teamId}/members`);
      setTeamMembers(members);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
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

  // If no team assigned, show nothing or a message
  if (!teamName && !isLoading) {
    return (
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="text-white text-lg font-semibold">My Team</h2>
        </div>
        <div className="text-center py-8">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No team assigned yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Your instructor will assign you to a team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-slate-400" />
        <div>
          <h2 className="text-white text-lg font-semibold">My Team</h2>
          {teamName && <p className="text-slate-400 text-sm">{teamName}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No teammates yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-3 min-w-[200px]"
            >
              <div className={`w-10 h-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {getInitials(member.first_name, member.last_name, member.email)}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{getFullName(member)}</p>
                <p className="text-slate-500 text-xs">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO comments for future integration */}
      {/* 
        TODO: Calendar page — team members for availability:
        Get team members from api.get('/api/teams/{team_id}/members') instead of project students
        
        TODO: Peer reviews — rate teammates:
        Get reviewable teammates from api.get('/api/teams/{team_id}/members')
        
        TODO: Project files — team's files:
        Files may need to be scoped to teams, not just projects
        
        TODO: FairScore — team comparison:
        Score calculations should be within team context
      */}
    </div>
  );
}
