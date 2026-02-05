import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link} from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StudentLayout } from "@/components/student/StudentLayout";

// Mock dashboard data (simulating API response)
const mockDashboardData = {
  student: {
    firstName: "Sarah",
    lastName: "Johnson",
    avatar: "SJ",
  },
  stats: {
    activeProjects: 3,
    tasksDueSoon: 5,
    tasksOverdue: 2,
    contributionScore: 87,
    nextMeeting: {
      title: "Team Meeting",
      time: "Tomorrow 2:00 PM",
    },
  },
  recentActivity: [
    { id: "1", type: "task_completed" as const, title: "You completed task: Write introduction", project: "CS 101 Final Project", timestamp: "2 hours ago" },
    { id: "2", type: "meeting_checkin" as const, title: "You checked in to meeting: Project Kickoff", project: "Marketing Campaign", timestamp: "Yesterday" },
    { id: "3", type: "task_assigned" as const, title: "New task assigned: Review presentation", project: "Biology Lab Report", timestamp: "2 days ago" },
    { id: "4", type: "availability_marked" as const, title: "You marked yourself available: Feb 10, 2-4pm", project: "CS 101 Final Project", timestamp: "3 days ago" },
  ],
  upcomingTasks: [
    { id: "1", title: "Complete literature review", project: "CS 101 Final Project", dueDate: "Tomorrow", priority: "high" as const, status: "in_progress" as const },
    { id: "2", title: "Design presentation slides", project: "Marketing Campaign", dueDate: "In 3 days", priority: "medium" as const, status: "todo" as const },
    { id: "3", title: "Proofread final report", project: "Biology Lab Report", dueDate: "In 5 days", priority: "low" as const, status: "todo" as const },
  ],
  thisWeekEvents: [
    { id: "1", title: "Team Meeting", date: "TUE", day: "3", startTime: "2:00 PM", endTime: "3:00 PM", type: "meeting" as const, isToday: true },
    { id: "2", title: "Sprint Review", date: "WED", day: "4", startTime: "10:00 AM", endTime: "11:00 AM", type: "meeting" as const, isToday: false },
    { id: "3", title: "Project Deadline", date: "FRI", day: "6", startTime: "11:59 PM", endTime: "", type: "deadline" as const, isToday: false },
  ],
  projects: [
    { id: "1", name: "CS 101 Final Project", course: "Computer Science", deadline: "Feb 15", health: "green" as const, myContributionScore: 82 },
    { id: "2", name: "Marketing Campaign", course: "Business 201", deadline: "Feb 20", health: "yellow" as const, myContributionScore: 65 },
    { id: "3", name: "Biology Lab Report", course: "Biology 150", deadline: "Feb 8", health: "red" as const, myContributionScore: 45 },
  ],
};

// Activity icon mapping
const getActivityIcon = (type: string) => {
  switch (type) {
    case "task_completed": return { icon: CheckCircle, bgColor: "bg-green-500/15", iconColor: "text-green-500" };
    case "meeting_checkin": return { icon: Calendar, bgColor: "bg-blue-500/15", iconColor: "text-blue-500" };
    case "task_assigned": return { icon: AlertCircle, bgColor: "bg-yellow-500/15", iconColor: "text-yellow-500" };
    case "availability_marked": return { icon: Clock, bgColor: "bg-purple-500/15", iconColor: "text-purple-500" };
    default: return { icon: FileText, bgColor: "bg-white/10", iconColor: "text-slate-400" };
  }
};

// Priority badge styling
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "high": return { bg: "bg-red-500", text: "text-white", label: "High" };
    case "medium": return { bg: "bg-yellow-500", text: "text-white", label: "Medium" };
    case "low": return { bg: "bg-slate-500", text: "text-white", label: "Low" };
    default: return { bg: "bg-slate-500", text: "text-white", label: priority };
  }
};

// Status badge styling
const getStatusStyles = (status: string) => {
  switch (status) {
    case "in_progress": return { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "In Progress" };
    case "todo": return { bg: "bg-white/10", text: "text-slate-300", label: "To Do" };
    case "review": return { bg: "bg-blue-500/20", text: "text-blue-400", label: "Review" };
    case "done": return { bg: "bg-green-500/20", text: "text-green-400", label: "Done" };
    default: return { bg: "bg-white/10", text: "text-slate-300", label: status };
  }
};

