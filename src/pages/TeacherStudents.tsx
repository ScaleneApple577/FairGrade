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

interface Student {
  id: string;
  name: string | null;
  email: string;
  avatar: string;
  avatarColor: string;
  status: "active" | "pending" | "inactive";
  projectCount: number;
  joinedAt: string | null;
  avgFairscore: number | null;
}

interface StudentStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedStudentForScore, setSelectedStudentForScore] = useState<Student | null>(null);

  // Live status
  const { isStudentLive, getStudentActiveFile } = useLiveStatus();

  const handleViewScore = (student: Student) => {
    setSelectedStudentForScore(student);
    setScoreModalOpen(true);
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // TODO: GET /api/teacher/students
      const data = await api.get("/api/teacher/students");
      setStudents(data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // TODO: GET /api/teacher/students/stats
      const data = await api.get("/api/teacher/students/stats");
      setStats(data || { total: 0, active: 0, pending: 0, inactive: 0 });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          s.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    // Sort
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
    if (selectedStudents.length === 0) return;

    try {
      // TODO: POST /api/teacher/students/bulk-action
      await api.post("/api/teacher/students/bulk-action", {
        student_ids: selectedStudents,
        action,
      });

      const actionLabels = {
        assign: "assigned to project",
        resend: "invitations resent",
        remove: "removed from classroom",
      };

      toast.success(
        `${selectedStudents.length} student(s) ${actionLabels[action]}`
      );
      setSelectedStudents([]);
      fetchStudents();
      fetchStats();
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const handleRefresh = () => {
    fetchStudents();
    fetchStats();
  };

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

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

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
              className="bg-white/10 border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/15"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Students
            </Button>
          </div>
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
              <option value="inactive">Inactive</option>
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
                          {isStudentLive(student.id) && (
                            <StatusDot status="editing" className="absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                        <div>
                          <span className="text-white text-sm font-medium block">
                            {student.name || "—"}
                          </span>
                          {isStudentLive(student.id) && getStudentActiveFile(student.id) && (
                            <EditingLabel fileName={getStudentActiveFile(student.id)!.fileName} />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {student.email}
                    </td>
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
                      {student.status === "inactive" && (
                        <span className="bg-slate-500/15 text-slate-400 text-xs px-2.5 py-1 rounded-full">
                          Inactive
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
                          <span className={`font-bold text-sm ${getScoreColorClass(student.avgFairscore)}`}>
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
                        <span className="text-yellow-400 text-xs">
                          Invite pending
                        </span>
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
                No students in your classroom yet
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
      </div>

      {/* Modals */}
      <InviteStudentsModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        teacherName="You"
        onSuccess={handleRefresh}
      />

      <ImportCSVModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
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
