import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Edit,
  Download,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Users,
  Mail,
  Play,
  ExternalLink,
  FolderOpen,
  FileText,
  Activity,
  Loader2,
  Bell,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ScoreBadge } from "@/components/score/ScoreBadge";
import { ScoreBreakdownModal } from "@/components/score/ScoreBreakdownModal";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { LiveIndicator, StatusDot, EditingLabel } from "@/components/live/LiveIndicator";
import { getGoogleFileUrl, getFileIcon } from "@/lib/fileUtils";
import { TeamsSection } from "@/components/project/TeamsSection";
import { IntegritySection } from "@/components/project/IntegritySection";

// Backend API response format
interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  files: ApiFile[];
  created_at: string;
}

interface ApiFile {
  id: string;
  name: string;
  drive_file_id: string;
  mime_type: string;
  created_at: string;
}

// Frontend display format
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  // Optional fields not from backend
  course?: string;
  deadline?: string;
  status?: "healthy" | "needs_attention" | "at_risk";
  studentCount?: number;
  progress?: number;
  riskScore?: number;
  daysRemaining?: number;
  flaggedIssues?: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  fairscore: number | null;
  wordsWritten: number;
  tasksCompleted: number;
  tasksTotal: number;
  meetingsAttended: number;
  meetingsTotal: number;
  peerRating: number;
  isFreeRider: boolean;
  flags: { type: string; message: string }[];
  hasSubmittedFiles: boolean;
}

interface StudentFile {
  id: string;
  name: string;
  drive_file_id: string;
  mime_type: string;
  created_at: string;
  // Optional student info
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  studentColor?: string;
  trackingStatus?: "active" | "pending";
}

interface ActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  action: string;
  fileName: string;
  timestamp: string;
}

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
}

