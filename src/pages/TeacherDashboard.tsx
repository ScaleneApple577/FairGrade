import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  FolderOpen,
  Activity,
  Bot,
  FileWarning,
  FileText,
  AlertCircle,
  Info,
  Loader2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { api } from "@/lib/api";

interface DashboardStats {
  activeProjects: number;
  totalStudents: number;
  atRiskProjects: number;
  flaggedIssues: number;
}

interface ProjectHealth {
  id: string;
  name: string;
  course: string;
  studentCount: number;
  deadline: string;
  status: "healthy" | "needs_attention" | "at_risk";
  riskScore: number;
  progress: number;
  issues: { type: string; description: string }[];
  positiveIndicators?: string[];
  metrics: { activityLevel: string; workBalance: string };
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard stats from API
        // const statsData = await api.get('/api/teacher/dashboard');
        // setStats(statsData);
        
        // Fetch project health
        // const healthData = await api.get('/api/teacher/projects/health');
        // setProjects(healthData);
        
        // Fetch alerts
        // const alertsData = await api.get('/api/teacher/alerts');
        // setAlerts(alertsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const getAlertConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { borderColor: "border-red-400", bgColor: "bg-red-500/10", icon: AlertTriangle, iconColor: "text-red-400" };
      case "warning":
        return { borderColor: "border-yellow-400", bgColor: "bg-yellow-500/10", icon: AlertCircle, iconColor: "text-yellow-400" };
      case "info":
        return { borderColor: "border-blue-400", bgColor: "bg-blue-500/10", icon: Info, iconColor: "text-blue-400" };
      default:
        return { borderColor: "border-slate-500", bgColor: "bg-white/5", icon: Info, iconColor: "text-slate-400" };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "free_rider": return AlertTriangle;
      case "ai_content": return Bot;
      case "plagiarism": return FileWarning;
      case "deadline": return Clock;
      case "conflict": return Users;
      case "milestone": return Info;
      default: return Info;
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) return false;
    if (courseFilter !== "all" && !project.course.toLowerCase().includes(courseFilter.toLowerCase())) return false;
    return true;
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
        {/* Welcome Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
            <p className="text-slate-400 mt-1">Here's what's happening with your courses</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/teacher/create")}
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Generating reports...")}
              className="flex items-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-white/15"
            >
              <Download className="w-4 h-4" />
              Export Reports
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats?.activeProjects ?? 0}</h3>
            <p className="text-slate-400 text-sm mb-2">Active Projects</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Info className="w-3 h-3" />
              <span>No new projects this week</span>
            </div>
          </motion.div>

          {/* Total Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/15 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats?.totalStudents ?? 0}</h3>
            <p className="text-slate-400 text-sm mb-2">Total Students</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Info className="w-3 h-3" />
              <span>Across all projects</span>
            </div>
          </motion.div>

          {/* At-Risk Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/15 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats?.atRiskProjects ?? 0}</h3>
            <p className="text-slate-400 text-sm mb-2">At-Risk Projects</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <CheckCircle className="w-3 h-3" />
              <span>No intervention needed</span>
            </div>
          </motion.div>

          {/* Flagged Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/15 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats?.flaggedIssues ?? 0}</h3>
            <p className="text-slate-400 text-sm mb-2">Flagged Issues</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <CheckCircle className="w-3 h-3" />
              <span>No alerts</span>
            </div>
          </motion.div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT COLUMN - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Health Monitoring Grid */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Project Health Overview</h2>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 bg-white/10 border border-white/10 text-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Projects</option>
                    <option value="healthy">Healthy Only</option>
                    <option value="needs_attention">Needs Attention</option>
                    <option value="at_risk">At Risk</option>
                  </select>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="px-3 py-1 bg-white/10 border border-white/10 text-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Courses</option>
                  </select>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Healthy - All metrics good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Needs Attention - Minor issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">At Risk - Critical issues</span>
                </div>
              </div>

              {/* Projects Grid or Empty State */}
              {filteredProjects.length > 0 ? (
                <div className="space-y-3">
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        project.status === "at_risk"
                          ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                          : project.status === "needs_attention"
                          ? "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15"
                          : "bg-green-500/10 border-green-500/20 hover:bg-green-500/15"
                      }`}
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-white">{project.name}</h3>
                            <span
                              className={`px-2 py-1 text-white text-xs rounded-full font-medium flex items-center gap-1 ${
                                project.status === "at_risk"
                                  ? "bg-red-500"
                                  : project.status === "needs_attention"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            >
                              {project.status === "at_risk" && <AlertTriangle className="w-3 h-3" />}
                              {project.status === "needs_attention" && <Clock className="w-3 h-3" />}
                              {project.status === "healthy" && <CheckCircle className="w-3 h-3" />}
                              {project.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {project.course} • {project.studentCount} students • Due {project.deadline}
                          </p>
                        </div>
                        <button className="px-3 py-1 rounded-lg text-sm font-medium bg-white/10 border border-white/10 text-white hover:bg-white/15">
                          View
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No projects to monitor yet</p>
                  <p className="text-slate-500 text-sm mt-1">Create your first project to see health metrics</p>
                  <Button
                    onClick={() => navigate("/teacher/create")}
                    className="mt-4 bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - 1/3 width */}
          <div className="space-y-6">
            {/* Recent Alerts */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Recent Alerts</h3>
                <button
                  onClick={() => navigate("/flags")}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All
                </button>
              </div>

              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => {
                    const config = getAlertConfig(alert.severity);
                    const AlertIcon = getAlertIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertIcon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{alert.title}</p>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
                            <p className="text-xs text-slate-500 mt-1">{alert.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No alerts</p>
                  <p className="text-slate-500 text-xs mt-1">Everything looks good!</p>
                </div>
              )}
            </div>

            {/* Live Activity Preview */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-white">Live Activity</h3>
                </div>
                <button
                  onClick={() => navigate("/teacher/live-monitor")}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No recent activity</p>
                <p className="text-slate-500 text-xs mt-1">Activity will appear here when students start working</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
