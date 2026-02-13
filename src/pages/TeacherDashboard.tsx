import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
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
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { LiveEditsNotification } from "@/components/live/LiveEditsNotification";
import { AssignmentsSection } from "@/components/teacher/AssignmentsSection";
import { CreateProjectWizard } from "@/components/project/CreateProjectWizard";

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const statGradients = [
  "bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]",
  "bg-gradient-to-br from-[#065f46] to-[#10b981]",
  "bg-gradient-to-br from-[#9a3412] to-[#f97316]",
  "bg-gradient-to-br from-[#581c87] to-[#a855f7]",
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showCreateProject, setShowCreateProject] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { liveEdits, totalActive } = useLiveStatus();

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard stats from API
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
        return { borderColor: "border-l-red-400", bgColor: "bg-red-500/10", icon: AlertTriangle, iconColor: "text-red-400" };
      case "warning":
        return { borderColor: "border-l-yellow-400", bgColor: "bg-yellow-500/10", icon: AlertCircle, iconColor: "text-yellow-400" };
      case "info":
        return { borderColor: "border-l-blue-400", bgColor: "bg-blue-500/10", icon: Info, iconColor: "text-blue-400" };
      default:
        return { borderColor: "border-l-white/10", bgColor: "bg-white/5", icon: Info, iconColor: "text-white/40" };
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
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  const statItems = [
    { label: "Active Projects", value: stats?.activeProjects ?? 0, icon: FolderOpen, watermark: FolderOpen },
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: Users, watermark: Users },
    { label: "At Risk", value: stats?.atRiskProjects ?? 0, icon: AlertTriangle, watermark: AlertTriangle },
    { label: "Flagged", value: stats?.flaggedIssues ?? 0, icon: FileText, watermark: FileText },
  ];

  return (
    <TeacherLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6"
      >
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Welcome back{(() => {
                try {
                  const storedUser = localStorage.getItem('user');
                  if (storedUser) {
                    const user = JSON.parse(storedUser);
                    const firstName = user.first_name || 
                      (user.fullName || user.name || '').split(' ')[0];
                    if (firstName) return `, ${firstName}`;
                  }
                } catch {}
                return '';
              })()}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 btn-gradient text-sm h-9 px-4 hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.success("Generating reports...")}
              className="flex items-center gap-2 btn-glass text-sm h-9 px-4"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`${statGradients[i]} rounded-2xl p-6 relative overflow-hidden card-hover cursor-default`}
            >
              <stat.watermark className="stat-watermark w-16 h-16 text-white" />
              <div className="relative z-10">
                <p className="text-white/70 text-xs font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Assignments Section */}
        <AssignmentsSection />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Health */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Project Health</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.06] text-white/60 rounded-lg text-xs transition-colors hover:border-white/10"
                >
                  <option value="all">All</option>
                  <option value="healthy">Healthy</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="at_risk">At Risk</option>
                </select>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="space-y-1">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all duration-200"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          project.status === "at_risk" ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" :
                          project.status === "needs_attention" ? "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-white">{project.name}</p>
                          <p className="text-xs text-white/40">{project.course} · {project.studentCount} students</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/30">Due {project.deadline}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No projects yet</p>
                  <Button
                    onClick={() => setShowCreateProject(true)}
                    className="mt-3 btn-gradient text-sm h-8 px-4"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Recent Alerts */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Alerts</h3>
                <button
                  onClick={() => navigate("/flags")}
                  className="text-xs text-white/30 hover:text-blue-400 transition-colors"
                >
                  View all
                </button>
              </div>

              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert) => {
                    const config = getAlertConfig(alert.severity);
                    const AlertIcon = getAlertIcon(alert.type);
                    return (
                      <div key={alert.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                        <AlertIcon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white">{alert.title}</p>
                          <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{alert.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-6 h-6 text-white/15 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No alerts</p>
                </div>
              )}
            </div>

            {/* Live Activity */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {totalActive > 0 && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />}
                  <h3 className="text-sm font-semibold text-white">Live Activity</h3>
                </div>
                <button
                  onClick={() => navigate("/teacher/live-monitor")}
                  className="text-xs text-white/30 hover:text-blue-400 transition-colors"
                >
                  View all
                </button>
              </div>

              {totalActive > 0 ? (
                <LiveEditsNotification
                  liveEdits={liveEdits}
                  totalActive={totalActive}
                  variant="dashboard"
                />
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-6 h-6 text-white/15 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No active students</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <CreateProjectWizard
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
    </TeacherLayout>
  );
}
