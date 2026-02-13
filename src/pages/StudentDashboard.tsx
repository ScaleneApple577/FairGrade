import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Key,
  Copy,
  CheckCheck,
  Loader2,
  FolderOpen,
  Bell,
  ArrowUpRight,
  ChevronRight,
  Edit3,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ProjectAssignmentBanner } from "@/components/student/ProjectAssignmentBanner";
import { ClassroomInvitationBanner } from "@/components/student/ClassroomInvitationBanner";
import { api, fetchProjectsWithFallback } from "@/lib/api";
import { fetchMyTasks, getStatusDisplay, Task } from "@/lib/taskUtils";
import { 
  getUpcomingAssignments, 
  getOverdueAssignments, 
  formatDueDate, 
  getAssignmentUrgency, 
  getUrgencyStyles,
  type Assignment 
} from "@/lib/assignmentUtils";

interface ProjectAssignment {
  id: string;
  notificationId: string;
  projectId: string;
  projectName: string;
  courseName: string;
  deadline: string;
  teamSize: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "task_completed": return { icon: CheckCircle, iconColor: "text-emerald-500" };
    case "meeting_checkin": return { icon: Calendar, iconColor: "text-blue-500" };
    case "task_assigned": return { icon: AlertCircle, iconColor: "text-amber-500" };
    case "availability_marked": return { icon: Clock, iconColor: "text-purple-500" };
    case "document_edited": return { icon: Edit3, iconColor: "text-cyan-500" };
    default: return { icon: FileText, iconColor: "text-gray-400" };
  }
};

const getStatusStyles = (status: string) => {
  const display = getStatusDisplay(status);
  const legacyMap: Record<string, string> = {
    'todo': 'open', 'in_progress': 'in_progress', 'review': 'in_progress', 'done': 'done',
  };
  const mappedStatus = legacyMap[status] || status;
  const mappedDisplay = getStatusDisplay(mappedStatus);
  return { bg: mappedDisplay.color.split(' ')[0], text: mappedDisplay.color.split(' ')[1], label: mappedDisplay.label };
};

const getHealthStyles = (health: string) => {
  switch (health) {
    case "green": return { text: "text-emerald-600", dot: "bg-emerald-500", label: "On Track", progressColor: "bg-emerald-500" };
    case "yellow": return { text: "text-yellow-600", dot: "bg-yellow-500", label: "Needs Attention", progressColor: "bg-yellow-500" };
    case "red": return { text: "text-red-600", dot: "bg-red-500", label: "At Risk", progressColor: "bg-red-500" };
    default: return { text: "text-gray-400", dot: "bg-gray-400", label: "Unknown", progressColor: "bg-gray-400" };
  }
};

function getScoreColor(score: number | null): string {
  if (score === null) return "bg-gray-300";
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-blue-500";
  if (score >= 25) return "bg-yellow-500";
  return "bg-red-500";
}

interface DashboardData {
  student: { firstName: string };
  stats: {
    activeProjects: number;
    assignmentsDueSoon: number;
    assignmentsOverdue: number;
    contributionScore: number | null;
    contributionChange: number;
    nextMeeting: { title: string; date: string; time: string } | null;
    achievementsUnlocked: number;
  };
  recentActivity: Array<{ id: string; type: string; title: string; project: string; timestamp: string }>;
  upcomingTasks: Array<{ id: number; title: string; project: string; status: string; dueDate?: string | null; priority?: string | null }>;
  thisWeekEvents: Array<{ id: string; title: string; date: string; day: string; startTime: string; endTime: string; type: string }>;
  projects: Array<{ id: string; name: string; course: string; deadline: string; health: string; myContributionScore: number }>;
  upcomingAssignments: Assignment[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);

  useEffect(() => {
    const fetchProjectAssignments = async () => {
      try {
        setProjectAssignments([]);
      } catch (error) {
        console.error("Failed to fetch project assignments:", error);
      }
    };
    fetchProjectAssignments();
  }, []);