// Health indicator styling
const getHealthStyles = (health: string) => {
  switch (health) {
    case "green": return { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-500", label: "On Track" };
    case "yellow": return { bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500", label: "Needs Attention" };
    case "red": return { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-500", label: "At Risk" };
    default: return { bg: "bg-white/10", text: "text-slate-400", dot: "bg-slate-500", label: "Unknown" };
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  // Simulate API fetch
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setDashboardData(mockDashboardData);
      setIsLoading(false);
    };
    fetchDashboard();
  }, []);

  const generateExtensionToken = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to generate a token");
        return;
      }

      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      await supabase
        .from("extension_tokens")
        .delete()
        .eq("student_id", user.id);

      const { error } = await supabase.from("extension_tokens").insert({
        student_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        toast.error("Failed to generate token");
        return;
      }

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
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <StudentLayout
      pageTitle="Dashboard"
      showExtensionButton={true}
      onGenerateToken={generateExtensionToken}
      isGeneratingToken={isGenerating}
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {dashboardData.student.firstName}!
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening with your projects</p>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.stats.activeProjects}</h3>
          <p className="text-slate-400 text-sm mb-2">Active Projects</p>
          <div className="flex items-center gap-1 text-xs text-green-500">
            <TrendingUp className="w-3 h-3" />
            <span>+1 this month</span>
          </div>
        </motion.div>

        {/* Tasks Due Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/15 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.stats.tasksDueSoon}</h3>
          <p className="text-slate-400 text-sm mb-2">Tasks Due Soon</p>
          <div className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            <span>{dashboardData.stats.tasksOverdue} overdue</span>
          </div>
        </motion.div>

        {/* Contribution Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/15 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.stats.contributionScore}/100</h3>
          <p className="text-slate-400 text-sm mb-2">Contribution Score</p>
          <div className="flex items-center gap-1 text-xs text-green-500">
            <TrendingUp className="w-3 h-3" />
            <span>+5 vs last week</span>
          </div>
        </motion.div>

        {/* Next Meeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/15 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Tomorrow</h3>
          <p className="text-slate-400 text-sm mb-2">Next Meeting</p>
          <div className="flex items-center gap-1 text-xs text-blue-500">
            <Clock className="w-3 h-3" />
            <span>2:00 PM</span>
          </div>
        </motion.div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => {
                const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.project} • {activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {dashboardData.upcomingTasks.map((task) => {
                const priorityStyles = getPriorityStyles(task.priority);
                const statusStyles = getStatusStyles(task.status);
                return (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{task.title}</h4>
                      <p className="text-xs text-slate-500">{task.project} • Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles.bg} ${statusStyles.text}`}>
                        {statusStyles.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyles.bg} ${priorityStyles.text}`}>
                        {priorityStyles.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">
          {/* This Week Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
            <div className="space-y-3">
              {dashboardData.thisWeekEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-center min-w-[40px]">
                    <p className="text-xs font-semibold text-blue-400">{event.date}</p>
                    <p className="text-lg font-bold text-white">{event.day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
                    <p className="text-xs text-slate-400">{event.startTime}{event.endTime && ` - ${event.endTime}`}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/student/calendar">
              <Button className="w-full mt-4 bg-blue-500 text-white hover:bg-blue-600">
                View Full Calendar
              </Button>
            </Link>
          </motion.div>

          {/* My Projects Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">My Projects</h3>
            <div className="space-y-3">
              {dashboardData.projects.map((project) => {
                const healthStyles = getHealthStyles(project.health);
                return (
                  <div key={project.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${healthStyles.dot}`} />
                      <span className={`text-xs font-medium ${healthStyles.text}`}>{healthStyles.label}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{project.name}</h4>
                    <p className="text-xs text-slate-500">{project.course}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">Due: {project.deadline}</span>
                      <span className={`text-sm font-semibold ${project.myContributionScore >= 70 ? "text-green-400" : project.myContributionScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {project.myContributionScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#1e293b] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Extension Token Generated</DialogTitle>
            <DialogDescription className="text-slate-400">
              Copy this token and paste it into the FairGrade browser extension.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <code className="flex-1 p-3 bg-white/10 rounded-lg text-sm font-mono text-blue-400 overflow-x-auto">
              {generatedToken}
            </code>
            <Button onClick={copyToken} variant="outline" size="icon" className="border-white/10 text-white hover:bg-white/10">
              {copied ? <CheckCheck className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            This token expires in 90 days. Keep it private!
          </p>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