export default function TeacherProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("students");

  // Data states
  const [project, setProject] = useState<Project | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [files, setFiles] = useState<StudentFile[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Live status for this project
  const { isFileLive, getFileEditors, isStudentLive, getStudentActiveFile } = useLiveStatus({
    projectId: id,
  });

  const handleViewScore = (student: Student) => {
    setSelectedStudent(student);
    setScoreModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Backend returns: { id, name, description, files: [...], created_at }
        const data = await api.get<ApiProject>(`/api/projects/projects/${id}`);
        
        // Transform to frontend format
        setProject({
          id: data.id,
          name: data.name,
          description: data.description || '',
          created_at: data.created_at,
          course: '—', // Not returned by backend
          deadline: undefined,
          status: 'healthy',
          studentCount: 0,
          progress: 0,
          riskScore: 0,
          daysRemaining: undefined,
          flaggedIssues: 0,
        });
        
        // Files come directly from project response
        setFiles(data.files || []);
        
        // TODO: Need GET /api/projects/projects/{project_id}/students endpoint
        setStudents([]);
        setActivities([]);
        setAlerts([]);
      } catch (error) {
        console.error("Failed to fetch project:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load project data",
        });
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getFileIconForType = (mimeType: string) => {
    return getFileIcon(mimeType);
  };

  // Group files by student
  const filesByStudent = files.reduce((acc, file) => {
    if (!acc[file.studentId]) {
      acc[file.studentId] = {
        studentId: file.studentId,
        studentName: file.studentName,
        studentAvatar: file.studentAvatar,
        studentColor: file.studentColor,
        files: [],
      };
    }
    acc[file.studentId].files.push(file);
    return acc;
  }, {} as Record<string, { studentId: string; studentName: string; studentAvatar: string; studentColor: string; files: StudentFile[] }>);

  // Students who haven't submitted files
  const studentsWithoutFiles = students.filter(s => !s.hasSubmittedFiles);

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    try {
      // TODO: POST /api/projects/projects/{project_id}/remind-files - endpoint may not exist
      console.warn("TODO: Need POST /api/projects/projects/{project_id}/remind-files endpoint");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "✅ Reminder sent",
        description: `Notified ${studentsWithoutFiles.length} students to submit their documents`,
      });
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast({ title: "Failed to send reminder", variant: "destructive" });
    } finally {
      setIsSendingReminder(false);
    }
  };

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
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/teacher/projects")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to All Projects</span>
        </button>

        {project ? (
          <>
            {/* Header Section */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      project.status === "healthy" ? "bg-green-500/20 text-green-400" :
                      project.status === "needs_attention" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {project.status === "healthy" && <CheckCircle className="w-4 h-4" />}
                      {project.status === "needs_attention" && <Clock className="w-4 h-4" />}
                      {project.status === "at_risk" && <AlertTriangle className="w-4 h-4" />}
                      {project.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-slate-400">{project.course} • Due {formatDate(project.deadline)}</p>
                  <p className="text-sm text-slate-500 mt-2">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-white/10 border-white/10 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </Button>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export Reports
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-5 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{project.studentCount}</p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{project.progress}%</p>
                  <p className="text-xs text-slate-500">Progress</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${project.riskScore > 70 ? "text-red-400" : project.riskScore > 40 ? "text-yellow-400" : "text-green-400"}`}>
                    {project.riskScore}
                  </p>
                  <p className="text-xs text-slate-500">Risk Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{project.daysRemaining}</p>
                  <p className="text-xs text-slate-500">Days Left</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{project.flaggedIssues}</p>
                  <p className="text-xs text-slate-500">Flagged Issues</p>
                </div>
              </div>
            </div>

            {/* Teams Section */}
            <TeamsSection projectId={project.id} />

            {/* Integrity Analysis Section */}
            <IntegritySection projectId={project.id} />

            {/* Tabs Navigation */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-2 mb-8 mt-8 inline-flex gap-2">
              {["students", "files", "activity", "alerts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${
                    activeTab === tab 
                      ? "bg-blue-500 text-white" 
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab === "alerts" ? `Alerts (${alerts.length})` : 
                   tab === "files" ? "Student Documents" : 
                   tab === "activity" ? "Activity Feed" : tab}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-16 text-center">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
            <p className="text-slate-400 mb-6">This project may have been deleted or you don't have access</p>
            <Button onClick={() => navigate("/teacher/projects")} className="bg-blue-500 hover:bg-blue-600">
              Back to Projects
            </Button>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && project && (
          students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <motion.div 
                  key={student.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar with live status dot */}
                      <div className="relative">
                        <div className={`w-12 h-12 ${student.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                          {student.avatar}
                        </div>
                        {isStudentLive(student.id) && (
                          <StatusDot status="editing" className="absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{student.name}</h3>
                          <ScoreBadge score={student.fairscore} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        {/* Show what they're editing */}
                        {isStudentLive(student.id) && getStudentActiveFile(student.id) && (
                          <EditingLabel fileName={getStudentActiveFile(student.id)!.fileName} />
                        )}
                      </div>
                    </div>
                    {student.isFreeRider && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Free-rider
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">FairScore</span>
                      <button
                        onClick={() => handleViewScore(student)}
                        className="text-blue-400 text-xs hover:text-blue-300"
                      >
                        View Breakdown
                      </button>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (student.fairscore ?? 0) >= 80 ? "bg-emerald-500" : 
                          (student.fairscore ?? 0) >= 60 ? "bg-blue-500" : 
                          (student.fairscore ?? 0) >= 40 ? "bg-yellow-500" : "bg-red-500"
                        }`} 
                        style={{ width: `${student.fairscore ?? 0}%` }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Words</p>
                      <p className="text-lg font-bold text-white">{student.wordsWritten.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Tasks</p>
                      <p className="text-lg font-bold text-white">{student.tasksCompleted}/{student.tasksTotal}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Meetings</p>
                      <p className="text-lg font-bold text-white">{student.meetingsAttended}/{student.meetingsTotal}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Peer Rating</p>
                      <p className="text-lg font-bold text-white">{student.peerRating}/5</p>
                    </div>
                  </div>

                  {student.flags.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {student.flags.map((flag, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                            flag.type === "ai" ? "bg-yellow-500/10 text-yellow-400" : 
                            flag.type === "plagiarism" ? "bg-orange-500/10 text-orange-400" : 
                            "bg-red-500/10 text-red-400"
                          }`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>{flag.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-white/10 border-white/10 text-white hover:bg-white/15">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600">
                      View Report
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-16 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No students in this project yet</p>
              <p className="text-slate-500 text-sm mt-1">Students will appear here once they join</p>
            </div>
          )
        )}

        {/* Student Documents Tab (renamed from Files) */}
        {activeTab === "files" && project && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-white text-lg font-semibold">Student Documents</h2>
              <p className="text-slate-400 text-sm mt-1">Files submitted by students for this project</p>
            </div>

            {/* Summary Stats */}
            {files.length > 0 && (
              <div className="flex gap-3 mb-6">
                <span className="bg-white/10 text-slate-300 text-xs px-3 py-1 rounded-full">
                  {files.length} files submitted
                </span>
                <span className="bg-white/10 text-slate-300 text-xs px-3 py-1 rounded-full">
                  {Object.keys(filesByStudent).length} students submitted
                </span>
                {studentsWithoutFiles.length > 0 && (
                  <span className="bg-red-500/15 text-red-400 text-xs px-3 py-1 rounded-full">
                    {studentsWithoutFiles.length} students haven't submitted
                  </span>
                )}
              </div>
            )}

            {files.length > 0 ? (
              <div className="space-y-6">
                {/* Files grouped by student */}
                {Object.values(filesByStudent).map((studentGroup) => (
                  <div key={studentGroup.studentId}>
                    {/* Student Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 ${studentGroup.studentColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                        {studentGroup.studentAvatar}
                      </div>
                      <div>
                        <span className="text-white font-medium">{studentGroup.studentName}</span>
                        <span className="text-slate-500 text-xs ml-2">Submitted {studentGroup.files.length} files</span>
                      </div>
                    </div>

                    {/* Student's Files */}
                    <div className="space-y-2 ml-11">
                      {studentGroup.files.map((file) => {
                        const fileLive = isFileLive(file.id);
                        const editors = getFileEditors(file.id);
                        
                        return (
                          <div
                            key={file.id}
                            className={`bg-white/[0.04] border rounded-xl p-4 flex items-center justify-between ${
                              fileLive ? "border-red-500/30" : "border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFileIconForType(file.mime_type)}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-medium">{file.name}</p>
                                  <LiveIndicator isLive={fileLive} editors={editors} />
                                </div>
                                {fileLive && editors.length > 0 ? (
                                  <p className="text-red-400 text-xs">{editors[0]} is editing now</p>
                                ) : (
                                  <p className="text-slate-500 text-xs">Submitted {formatDate(file.created_at)}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Tracking Status */}
                              {file.trackingStatus === "active" ? (
                                <span className="text-emerald-400 text-xs flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Tracking active
                                </span>
                              ) : (
                                <span className="text-yellow-400 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending access
                                </span>
                              )}

                              {/* Action Buttons */}
                              <Button
                                onClick={() => window.open(getGoogleFileUrl(file.drive_file_id, file.mime_type), "_blank")}
                                className={`bg-blue-500/15 text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-500/25 ${
                                  fileLive ? "border border-red-500/30" : ""
                                }`}
                              >
                                Open
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </Button>
                              <Button
                                onClick={() => navigate(`/teacher/live-replay/${id}/${file.id}`)}
                                className="bg-white/10 text-slate-300 px-3 py-2 rounded-lg text-sm hover:bg-white/15"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                View Replay
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Students who haven't submitted */}
                {studentsWithoutFiles.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-6">
                    <p className="text-white font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      {studentsWithoutFiles.length} students haven't submitted their documents yet
                    </p>
                    <p className="text-slate-300 text-sm mt-2">
                      {studentsWithoutFiles.map(s => s.name).join(", ")}
                    </p>
                    <Button
                      onClick={handleSendReminder}
                      disabled={isSendingReminder}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm mt-4"
                    >
                      {isSendingReminder ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4 mr-2" />
                      )}
                      Send Reminder
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No documents submitted yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Students will submit their Google Docs from their dashboard once they join the project
                </p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && project && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white text-lg font-semibold mb-6">Activity Feed</h2>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
                    <div className={`w-10 h-10 ${activity.userColor} rounded-full flex items-center justify-center text-white font-bold`}>
                      {activity.userAvatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-white">{activity.userName}</span>
                        <span className="text-slate-400"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.fileName} • {formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No activity yet</p>
                <p className="text-slate-500 text-sm mt-1">Activity will appear here as students work</p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && project && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white text-lg font-semibold mb-6">Alerts</h2>

            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "critical" ? "bg-red-500/10 border-red-500" :
                      alert.severity === "warning" ? "bg-yellow-500/10 border-yellow-500" :
                      "bg-blue-500/10 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === "critical" ? "text-red-400" :
                        alert.severity === "warning" ? "text-yellow-400" :
                        "text-blue-400"
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-white">{alert.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                        <p className="text-xs text-slate-500 mt-2">{formatRelativeTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                <p className="text-slate-400">No alerts</p>
                <p className="text-slate-500 text-sm mt-1">Everything looks good!</p>
              </div>
            )}
          </div>
        )}

        {/* Score Breakdown Modal */}
        {selectedStudent && project && (
          <ScoreBreakdownModal
            open={scoreModalOpen}
            onOpenChange={setScoreModalOpen}
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
            studentAvatar={selectedStudent.avatar}
            studentAvatarColor={selectedStudent.avatarColor}
            projectId={project.id}
            projectName={project.name}
            isTeacher={true}
          />
        )}
      </div>
    </TeacherLayout>
  );
}
