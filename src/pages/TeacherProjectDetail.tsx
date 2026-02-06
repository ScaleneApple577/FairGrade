import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import {
  ChevronRight,
  Edit,
  Download,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Users,
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Activity,
  FileText,
  Settings,
  LogOut,
  Mail,
  Play,
  ExternalLink,
  Plus,
  X,
  Info,
  Table,
  Presentation,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// TODO: Connect to GET http://localhost:8000/api/projects/{project_id}
// TODO: Connect to GET http://localhost:8000/api/projects/{project_id}/students
// TODO: Connect to GET http://localhost:8000/api/projects/{project_id}/files

// Sidebar navigation items
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen, label: "All Projects", path: "/teacher/projects" },
  { icon: Users, label: "Students", path: "/teacher/students" },
  { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
  { icon: Activity, label: "Live Activity", path: "/teacher/live-monitor" },
  { icon: FileText, label: "Reports", path: "/teacher/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface Project {
  id: string;
  name: string;
  course: string;
  description: string;
  deadline: string;
  status: "healthy" | "needs_attention" | "at_risk";
  studentCount: number;
  progress: number;
  riskScore: number;
  daysRemaining: number;
  flaggedIssues: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  score: number;
  wordsWritten: number;
  tasksCompleted: number;
  tasksTotal: number;
  meetingsAttended: number;
  meetingsTotal: number;
  peerRating: number;
  isFreeRider: boolean;
  flags: { type: string; message: string }[];
}

interface TrackedFile {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  contributors: string[];
}

export default function TeacherProjectDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("students");
  const [showAddFile, setShowAddFile] = useState(false);

  // Data states
  const [project, setProject] = useState<Project | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [files, setFiles] = useState<TrackedFile[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/projects/{project_id}
    // fetch(`http://localhost:8000/api/projects/${id}`)
    //   .then(res => res.json())
    //   .then(data => { setProject(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/projects/{project_id}/students
  }, [id]);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/projects/{project_id}/files
  }, [id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

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

  const getFileIcon = (type: string) => {
    switch (type) {
      case "google_doc": return "📄";
      case "google_sheet": return "📊";
      case "google_slide": return "📽";
      default: return "📄";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-11">
                <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                  <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl font-bold">
                <span className="text-slate-900">Fair</span>
                <span className="text-blue-500">Grade</span>
              </span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path) ? "bg-blue-50 border-r-4 border-blue-500 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
                <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-blue-600" : ""}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-slate-900">Fair</span>
              <span className="text-blue-500">Grade</span>
            </span>
          </Link>
          <div className="mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Teacher</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path) ? "bg-blue-50 border-r-4 border-blue-500 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-blue-600" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <Link to="/teacher/projects" className="hover:text-blue-600">All Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">{project?.name || "Project"}</span>
        </div>

        {project ? (
          <>
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      project.status === "healthy" ? "bg-green-500 text-white" :
                      project.status === "needs_attention" ? "bg-yellow-500 text-white" :
                      "bg-red-500 text-white"
                    }`}>
                      {project.status === "healthy" && <CheckCircle className="w-4 h-4" />}
                      {project.status === "needs_attention" && <Clock className="w-4 h-4" />}
                      {project.status === "at_risk" && <AlertTriangle className="w-4 h-4" />}
                      {project.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-slate-600">{project.course} • Due {formatDate(project.deadline)}</p>
                  <p className="text-sm text-slate-500 mt-2">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-slate-300">
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
              <div className="grid grid-cols-5 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.studentCount}</p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.progress}%</p>
                  <p className="text-xs text-slate-500">Progress</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${project.riskScore > 70 ? "text-red-600" : project.riskScore > 40 ? "text-yellow-600" : "text-green-600"}`}>
                    {project.riskScore}
                  </p>
                  <p className="text-xs text-slate-500">Risk Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.daysRemaining}</p>
                  <p className="text-xs text-slate-500">Days Left</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{project.flaggedIssues}</p>
                  <p className="text-xs text-slate-500">Flagged Issues</p>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 mb-8 inline-flex gap-2">
              {["students", "files", "activity", "alerts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${activeTab === tab ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {tab === "alerts" ? `Alerts (${alerts.length})` : tab === "files" ? "Tracked Files" : tab === "activity" ? "Activity Feed" : tab}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-16 text-center">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
            <p className="text-slate-500 mb-6">This project may have been deleted or you don't have access</p>
            <Button onClick={() => navigate("/teacher/projects")} className="bg-blue-500 hover:bg-blue-600">
              Back to Projects
            </Button>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${student.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>{student.avatar}</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{student.name}</h3>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </div>
                    </div>
                    {student.isFreeRider && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Free-rider
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Contribution Score</span>
                      <span className={`text-2xl font-bold ${student.score >= 80 ? "text-green-600" : student.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>{student.score}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${student.score >= 80 ? "bg-green-500" : student.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${student.score}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Words</p>
                      <p className="text-lg font-bold text-slate-900">{student.wordsWritten.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Tasks</p>
                      <p className="text-lg font-bold text-slate-900">{student.tasksCompleted}/{student.tasksTotal}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Meetings</p>
                      <p className="text-lg font-bold text-slate-900">{student.meetingsAttended}/{student.meetingsTotal}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Peer Rating</p>
                      <p className="text-lg font-bold text-slate-900">{student.peerRating}/5</p>
                    </div>
                  </div>

                  {student.flags.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {student.flags.map((flag, idx) => (
                        <div key={idx} className={`p-2 rounded-lg text-xs flex items-center gap-2 ${flag.type === "ai" ? "bg-yellow-50 text-yellow-700" : flag.type === "plagiarism" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>
                          <AlertCircle className="w-3 h-3" />
                          <span>{flag.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-slate-300">
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
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No students in this project yet</p>
              <p className="text-slate-400 text-sm mt-1">Students will appear here once they join</p>
            </div>
          )
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Tracked Files</h2>
              <Button onClick={() => setShowAddFile(true)} className="bg-blue-500 hover:bg-blue-600" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add File
              </Button>
            </div>

            {files.length > 0 ? (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:bg-white/[0.05] transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-slate-500 text-xs">Last edited {formatRelativeTime(file.lastModified)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {file.contributors.slice(0, 4).map((initial, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                            {initial}
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => navigate(`/teacher/live-replay/${file.id}`)}
                        className="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        View Replay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No tracked files yet</p>
                <p className="text-slate-500 text-sm mt-1">Connect Google Drive to start monitoring</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Activity Feed</h2>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 ${activity.userColor} rounded-full flex items-center justify-center text-white font-bold`}>
                      {activity.userAvatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-slate-900">{activity.userName}</span>
                        <span className="text-slate-600"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.fileName} • {formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No activity yet</p>
                <p className="text-slate-400 text-sm mt-1">Activity will appear here as students work</p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Alerts</h2>

            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === "critical" ? "bg-red-50 border-red-500" :
                    alert.severity === "warning" ? "bg-yellow-50 border-yellow-500" :
                    "bg-blue-50 border-blue-500"
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === "critical" ? "text-red-500" :
                        alert.severity === "warning" ? "text-yellow-500" :
                        "text-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{alert.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-slate-500 mt-2">{formatRelativeTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500">No alerts</p>
                <p className="text-slate-400 text-sm mt-1">Everything looks good!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
