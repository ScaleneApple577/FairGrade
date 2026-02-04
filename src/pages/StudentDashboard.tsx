import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Check,
  Key,
  Copy,
  CheckCheck,
  Loader2,
  FolderOpen,
  Star,
  LogOut,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MenuVertical } from "@/components/ui/menu-vertical";

// Sidebar navigation items
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: FolderOpen, label: "My Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Peer Reviews", href: "/student/reviews" },
  { icon: BarChart3, label: "My Stats", href: "/student/stats" },
];

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
    case "task_completed": return { icon: CheckCircle, bgColor: "bg-green-100", iconColor: "text-green-500" };
    case "meeting_checkin": return { icon: Calendar, bgColor: "bg-blue-100", iconColor: "text-blue-500" };
    case "task_assigned": return { icon: AlertCircle, bgColor: "bg-yellow-100", iconColor: "text-yellow-500" };
    case "availability_marked": return { icon: Clock, bgColor: "bg-purple-100", iconColor: "text-purple-500" };
    default: return { icon: FileText, bgColor: "bg-slate-100", iconColor: "text-slate-500" };
  }
};

// Priority badge styling
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "high": return { bg: "bg-red-500", text: "text-white", label: "High" };
    case "medium": return { bg: "bg-yellow-500", text: "text-white", label: "Medium" };
    case "low": return { bg: "bg-slate-400", text: "text-white", label: "Low" };
    default: return { bg: "bg-slate-400", text: "text-white", label: priority };
  }
};

// Status badge styling
const getStatusStyles = (status: string) => {
  switch (status) {
    case "in_progress": return { bg: "bg-yellow-100", text: "text-yellow-700", label: "In Progress" };
    case "todo": return { bg: "bg-slate-100", text: "text-slate-600", label: "To Do" };
    case "review": return { bg: "bg-blue-100", text: "text-blue-700", label: "Review" };
    case "done": return { bg: "bg-green-100", text: "text-green-700", label: "Done" };
    default: return { bg: "bg-slate-100", text: "text-slate-600", label: status };
  }
};

// Health indicator styling
const getHealthStyles = (health: string) => {
  switch (health) {
    case "green": return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "On Track" };
    case "yellow": return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Needs Attention" };
    case "red": return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "At Risk" };
    default: return { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", label: "Unknown" };
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // In production, this would be: 
      // const response = await fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` }});
      // const data = await response.json();
      setDashboardData(mockDashboardData);
      setIsLoading(false);
    };
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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

  const isActive = (path: string) => location.pathname === path;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11 flex-shrink-0">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path 
                  d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M10 10 L10 42 Q10 44 8 43.5" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-slate-900">Fair</span>
              <span className="text-blue-500">Grade</span>
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <MenuVertical menuItems={sidebarItems} />
        </div>

        {/* Extension Token Button */}
        <div className="px-4 pb-2">
          <Button
            onClick={generateExtensionToken}
            disabled={isGenerating}
            variant="outline"
            className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Get Extension Token
          </Button>
        </div>

        {/* Log Out */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 min-h-screen bg-slate-50 flex-1">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  className="w-64 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {dashboardData.student.avatar}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">
                    {dashboardData.student.firstName} {dashboardData.student.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {dashboardData.student.firstName}!
            </h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your projects</p>
          </motion.div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardData.stats.activeProjects}</h3>
              <p className="text-slate-600 text-sm mb-2">Active Projects</p>
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
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardData.stats.tasksDueSoon}</h3>
              <p className="text-slate-600 text-sm mb-2">Tasks Due Soon</p>
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
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardData.stats.contributionScore}/100</h3>
              <p className="text-slate-600 text-sm mb-2">Contribution Score</p>
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
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Tomorrow</h3>
              <p className="text-slate-600 text-sm mb-2">Next Meeting</p>
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
              {/* Recent Activity Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => {
                    const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{activity.project}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Upcoming Tasks Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Upcoming Tasks</h2>
                  <Link to="/student/tasks" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {dashboardData.upcomingTasks.map((task, index) => {
                    const priorityStyle = getPriorityStyles(task.priority);
                    const statusStyle = getStatusStyles(task.status);
                    const isHighPriority = task.priority === "high";
                    
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          isHighPriority 
                            ? "bg-red-50 border border-red-200" 
                            : "border border-slate-200 hover:bg-slate-50 transition-colors"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{task.title}</h3>
                            <span className={`px-2 py-0.5 ${priorityStyle.bg} ${priorityStyle.text} text-xs rounded-full`}>
                              {priorityStyle.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-600">{task.project}</span>
                            <span className="text-slate-400">•</span>
                            <span className={isHighPriority ? "text-red-500 font-medium" : "text-slate-500"}>
                              Due {task.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 ${statusStyle.bg} ${statusStyle.text} text-xs rounded-full font-medium`}>
                            {statusStyle.label}
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
              {/* Mini Calendar Widget */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h3 className="font-bold text-slate-900 mb-4">This Week</h3>
                <div className="space-y-2 mb-4">
                  {dashboardData.thisWeekEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        event.isToday 
                          ? "bg-blue-50 border border-blue-200" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-xs font-medium ${event.isToday ? "text-blue-600" : "text-slate-500"}`}>
                          {event.date}
                        </div>
                        <div className={`text-lg font-bold ${event.isToday ? "text-blue-600" : "text-slate-700"}`}>
                          {event.day}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{event.title}</div>
                        <div className="text-xs text-slate-500">
                          {event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/student/calendar"
                  className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  View Full Calendar
                </Link>
              </motion.div>

              {/* Project Health Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-slate-900">My Projects</h3>
                {dashboardData.projects.map((project) => {
                  const healthStyle = getHealthStyles(project.health);
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{project.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{project.course}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 ${healthStyle.bg} ${healthStyle.text} rounded-full text-xs font-medium`}>
                          <div className={`w-2 h-2 ${healthStyle.dot} rounded-full`}></div>
                          {healthStyle.label}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Due {project.deadline}</span>
                        <span className="font-semibold text-blue-600">{project.myContributionScore}/100</span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Extension Token Generated</DialogTitle>
            <DialogDescription className="text-slate-600">
              Copy this token and paste it into the FairGrade browser extension. This token expires in 90 days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg p-3 font-mono text-sm text-slate-900 break-all">
                {generatedToken}
              </div>
              <Button
                onClick={copyToken}
                variant="outline"
                size="icon"
                className="flex-shrink-0 border-slate-300"
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-600" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Keep this token secure. Anyone with this token can submit activity data on your behalf.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
