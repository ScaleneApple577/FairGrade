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

// TODO: Replace with API call to GET /api/student/dashboard
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
    contributionChange: 5,
    nextMeeting: {
      title: "Team Meeting",
      date: "Tomorrow",
      time: "2:00 PM",
    },
  },
  // TODO: Connect to GET /api/student/activity — returns recent activity feed
  recentActivity: [
    { id: "1", type: "task_completed" as const, title: "You completed task: Write introduction", project: "CS 101 Final Project", timestamp: "2 hours ago" },
    { id: "2", type: "meeting_checkin" as const, title: "You checked in to meeting: Project Kickoff", project: "Marketing Campaign", timestamp: "Yesterday" },
    { id: "3", type: "task_assigned" as const, title: "New task assigned: Review presentation", project: "Biology Lab Report", timestamp: "2 days ago" },
    { id: "4", type: "availability_marked" as const, title: "You marked yourself available: Feb 10, 2-4pm", project: "CS 101 Final Project", timestamp: "3 days ago" },
    { id: "5", type: "document_edited" as const, title: "Document edited: Research notes", project: "Marketing Campaign", timestamp: "3 days ago" },
  ],
  // TODO: Connect to GET /api/student/tasks — returns upcoming tasks list
  upcomingTasks: [
    { id: "1", title: "Complete literature review", project: "CS 101 Final Project", dueDate: "Tomorrow", priority: "high" as const, status: "in_progress" as const },
    { id: "2", title: "Design presentation slides", project: "Marketing Campaign", dueDate: "In 3 days", priority: "medium" as const, status: "todo" as const },
    { id: "3", title: "Proofread final report", project: "Biology Lab Report", dueDate: "In 5 days", priority: "low" as const, status: "todo" as const },
  ],
  // TODO: Connect to GET /api/student/calendar/week — returns this week's events from calendar
  thisWeekEvents: [
    { id: "1", title: "Team Meeting", date: "TUE", day: "3", startTime: "2:00 PM", endTime: "3:00 PM", type: "meeting" as const },
    { id: "2", title: "Sprint Review", date: "WED", day: "4", startTime: "10:00 AM", endTime: "11:00 AM", type: "meeting" as const },
    { id: "3", title: "Project Deadline", date: "FRI", day: "6", startTime: "11:59 PM", endTime: "", type: "deadline" as const },
  ],
  // TODO: Connect to GET /api/student/projects — returns student's projects list
  projects: [
    { id: "1", name: "CS 101 Final Project", course: "Computer Science", deadline: "Feb 15", health: "green" as const, myContributionScore: 82 },
    { id: "2", name: "Marketing Campaign", course: "Business 201", deadline: "Feb 20", health: "yellow" as const, myContributionScore: 65 },
    { id: "3", name: "Biology Lab Report", course: "Biology 150", deadline: "Feb 8", health: "red" as const, myContributionScore: 45 },
  ],
};

// Activity icon mapping
const getActivityIcon = (type: string) => {
  switch (type) {
    case "task_completed": return { icon: CheckCircle, bgColor: "bg-emerald-500/15", iconColor: "text-emerald-400" };
    case "meeting_checkin": return { icon: Calendar, bgColor: "bg-blue-500/15", iconColor: "text-blue-400" };
    case "task_assigned": return { icon: AlertCircle, bgColor: "bg-yellow-500/15", iconColor: "text-yellow-400" };
    case "availability_marked": return { icon: Clock, bgColor: "bg-purple-500/15", iconColor: "text-purple-400" };
    case "document_edited": return { icon: Edit3, bgColor: "bg-cyan-500/15", iconColor: "text-cyan-400" };
    default: return { icon: FileText, bgColor: "bg-white/10", iconColor: "text-slate-400" };
  }
};

// Priority badge styling
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "high": return { bg: "bg-red-500/15", text: "text-red-400", label: "High" };
    case "medium": return { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "Medium" };
    case "low": return { bg: "bg-slate-500/15", text: "text-slate-500", label: "Low" };
    default: return { bg: "bg-slate-500/15", text: "text-slate-500", label: priority };
  }
};

