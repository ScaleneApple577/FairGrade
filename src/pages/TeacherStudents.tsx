import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Loader2,
  Plus,
  Upload,
  Mail,
  Send,
  Trash2,
  FolderPlus,
  Eye,
  GraduationCap,
  Copy,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { InviteStudentsModal } from "@/components/teacher/InviteStudentsModal";
import { ImportCSVModal } from "@/components/teacher/ImportCSVModal";
import { StudentActionsMenu } from "@/components/teacher/StudentActionsMenu";
import { CircularScoreRing, getScoreColorClass } from "@/components/score/CircularScoreRing";
import { ScoreBreakdownModal } from "@/components/score/ScoreBreakdownModal";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { StatusDot, EditingLabel } from "@/components/live/LiveIndicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============ Interfaces ============

interface Classroom {
  id: string;
  name: string;
  status: string;
  student_count?: number;
  created_at: string;
  students?: ClassroomStudent[];
  projects?: any[];
}

interface ClassroomStudent {
  id: number | string;
  user_id: number | string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  joined_at: string;
}

interface ClassroomInvitation {
  id: number | string;
  email: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

interface StudentRow {
  id: string;
  name: string | null;
  email: string;
  status: "active" | "pending" | "inactive";
  joinedAt: string | null;
  avgFairscore: number | null;
  projectCount: number;
  source: "student" | "invitation";
  invitation_id?: number | string;
}

interface StudentStats {
  total: number;
  active: number;
  pending: number;
}

export default function TeacherStudents() {
  // Classroom state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [invitations, setInvitations] = useState<ClassroomInvitation[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);
  const [isLoadingClassroom, setIsLoadingClassroom] = useState(false);

  // Create classroom modal
  const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

  // Join code
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  // Students display
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [stats, setStats] = useState<StudentStats>({ total: 0, active: 0, pending: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedStudentForScore, setSelectedStudentForScore] = useState<StudentRow | null>(null);

  // Live status
  const { isStudentLive, getStudentActiveFile } = useLiveStatus();

  // ============ Fetch Classrooms ============
  
  const fetchClassrooms = async () => {
    setIsLoadingClassrooms(true);
    try {
      const data = await api.get<Classroom[]>("/api/classrooms");
      setClassrooms(data || []);
      // Auto-select first classroom if available
      if (data && data.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
      setClassrooms([]);
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  // ============ Fetch Selected Classroom Detail ============

  const fetchClassroomDetail = async () => {
    if (!selectedClassroomId) return;
    setIsLoadingClassroom(true);
    try {
      const data = await api.get<Classroom>(`/api/classrooms/${selectedClassroomId}`);
      setSelectedClassroom(data);
      
      // Extract join code if available
      setJoinCode((data as any).join_code || null);
      // Map students from classroom response
      const activeStudents: StudentRow[] = (data.students || []).map((s) => ({
        id: `student-${s.user_id}`,
        name: s.first_name || s.last_name 
          ? `${s.first_name || ''} ${s.last_name || ''}`.trim() 
          : null,
        email: s.email,
        status: "active" as const,
        joinedAt: s.joined_at,
        avgFairscore: null, // TODO: Fetch from scores endpoint if available
        projectCount: 0, // TODO: Fetch from projects endpoint if available
        source: "student" as const,
      }));

      // Fetch invitations for this classroom
      const invData = await api.get<ClassroomInvitation[]>(
        `/api/classrooms/${selectedClassroomId}/invitations`
      );
      setInvitations(invData || []);

      // Map pending invitations
      const pendingInvitations: StudentRow[] = (invData || [])
        .filter((i) => i.status === "pending")
        .map((i) => ({
          id: `inv-${i.id}`,
          name: null,
          email: i.email,
          status: "pending" as const,
          joinedAt: null,
          avgFairscore: null,
          projectCount: 0,
          source: "invitation" as const,
          invitation_id: i.id,
        }));

      // Combine lists
      const allStudents = [...activeStudents, ...pendingInvitations];
      setStudents(allStudents);

      // Update stats
      setStats({
        total: allStudents.length,
        active: activeStudents.length,
        pending: pendingInvitations.length,
      });
    } catch (error) {
      console.error("Failed to fetch classroom detail:", error);
      setSelectedClassroom(null);
      setStudents([]);
      setStats({ total: 0, active: 0, pending: 0 });
    } finally {
      setIsLoadingClassroom(false);
    }
  };

  // ============ Create Classroom ============

  const handleCreateClassroom = async () => {
    if (!newClassroomName.trim()) return;
    setIsCreatingClassroom(true);
    try {
      const data = await api.post<Classroom>("/api/classrooms", {
        name: newClassroomName.trim(),
      });
      toast.success(`Classroom "${data.name}" created!`);
      setNewClassroomName("");
      setIsCreateClassroomOpen(false);
      // Add to list and select it
      setClassrooms((prev) => [...prev, data]);
      setSelectedClassroomId(data.id);
    } catch (error) {
      console.error("Failed to create classroom:", error);
      toast.error("Failed to create classroom");
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  // ============ Effects ============

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroomId) {
      fetchClassroomDetail();
    }
  }, [selectedClassroomId]);

  // ============ Filtering and Sorting ============

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          s.email.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || a.email).localeCompare(b.name || b.email);
        case "name_desc":
          return (b.name || b.email).localeCompare(a.name || a.email);
        case "date_newest":
          return (
            new Date(b.joinedAt || 0).getTime() -
            new Date(a.joinedAt || 0).getTime()
          );
        case "date_oldest":
          return (
            new Date(a.joinedAt || 0).getTime() -
            new Date(b.joinedAt || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [students, searchQuery, filterStatus, sortBy]);

  // ============ Bulk Actions ============

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleBulkAction = async (action: "assign" | "resend" | "remove") => {
    if (selectedStudents.length === 0 || !selectedClassroomId) return;

    try {
      if (action === "resend") {
        // Resend invitations by calling invite endpoint with same emails
        const pendingEmails = selectedStudents
          .map((id) => students.find((s) => s.id === id))
          .filter((s) => s?.status === "pending")
          .map((s) => s!.email);

        if (pendingEmails.length > 0) {
          await api.post(`/api/classrooms/${selectedClassroomId}/invite`, {
            emails: pendingEmails,
          });
          toast.success(`${pendingEmails.length} invitation(s) resent`);
        }
      } else if (action === "remove") {
        // Remove invitations (loop through each)
        const invitationsToRemove = selectedStudents
          .map((id) => students.find((s) => s.id === id))
          .filter((s) => s?.source === "invitation" && s?.invitation_id);

        for (const student of invitationsToRemove) {
          if (student?.invitation_id) {
            await api.delete(
              `/api/classrooms/${selectedClassroomId}/invitations/${student.invitation_id}`
            );
          }
        }

        // TODO: Need backend endpoint to remove active students from classroom
        // For now, only invitations can be removed
        const activeToRemove = selectedStudents.filter((id) =>
          students.find((s) => s.id === id && s.source === "student")
        );
        if (activeToRemove.length > 0) {
          console.warn(
            "TODO: Need backend endpoint to remove students from classroom (DELETE /api/classrooms/{id}/students/{student_id})"
          );
        }

        toast.success(`${invitationsToRemove.length} invitation(s) revoked`);
      } else if (action === "assign") {
        // TODO: Implement project assignment modal
        toast.info("Project assignment coming soon");
      }

      setSelectedStudents([]);
      fetchClassroomDetail();
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const handleRefresh = () => {
    fetchClassroomDetail();
  };

  const handleRegenerateCode = async () => {
    if (!selectedClassroomId) return;
    setIsRegeneratingCode(true);
    try {
      const newCode = await api.post<string>(`/api/classrooms/${selectedClassroomId}/regenerate-code`);
      setJoinCode(typeof newCode === "string" ? newCode : (newCode as any).code || null);
      toast.success("Code regenerated");
    } catch (error) {
      console.error("Failed to regenerate code:", error);
      toast.error("Failed to regenerate code");
    } finally {
      setIsRegeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCodeCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleViewScore = (student: StudentRow) => {
    setSelectedStudentForScore(student);
    setScoreModalOpen(true);
  };

  // ============ Helpers ============

  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const getAvatarColor = (id: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-emerald-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];
    const index = parseInt(id.replace(/\D/g, ""), 10) % colors.length;
    return colors[index] || colors[0];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Invite pending";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasPendingSelected = selectedStudents.some((id) => {
    const student = students.find((s) => s.id === id);
    return student?.status === "pending";
  });

  // ============ Loading State ============

  if (isLoadingClassrooms) {
    return (
      <TeacherLayout>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-5 h-5 text-[#8b949e] animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  // ============ No Classrooms State ============

  if (classrooms.length === 0) {
    return (
      <TeacherLayout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <GraduationCap className="w-8 h-8 text-[#8b949e]/50 mb-4" />
            <h1 className="text-base font-semibold text-white mb-1">
              Create Your First Classroom
            </h1>
            <p className="text-[#8b949e] text-sm mb-5 max-w-sm">
              A classroom is like a course section. Create one to start inviting students.
            </p>
            <Input
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
              placeholder="e.g., CS 101 — Fall 2026"
              className="bg-white/[0.06] border border-white/[0.06] text-white rounded-md px-3 py-2 w-72 placeholder:text-[#8b949e]/60 mb-3 text-sm"
            />
            <Button
              onClick={handleCreateClassroom}
              disabled={!newClassroomName.trim() || isCreatingClassroom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-8 rounded-md text-sm font-medium"
            >
              {isCreatingClassroom ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Create Classroom
            </Button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // ============ Main Render ============

  return (
    <TeacherLayout>
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-2 mb-5">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="ghost"
            disabled={!selectedClassroomId}
            className="text-[#8b949e] hover:text-white hover:bg-white/[0.06] text-sm h-8 px-3"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import CSV
          </Button>
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            disabled={!selectedClassroomId}
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-md text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Invite Students
          </Button>
        </div>

        {/* Classroom Tabs */}
        <div className="flex items-center gap-1 mb-5 flex-wrap border-b border-white/[0.06] pb-3">
          {classrooms.map((classroom) => (
            <button
              key={classroom.id}
              onClick={() => setSelectedClassroomId(classroom.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedClassroomId === classroom.id
                  ? "bg-white/[0.08] text-white"
                  : "text-[#8b949e] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {classroom.name}
            </button>
          ))}
          <button
            onClick={() => setIsCreateClassroomOpen(true)}
            className="px-3 py-1.5 rounded-md text-sm text-[#8b949e] hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            + New
          </button>
        </div>

        {/* Join Code & Invitations Section */}
        {selectedClassroomId && !isLoadingClassroom && (
          <div className="flex items-center gap-6 mb-5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            {/* Join Code */}
            {joinCode && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8b949e]">Join Code:</span>
                <span className="text-2xl font-mono tracking-wider text-white font-semibold">{joinCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="text-[#8b949e] hover:text-white h-7 px-2"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateCode}
                  disabled={isRegeneratingCode}
                  className="text-[#8b949e] hover:text-white h-7 px-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingCode ? "animate-spin" : ""}`} />
                </Button>
              </div>
            )}

            {/* Invitations toggle */}
            <button
              onClick={() => setShowInvitations(!showInvitations)}
              className="ml-auto text-xs text-[#8b949e] hover:text-white transition-colors"
            >
              {showInvitations ? "Hide" : "Show"} Invitations ({invitations.length})
            </button>
          </div>
        )}

        {/* Invitations List */}
        {showInvitations && invitations.length > 0 && (
          <div className="mb-5 rounded-lg border border-white/[0.06] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-xs font-medium text-[#8b949e]">Email</th>
                  <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Status</th>
                  <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Sent</th>
                  <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Accepted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 text-sm text-white">{inv.email}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        inv.status === "accepted"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center text-xs text-[#8b949e]">{formatDate(inv.created_at)}</td>
                    <td className="p-3 text-center text-xs text-[#8b949e]">{inv.accepted_at ? formatDate(inv.accepted_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-5 text-xs text-[#8b949e]">
          <span>{stats.total} total</span>
          <span className="text-emerald-400">{stats.active} active</span>
          <span className="text-yellow-400">{stats.pending} pending</span>
        </div>

        {isLoadingClassroom ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-[#8b949e] animate-spin" />
          </div>
        ) : (
          <>
            {/* Search and filter bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#8b949e]" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-white/[0.06] border-white/[0.06] text-white rounded-md h-8 text-sm placeholder:text-[#8b949e]/60"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.06] text-[#8b949e] rounded-md px-2.5 h-8 text-xs"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.06] text-[#8b949e] rounded-md px-2.5 h-8 text-xs"
              >
                <option value="name">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="date_newest">Newest</option>
                <option value="date_oldest">Oldest</option>
              </select>
            </div>

            {/* Bulk actions bar */}
            {selectedStudents.length > 0 && (
              <div className="flex items-center justify-between p-2.5 mb-3 rounded-md bg-blue-600/10 border border-blue-500/10">
                <span className="text-white text-xs">{selectedStudents.length} selected</span>
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleBulkAction("assign")} size="sm" className="bg-white/[0.06] text-white h-7 px-2.5 text-xs rounded-md hover:bg-white/[0.1]">
                    <FolderPlus className="w-3 h-3 mr-1" />Assign
                  </Button>
                  {hasPendingSelected && (
                    <Button onClick={() => handleBulkAction("resend")} size="sm" className="bg-white/[0.06] text-white h-7 px-2.5 text-xs rounded-md hover:bg-white/[0.1]">
                      <Send className="w-3 h-3 mr-1" />Resend
                    </Button>
                  )}
                  <Button onClick={() => handleBulkAction("remove")} size="sm" className="bg-red-500/10 text-red-400 h-7 px-2.5 text-xs rounded-md hover:bg-red-500/20">
                    <Trash2 className="w-3 h-3 mr-1" />Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Students table */}
            <div className="rounded-lg overflow-hidden border border-white/[0.06]">
              {filteredStudents.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="p-3 text-left w-10">
                        <Checkbox
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-white/20"
                        />
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-[#8b949e]">Name</th>
                      <th className="text-left p-3 text-xs font-medium text-[#8b949e]">Email</th>
                      <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Status</th>
                      <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Score</th>
                      <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Projects</th>
                      <th className="text-center p-3 text-xs font-medium text-[#8b949e]">Joined</th>
                      <th className="text-right p-3 text-xs font-medium text-[#8b949e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) =>
                              handleSelectStudent(student.id, checked as boolean)
                            }
                            className="border-white/20"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className={`w-7 h-7 ${getAvatarColor(student.id)} rounded-full flex items-center justify-center text-white text-[10px] font-medium`}>
                                {getInitials(student.name, student.email)}
                              </div>
                              {student.source === "student" && isStudentLive(student.id.replace("student-", "")) && (
                                <StatusDot status="editing" className="absolute -bottom-0.5 -right-0.5" />
                              )}
                            </div>
                            <div>
                              <span className="text-white text-sm block">{student.name || "—"}</span>
                              {student.source === "student" && isStudentLive(student.id.replace("student-", "")) && getStudentActiveFile(student.id.replace("student-", "")) && (
                                <EditingLabel fileName={getStudentActiveFile(student.id.replace("student-", ""))!.fileName} />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-[#8b949e] text-sm">{student.email}</td>
                        <td className="p-3 text-center">
                          {student.status === "active" && (
                            <span className="text-emerald-400 text-xs">Active</span>
                          )}
                          {student.status === "pending" && (
                            <span className="text-yellow-400 text-xs">Pending</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {student.avgFairscore !== null ? (
                            <button onClick={() => handleViewScore(student)} className="inline-flex items-center gap-1.5 hover:opacity-80 transition">
                              <CircularScoreRing score={student.avgFairscore} size="sm" animate={false} />
                              <span className={`font-medium text-xs ${getScoreColorClass(student.avgFairscore)}`}>{student.avgFairscore}</span>
                            </button>
                          ) : (
                            <span className="text-[#8b949e]/40">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center text-[#8b949e] text-sm">{student.projectCount}</td>
                        <td className="p-3 text-center">
                          {student.status === "pending" ? (
                            <span className="text-yellow-400 text-xs">Pending</span>
                          ) : (
                            <span className="text-[#8b949e] text-xs">{formatDate(student.joinedAt)}</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <StudentActionsMenu
                            studentId={student.id}
                            studentName={student.name || ""}
                            studentEmail={student.email}
                            status={student.status}
                            classroomId={selectedClassroomId || undefined}
                            invitationId={student.invitation_id}
                            onRefresh={handleRefresh}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-7 h-7 text-[#8b949e]/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-white mb-1">No students yet</p>
                  <p className="text-xs text-[#8b949e] mb-4 max-w-sm mx-auto">
                    Invite students by email to get started.
                  </p>
                  <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-md text-sm font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Invite Students
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={isCreateClassroomOpen} onOpenChange={setIsCreateClassroomOpen}>
        <DialogContent className="bg-[hsl(220,13%,10%)] border border-white/[0.08] rounded-lg p-5 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-base font-semibold">New Classroom</DialogTitle>
          </DialogHeader>
          <div className="mt-3">
            <Input
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
              placeholder="e.g., CS 101 — Fall 2026"
              className="bg-white/[0.06] border-white/[0.06] text-white rounded-md h-9 text-sm placeholder:text-[#8b949e]/60"
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button onClick={() => setIsCreateClassroomOpen(false)} className="text-[#8b949e] hover:text-white text-sm px-3 py-1.5">Cancel</button>
            <Button
              onClick={handleCreateClassroom}
              disabled={!newClassroomName.trim() || isCreatingClassroom}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-md text-sm font-medium"
            >
              {isCreatingClassroom ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <InviteStudentsModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        teacherName="You"
        classroomId={selectedClassroomId || undefined}
        onSuccess={handleRefresh}
      />

      <ImportCSVModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        classroomId={selectedClassroomId || undefined}
        onSuccess={handleRefresh}
      />

      {selectedStudentForScore && (
        <ScoreBreakdownModal
          open={scoreModalOpen}
          onOpenChange={setScoreModalOpen}
          studentId={selectedStudentForScore.id}
          studentName={selectedStudentForScore.name || selectedStudentForScore.email}
          studentAvatarColor={getAvatarColor(selectedStudentForScore.id)}
          projectId=""
          projectName="All Projects (Average)"
          isTeacher={true}
        />
      )}
    </TeacherLayout>
  );
}
