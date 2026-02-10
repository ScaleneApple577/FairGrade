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
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  // ============ No Classrooms State ============

  if (classrooms.length === 0) {
    return (
      <TeacherLayout>
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-20 h-20 bg-blue-500/15 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Create Your First Classroom
            </h1>
            <p className="text-slate-400 text-sm mb-6 max-w-md">
              A classroom is like a course section. Create one to start inviting students.
            </p>
            <Input
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
              placeholder="e.g., CS 101 — Fall 2026"
              className="bg-white/10 border border-white/10 text-white rounded-xl px-4 py-3 w-80 placeholder:text-slate-500 mb-4"
            />
            <Button
              onClick={handleCreateClassroom}
              disabled={!newClassroomName.trim() || isCreatingClassroom}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium"
            >
              {isCreatingClassroom ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
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
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Students</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your classroom roster
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              disabled={!selectedClassroomId}
              className="bg-white/10 border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/15"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!selectedClassroomId}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Students
            </Button>
          </div>
        </div>

        {/* Classroom Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {classrooms.map((classroom) => (
            <button
              key={classroom.id}
              onClick={() => setSelectedClassroomId(classroom.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedClassroomId === classroom.id
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-400 hover:bg-white/15 hover:text-white"
              }`}
            >
              {classroom.name}
            </button>
          ))}
          <button
            onClick={() => setIsCreateClassroomOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 border border-dashed border-white/20 text-slate-400 hover:text-white hover:bg-white/15 transition-all"
          >
            + New Classroom
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full">
            {stats.total} Total Students
          </span>
          <span className="bg-emerald-500/15 text-emerald-400 text-xs px-3 py-1.5 rounded-full">
            {stats.active} Active
          </span>
          <span className="bg-yellow-500/15 text-yellow-400 text-xs px-3 py-1.5 rounded-full">
            {stats.pending} Pending Invites
          </span>
        </div>

        {isLoadingClassroom ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Search and filter bar */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/10 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-slate-500 w-full"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/10 text-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending Invite</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/10 text-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="date_newest">Date Added (Newest)</option>
                  <option value="date_oldest">Date Added (Oldest)</option>
                </select>
              </div>
            </div>

            {/* Bulk actions bar */}
            {selectedStudents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4 flex items-center justify-between"
              >
                <span className="text-white text-sm">
                  {selectedStudents.length} student(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleBulkAction("assign")}
                    size="sm"
                    className="bg-blue-500/15 text-blue-400 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500/25"
                  >
                    <FolderPlus className="w-3 h-3 mr-1" />
                    Assign to Project
                  </Button>
                  {hasPendingSelected && (
                    <Button
                      onClick={() => handleBulkAction("resend")}
                      size="sm"
                      className="bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:bg-white/15"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Resend Invitations
                    </Button>
                  )}
                  <Button
                    onClick={() => handleBulkAction("remove")}
                    size="sm"
                    className="bg-red-500/15 text-red-400 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/25"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove Selected
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Students table */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
              {filteredStudents.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={
                            selectedStudents.length === filteredStudents.length &&
                            filteredStudents.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          className="border-white/20"
                        />
                      </th>
                      <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-center p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Avg. Score
                      </th>
                      <th className="text-center p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Projects
                      </th>
                      <th className="text-center p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="text-right p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/[0.03] transition"
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) =>
                              handleSelectStudent(student.id, checked as boolean)
                            }
                            className="border-white/20"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`w-9 h-9 ${getAvatarColor(
                                  student.id
                                )} rounded-full flex items-center justify-center text-white text-sm font-medium`}
                              >
                                {getInitials(student.name, student.email)}
                              </div>
                              {student.source === "student" &&
                                isStudentLive(student.id.replace("student-", "")) && (
                                  <StatusDot
                                    status="editing"
                                    className="absolute -bottom-0.5 -right-0.5"
                                  />
                                )}
                            </div>
                            <div>
                              <span className="text-white text-sm font-medium block">
                                {student.name || "—"}
                              </span>
                              {student.source === "student" &&
                                isStudentLive(student.id.replace("student-", "")) &&
                                getStudentActiveFile(student.id.replace("student-", "")) && (
                                  <EditingLabel
                                    fileName={
                                      getStudentActiveFile(student.id.replace("student-", ""))!.fileName
                                    }
                                  />
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{student.email}</td>
                        <td className="p-4 text-center">
                          {student.status === "active" && (
                            <span className="bg-emerald-500/15 text-emerald-400 text-xs px-2.5 py-1 rounded-full">
                              Active
                            </span>
                          )}
                          {student.status === "pending" && (
                            <span className="bg-yellow-500/15 text-yellow-400 text-xs px-2.5 py-1 rounded-full">
                              Pending Invite
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {student.avgFairscore !== null ? (
                            <button
                              onClick={() => handleViewScore(student)}
                              className="inline-flex items-center gap-2 hover:opacity-80 transition"
                            >
                              <CircularScoreRing
                                score={student.avgFairscore}
                                size="sm"
                                animate={false}
                              />
                              <span
                                className={`font-bold text-sm ${getScoreColorClass(
                                  student.avgFairscore
                                )}`}
                              >
                                {student.avgFairscore}
                              </span>
                            </button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-slate-300 text-sm">
                          {student.projectCount}
                        </td>
                        <td className="p-4 text-center">
                          {student.status === "pending" ? (
                            <span className="text-yellow-400 text-xs">Invite pending</span>
                          ) : (
                            <span className="text-slate-500 text-sm">
                              {formatDate(student.joinedAt)}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
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
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-white text-lg font-medium">
                    No students in this classroom yet
                  </p>
                  <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                    Invite students by email to get started. They'll receive an
                    invitation to join your classroom on FairGrade.
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <Button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Invite Students
                    </Button>
                  </div>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="text-blue-400 text-sm hover:text-blue-300 mt-3 inline-block"
                  >
                    or Import from CSV
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={isCreateClassroomOpen} onOpenChange={setIsCreateClassroomOpen}>
        <DialogContent className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Create New Classroom
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
              placeholder="e.g., CS 101 — Fall 2026"
              className="bg-white/10 border border-white/10 text-white rounded-xl px-4 py-3 placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setIsCreateClassroomOpen(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <Button
              onClick={handleCreateClassroom}
              disabled={!newClassroomName.trim() || isCreatingClassroom}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium"
            >
              {isCreatingClassroom ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
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