  const handleDismissAssignment = async (notificationId: string) => {
    try {
      setProjectAssignments(prev => prev.filter(a => a.notificationId !== notificationId));
    } catch (error) {
      console.error("Failed to dismiss assignment:", error);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const upcomingAssignments = await getUpcomingAssignments(7);
        const overdueAssignments = await getOverdueAssignments();
        
        let projectCount = 0;
        try {
          const projectsData = await fetchProjectsWithFallback<{ id: string; name: string }>();
          projectCount = (projectsData || []).length;
        } catch {
          projectCount = 0;
        }
        
        setDashboardData({
          student: { firstName: "Student" },
          stats: {
            activeProjects: projectCount,
            assignmentsDueSoon: upcomingAssignments.length,
            assignmentsOverdue: overdueAssignments.length,
            contributionScore: null,
            contributionChange: 0,
            nextMeeting: null,
            achievementsUnlocked: 0,
          },
          recentActivity: [],
          upcomingTasks: [],
          thisWeekEvents: [],
          projects: [],
          upcomingAssignments: upcomingAssignments,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error("Failed to load dashboard data");
        setDashboardData({
          student: { firstName: "Student" },
          stats: { activeProjects: 0, assignmentsDueSoon: 0, assignmentsOverdue: 0, contributionScore: null, contributionChange: 0, nextMeeting: null, achievementsUnlocked: 0 },
          recentActivity: [], upcomingTasks: [], thisWeekEvents: [], projects: [], upcomingAssignments: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const generateExtensionToken = async () => {
    setIsGenerating(true);
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      if (!userId) { toast.error("You must be logged in to generate a token"); return; }
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      try { await api.post('/api/extension/token', { token }); } catch {}
      setGeneratedToken(token);
      setTokenModalOpen(true);
      toast.success("Extension token generated successfully");
    } catch (error) {
      toast.error("Failed to generate token");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = async () => {
    if (generatedToken) {
      await navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      </StudentLayout>
    );
  }

  const data = dashboardData!;

  const statItems = [
    { label: "Projects", value: data.stats.activeProjects, icon: FolderOpen, color: "text-blue-500" },
    { label: "Avg. Score", value: data.stats.contributionScore ?? "—", icon: TrendingUp, color: "text-emerald-500", extra: "/100", hasBar: true, barValue: data.stats.contributionScore },
    { label: "Due Soon", value: data.stats.assignmentsDueSoon, icon: CheckCircle, color: "text-amber-500", overdue: data.stats.assignmentsOverdue },
    { label: "Next Meeting", value: data.stats.nextMeeting ? data.stats.nextMeeting.date : "None", icon: Calendar, color: "text-purple-500", isSmall: true },
    { label: "Achievements", value: `${data.stats.achievementsUnlocked}`, icon: Trophy, color: "text-orange-500", extra: "/30", clickable: true },
  ];

  return (
    <StudentLayout pageTitle="Dashboard">
      <ClassroomInvitationBanner />
      <ProjectAssignmentBanner assignments={projectAssignments} onDismiss={handleDismissAssignment} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back{(() => {
              try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  const user = JSON.parse(storedUser);
                  const firstName = user.first_name || (user.fullName || user.name || '').split(' ')[0];
                  if (firstName) return `, ${firstName}`;
                }
              } catch {}
              return '';
            })()}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`bg-white rounded-xl p-4 shadow-sm card-hover ${stat.clickable ? 'cursor-pointer' : ''}`}
              onClick={stat.clickable ? () => navigate("/student/stats") : undefined}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-xs text-gray-500">{stat.label}</span>
                {stat.overdue > 0 && (
                  <span className="text-red-500 text-[10px] ml-auto">{stat.overdue} overdue</span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`${stat.isSmall ? 'text-sm' : 'text-xl'} font-semibold text-gray-900`}>{stat.value}</span>
                {stat.extra && <span className="text-xs text-gray-400">{stat.extra}</span>}
              </div>
              {stat.hasBar && (
                <div className="h-1 bg-gray-100 rounded-full w-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${getScoreColor(stat.barValue ?? null)} transition-all duration-500`} style={{ width: `${stat.barValue ?? 0}%` }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {data.recentActivity.length > 0 ? (
                <div className="space-y-0.5">
                  {data.recentActivity.map((activity) => {
                    const { icon: Icon, iconColor } = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.project} · {activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No recent activity</p>
                </div>
              )}
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Assignments</h3>
                <Link to="/student/calendar" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">View all</Link>
              </div>
              {data.upcomingAssignments.length > 0 ? (
                <div className="space-y-2">
                  {data.upcomingAssignments.map((assignment) => {
                    const urgency = getAssignmentUrgency(assignment);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 truncate">{assignment.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{assignment.classroom_name || 'Classroom'}</p>
                        </div>
                        <span className={`text-xs flex-shrink-0 ml-3 ${urgency === 'today' ? 'text-red-500' : urgency === 'soon' ? 'text-amber-500' : 'text-gray-400'}`}>
                          {formatDueDate(assignment.due_date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No upcoming assignments</p>
                </div>
              )}
            </div>

            {/* Project Tasks */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Project Tasks</h3>
              {data.upcomingTasks.length > 0 ? (
                <div className="space-y-1">
                  {data.upcomingTasks.map((task) => {
                    const statusStyles = getStatusStyles(task.status);
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.project}{task.dueDate ? ` · Due: ${task.dueDate}` : ''}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${statusStyles.bg} ${statusStyles.text}`}>
                          {statusStyles.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No tasks yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* This Week */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">This Week</h3>
              {data.thisWeekEvents.length > 0 ? (
                <div className="space-y-2">
                  {data.thisWeekEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="text-center min-w-[32px]">
                        <p className="text-blue-600 text-[10px] font-medium">{event.date}</p>
                        <p className="text-gray-900 text-sm font-semibold">{event.day}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.startTime}{event.endTime && ` – ${event.endTime}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No events this week</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={generateExtensionToken}
                  disabled={isGenerating}
                  className="w-full justify-start text-sm h-9 bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 shadow-none font-normal transition-all duration-150"
                >
                  <Key className="w-4 h-4 mr-2 text-gray-400" />
                  {isGenerating ? "Generating..." : "Generate Extension Token"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Extension Token</DialogTitle>
            <DialogDescription className="text-gray-500">
              Copy this token and paste it into the FairGrade browser extension.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <code className="flex-1 text-sm text-gray-700 break-all font-mono">
                {generatedToken}
              </code>
              <Button
                onClick={copyToken}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