// Status badge styling
const getStatusStyles = (status: string) => {
  switch (status) {
    case "in_progress": return { bg: "bg-blue-500/15", text: "text-blue-400", label: "In Progress" };
    case "todo": return { bg: "bg-slate-500/15", text: "text-slate-400", label: "To Do" };
    case "review": return { bg: "bg-purple-500/15", text: "text-purple-400", label: "Review" };
    case "done": return { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Done" };
    default: return { bg: "bg-white/10", text: "text-slate-300", label: status };
  }
};

// Health indicator styling
const getHealthStyles = (health: string) => {
  switch (health) {
    case "green": return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500", label: "On Track", progressColor: "bg-emerald-500" };
    case "yellow": return { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500", label: "Needs Attention", progressColor: "bg-yellow-500" };
    case "red": return { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-500", label: "At Risk", progressColor: "bg-red-500" };
    default: return { bg: "bg-white/10", border: "border-white/10", text: "text-slate-400", dot: "bg-slate-500", label: "Unknown", progressColor: "bg-slate-500" };
  }
};

// Event type to color mapping
const getEventAccent = (type: string) => {
  switch (type) {
    case "meeting": return "bg-blue-500";
    case "deadline": return "bg-purple-500";
    case "review": return "bg-emerald-500";
    default: return "bg-slate-500";
  }
};

// Circular Progress Component for contribution score
function CircularProgress({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  // TODO: Replace with actual API call
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

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

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
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. WELCOME HEADER */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {dashboardData.student.firstName}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here's what's happening with your projects
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm">{formattedDate}</span>
          <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. STATS CARDS ROW */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="group bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboardData.stats.activeProjects}</p>
          <p className="text-slate-400 text-sm mb-2">Active Projects</p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+1 this month</span>
          </div>
        </motion.div>

        {/* Card 2: Contribution Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}
        >
          {/* Circular progress behind the content */}
          <div className="absolute top-3 right-3 opacity-50">
            <CircularProgress value={dashboardData.stats.contributionScore} size={60} strokeWidth={4} />
          </div>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-white">{dashboardData.stats.contributionScore}</span>
            <span className="text-slate-500 text-lg">/100</span>
          </div>
          <p className="text-slate-400 text-sm mb-2">Avg. Score</p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+{dashboardData.stats.contributionChange} vs last week</span>
          </div>
        </motion.div>

        {/* Card 3: Tasks Due */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboardData.stats.tasksDueSoon}</p>
          <p className="text-slate-400 text-sm mb-2">Tasks Due Soon</p>
          <div className="flex items-center gap-1 text-red-400 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{dashboardData.stats.tasksOverdue} overdue</span>
          </div>
        </motion.div>

        {/* Card 4: Next Meeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}
        >
          {/* TODO: Connect to GET /api/student/meetings/next — returns next meeting from calendar data */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{dashboardData.stats.nextMeeting.date}</p>
          <p className="text-slate-400 text-sm mb-2">Next Meeting</p>
          <div className="flex items-center gap-1 text-blue-400 text-xs mb-2">
            <Clock className="w-3 h-3" />
            <span>{dashboardData.stats.nextMeeting.time}</span>
          </div>
          <Link
            to="/student/calendar"
            className="flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition-colors"
          >
            <span>View Calendar</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. MAIN CONTENT — Two-column layout */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-1">
              {dashboardData.recentActivity.map((activity, index) => {
                const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
                const isLast = index === dashboardData.recentActivity.length - 1;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] hover:pl-4 transition-all duration-200 cursor-pointer ${!isLast ? "border-b border-white/5" : ""}`}
                  >
                    <div className={`w-9 h-9 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-slate-500 text-xs">{activity.project} • {activity.timestamp}</p>
                    </div>
                    <span className="text-slate-600 text-xs flex-shrink-0">{activity.timestamp.split(" ")[0]}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upcoming Tasks</h3>
              <span className="bg-white/10 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                {dashboardData.upcomingTasks.length} tasks
              </span>
            </div>
            <div className="space-y-3">
              {dashboardData.upcomingTasks.map((task, index) => {
                const priorityStyles = getPriorityStyles(task.priority);
                const statusStyles = getStatusStyles(task.status);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
                  >
                    {/* Checkbox circle (visual only) */}
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{task.title}</p>
                      <p className="text-slate-500 text-xs">{task.project} • Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles.bg} ${statusStyles.text}`}>
                        {statusStyles.label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityStyles.bg} ${priorityStyles.text}`}>
                        {priorityStyles.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (col-span-1) */}
        <div className="space-y-6">
          {/* This Week Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
            <div className="space-y-3">
              {dashboardData.thisWeekEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 bg-white/[0.03] rounded-xl p-3 hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
                >
                  {/* Left accent bar */}
                  <div className={`w-[3px] h-full min-h-[40px] rounded-full ${getEventAccent(event.type)}`} />
                  <div className="text-center min-w-[36px]">
                    <p className="text-blue-400 text-xs font-bold">{event.date}</p>
                    <p className="text-white text-lg font-bold">{event.day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-200 text-sm font-medium truncate">{event.title}</h4>
                    <p className="text-slate-500 text-xs">
                      {event.startTime}{event.endTime && ` - ${event.endTime}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/student/calendar">
              <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-xl transition-all duration-200">
                View Full Calendar
              </Button>
            </Link>
          </motion.div>

          {/* My Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">My Projects</h3>
              <Link
                to="/student/projects"
                className="flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData.projects.map((project) => {
                const healthStyles = getHealthStyles(project.health);
                const scoreColor = project.myContributionScore >= 75 
                  ? "text-emerald-400" 
                  : project.myContributionScore >= 50 
                    ? "text-yellow-400" 
                    : "text-red-400";
                return (
                  <div
                    key={project.id}
                    className={`${healthStyles.bg} border ${healthStyles.border} rounded-xl p-4 hover:bg-opacity-70 transition-all duration-200 cursor-pointer`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${healthStyles.dot}`} />
                      <span className={`text-xs font-medium ${healthStyles.text}`}>{healthStyles.label}</span>
                    </div>
                    <h4 className="text-white text-sm font-semibold mb-1">{project.name}</h4>
                    <p className="text-slate-500 text-xs mb-3">{project.course}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-500 text-xs">Due: {project.deadline}</span>
                      <span className={`text-sm font-semibold ${scoreColor}`}>
                        {project.myContributionScore}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${healthStyles.progressColor} transition-all duration-500`}
                        style={{ width: `${project.myContributionScore}%` }}
                      />
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
