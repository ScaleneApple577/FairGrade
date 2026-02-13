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
    case "task_completed": return { icon: CheckCircle, iconColor: "text-emerald-400" };
    case "meeting_checkin": return { icon: Calendar, iconColor: "text-blue-400" };
    case "task_assigned": return { icon: AlertCircle, iconColor: "text-yellow-400" };
    case "availability_marked": return { icon: Clock, iconColor: "text-purple-400" };
    case "document_edited": return { icon: Edit3, iconColor: "text-cyan-400" };
    default: return { icon: FileText, iconColor: "text-[#8b949e]" };
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
    case "green": return { text: "text-emerald-400", dot: "bg-emerald-500", label: "On Track", progressColor: "bg-emerald-500" };
    case "yellow": return { text: "text-yellow-400", dot: "bg-yellow-500", label: "Needs Attention", progressColor: "bg-yellow-500" };
    case "red": return { text: "text-red-400", dot: "bg-red-500", label: "At Risk", progressColor: "bg-red-500" };
    default: return { text: "text-[#8b949e]", dot: "bg-[#8b949e]", label: "Unknown", progressColor: "bg-[#8b949e]" };
  }
};

function getScoreColor(score: number | null): string {
  if (score === null) return "bg-[#8b949e]";
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
          <Loader2 className="w-5 h-5 animate-spin text-[#8b949e]" />
        </div>
      </StudentLayout>
    );
  }

  const data = dashboardData!;

  return (
    <StudentLayout pageTitle="Dashboard">
      <ClassroomInvitationBanner />
      <ProjectAssignmentBanner assignments={projectAssignments} onDismiss={handleDismissAssignment} />

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">
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
        <div className="bg-white/[0.03] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-3.5 h-3.5 text-[#8b949e]" />
            <span className="text-xs text-[#8b949e]">Projects</span>
          </div>
          <p className="text-xl font-semibold text-white">{data.stats.activeProjects}</p>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#8b949e]" />
            <span className="text-xs text-[#8b949e]">Avg. Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-white">{data.stats.contributionScore ?? "—"}</span>
            <span className="text-xs text-[#8b949e]">/100</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full w-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${getScoreColor(data.stats.contributionScore)} transition-all duration-500`} style={{ width: `${data.stats.contributionScore ?? 0}%` }} />
          </div>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#8b949e]" />
              <span className="text-xs text-[#8b949e]">Due Soon</span>
            </div>
            {data.stats.assignmentsOverdue > 0 && (
              <span className="text-red-400 text-[10px]">{data.stats.assignmentsOverdue} overdue</span>
            )}
          </div>
          <p className="text-xl font-semibold text-white">{data.stats.assignmentsDueSoon}</p>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#8b949e]" />
            <span className="text-xs text-[#8b949e]">Next Meeting</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {data.stats.nextMeeting ? data.stats.nextMeeting.date : "None"}
          </p>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-4 cursor-pointer hover:bg-white/[0.05] transition-colors" onClick={() => navigate("/student/stats")}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-3.5 h-3.5 text-[#8b949e]" />
            <span className="text-xs text-[#8b949e]">Achievements</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-white">{data.stats.achievementsUnlocked}</span>
            <span className="text-xs text-[#8b949e]">/30</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Activity */}
          <div className="bg-white/[0.03] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
            {data.recentActivity.length > 0 ? (
              <div className="space-y-0.5">
                {data.recentActivity.map((activity) => {
                  const { icon: Icon, iconColor } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.title}</p>
                        <p className="text-xs text-[#8b949e]">{activity.project} · {activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText className="w-6 h-6 text-[#8b949e]/40 mx-auto mb-2" />
                <p className="text-xs text-[#8b949e]">No recent activity</p>
              </div>
            )}
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white/[0.03] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Upcoming Assignments</h3>
              <Link to="/student/calendar" className="text-xs text-[#8b949e] hover:text-white transition-colors">View all</Link>
            </div>
            {data.upcomingAssignments.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingAssignments.map((assignment) => {
                  const urgency = getAssignmentUrgency(assignment);
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-md hover:bg-white/[0.03] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{assignment.title}</p>
                        <p className="text-xs text-[#8b949e] mt-0.5">{assignment.classroom_name || 'Classroom'}</p>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-3 ${urgency === 'today' ? 'text-red-400' : urgency === 'soon' ? 'text-yellow-400' : 'text-[#8b949e]'}`}>
                        {formatDueDate(assignment.due_date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="w-6 h-6 text-[#8b949e]/40 mx-auto mb-2" />
                <p className="text-xs text-[#8b949e]">No upcoming assignments</p>
              </div>
            )}
          </div>

          {/* Project Tasks */}
          <div className="bg-white/[0.03] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Project Tasks</h3>
            {data.upcomingTasks.length > 0 ? (
              <div className="space-y-1">
                {data.upcomingTasks.map((task) => {
                  const statusStyles = getStatusStyles(task.status);
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="w-4 h-4 rounded border border-white/20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{task.title}</p>
                        <p className="text-xs text-[#8b949e]">{task.project}{task.dueDate ? ` · Due: ${task.dueDate}` : ''}</p>
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
                <CheckCircle className="w-6 h-6 text-[#8b949e]/40 mx-auto mb-2" />
                <p className="text-xs text-[#8b949e]">No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* This Week */}
          <div className="bg-white/[0.03] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-4">This Week</h3>
            {data.thisWeekEvents.length > 0 ? (
              <div className="space-y-2">
                {data.thisWeekEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-2.5 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <div className="text-center min-w-[32px]">
                      <p className="text-blue-400 text-[10px] font-medium">{event.date}</p>
                      <p className="text-white text-sm font-semibold">{event.day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{event.title}</p>
                      <p className="text-xs text-[#8b949e]">{event.startTime}{event.endTime && ` – ${event.endTime}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-6 h-6 text-[#8b949e]/40 mx-auto mb-2" />
                <p className="text-xs text-[#8b949e]">No events this week</p>
              </div>
            )}
            <Link to="/student/calendar">
              <Button className="w-full mt-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium h-8 rounded-md transition-colors">
                View Calendar
              </Button>
            </Link>
          </div>

          {/* My Projects */}
          <div className="bg-white/[0.03] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">My Projects</h3>
              <Link to="/student/projects" className="text-xs text-[#8b949e] hover:text-white transition-colors">
                View all
              </Link>
            </div>
            {data.projects.length > 0 ? (
              <div className="space-y-2">
                {data.projects.map((project) => {
                  const healthStyles = getHealthStyles(project.health);
                  return (
                    <div key={project.id} className="p-3 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${healthStyles.dot}`} />
                        <span className={`text-[10px] font-medium ${healthStyles.text}`}>{healthStyles.label}</span>
                      </div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-[#8b949e] mt-0.5">{project.course}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-[#8b949e]">Due: {project.deadline}</span>
                        <span className={`text-xs font-medium ${project.myContributionScore >= 75 ? 'text-emerald-400' : project.myContributionScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {project.myContributionScore}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mt-1.5">
                        <div className={`h-full rounded-full ${healthStyles.progressColor} transition-all duration-500`} style={{ width: `${project.myContributionScore}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-6 h-6 text-[#8b949e]/40 mx-auto mb-2" />
                <p className="text-xs text-[#8b949e]">No projects yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="sm:max-w-md bg-[hsl(220,13%,10%)] border border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Extension Token Generated</DialogTitle>
            <DialogDescription className="text-[#8b949e] text-sm">
              Copy this token and paste it into the FairGrade browser extension.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <code className="flex-1 p-3 bg-white/[0.06] rounded-md text-sm font-mono text-blue-400 overflow-x-auto">
              {generatedToken}
            </code>
            <Button onClick={copyToken} variant="ghost" size="icon" className="text-[#8b949e] hover:text-white hover:bg-white/[0.06]">
              {copied ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-[#8b949e] mt-2">This token expires in 90 days.</p>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
