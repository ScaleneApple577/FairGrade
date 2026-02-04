import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
  Video,
  MessageSquare,
  Check,
  Key,
  Copy,
  CheckCheck,
  Loader2,
  FolderOpen,
  Star,
  Settings,
  LogOut,
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

// Sidebar navigation items
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard", active: true },
  { icon: FolderOpen, label: "My Projects", path: "/student/projects" },
  { icon: Calendar, label: "Calendar", path: "/student/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/student/tasks" },
  { icon: Star, label: "Peer Reviews", path: "/student/reviews" },
  { icon: BarChart3, label: "My Stats", path: "/student/stats" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// Mock data
const studentData = {
  name: "Alice Kim",
  email: "alice.kim@school.edu",
  avatar: "AK",
};

const quickStats = [
  { label: "Active Projects", value: "2", icon: FolderOpen, trend: "+1 this month" },
  { label: "Tasks Due This Week", value: "5", icon: ListTodo, trend: "3 completed" },
  { label: "Contribution Score", value: "87%", icon: TrendingUp, trend: "+5% vs last week" },
  { label: "Peer Review Rating", value: "4.5", icon: Star, trend: "★★★★☆" },
];

const projects = [
  {
    id: "1",
    name: "CS 101 Final Project",
    course: "Computer Science 101",
    deadline: "12 days",
    contribution: 40,
    progress: 65,
    members: [
      { name: "You", initials: "AK" },
      { name: "Bob Lee", initials: "BL" },
      { name: "Charlie M.", initials: "CM" },
      { name: "Diana P.", initials: "DP" },
    ],
  },
  {
    id: "2",
    name: "MATH 250 Group Lab",
    course: "Mathematics 250",
    deadline: "3 days",
    contribution: 18,
    progress: 45,
    members: [
      { name: "You", initials: "AK" },
      { name: "Eve R.", initials: "ER" },
      { name: "Frank S.", initials: "FS" },
    ],
    urgent: true,
  },
];

const upcomingTasks = [
  { id: 1, name: "Complete research section", project: "CS 101 Final Project", due: "Tomorrow", priority: "High" },
  { id: 2, name: "Review teammate's code", project: "CS 101 Final Project", due: "In 2 days", priority: "Medium" },
  { id: 3, name: "Submit lab calculations", project: "MATH 250 Group Lab", due: "In 3 days", priority: "High" },
  { id: 4, name: "Prepare presentation slides", project: "CS 101 Final Project", due: "In 5 days", priority: "Low" },
  { id: 5, name: "Team meeting prep", project: "MATH 250 Group Lab", due: "In 6 days", priority: "Medium" },
];

const recentActivity = [
  { icon: FileText, title: 'Edited "Project_Draft.docx"', time: "2 hours ago", color: "bg-blue-50" },
  { icon: Video, title: "Attended Group Meeting", time: "Yesterday", color: "bg-green-50" },
  { icon: MessageSquare, title: "Sent 12 messages in Slack", time: "2 days ago", color: "bg-yellow-50" },
  { icon: Check, title: 'Completed Task: "Create outline"', time: "3 days ago", color: "bg-green-50" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

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

  const toggleTask = (taskId: number) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-50 text-red-600 border-red-200";
      case "Medium": return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "Low": return "bg-green-50 text-green-600 border-green-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-slate-900 font-bold text-xl">FairGrade</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                item.active
                  ? "bg-blue-50 border-l-4 border-primary text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary border-l-4 border-transparent hover:border-primary/50"
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.active ? "text-primary" : "group-hover:text-primary"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">Overview</span>
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
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {studentData.avatar}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{studentData.name}</p>
                  <p className="text-xs text-slate-500">{studentData.email}</p>
                </div>
              </div>

              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold">
                Sign Up Now
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Welcome back, {studentData.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className="text-xs text-primary">{stat.trend}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Projects */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Active Projects</h2>
                <Link to="/student/projects" className="text-primary hover:underline text-sm flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-white rounded-xl border ${project.urgent ? "border-red-200" : "border-slate-200"} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.course}</p>
                    </div>
                    <Badge className={project.urgent ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-600 border-slate-200"}>
                      Due in {project.deadline}
                    </Badge>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((member, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-700 border-2 border-white"
                        >
                          {member.initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-slate-500">{project.members.length} members</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-900 font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-primary text-sm font-medium">
                      Your contribution: {project.contribution}%
                    </p>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      View Details <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tasks Due Soon</h3>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                        completedTasks.includes(task.id) ? "bg-slate-50 opacity-60" : "hover:bg-slate-50"
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          completedTasks.includes(task.id)
                            ? "bg-primary border-primary"
                            : "border-slate-300 hover:border-primary"
                        }`}
                      >
                        {completedTasks.includes(task.id) && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${completedTasks.includes(task.id) ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {task.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{task.project}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{task.due}</span>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Extension Token Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Key className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Browser Extension</h3>
                </div>
                <p className="text-sm text-white/80 mb-4">
                  Track your contributions automatically with our Chrome extension.
                </p>
                <Button
                  onClick={generateExtensionToken}
                  disabled={isGenerating}
                  className="w-full bg-white text-primary hover:bg-slate-100 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Token"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Extension Token Generated</DialogTitle>
            <DialogDescription className="text-slate-500">
              Copy this token and paste it in the FairGrade Chrome extension.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm break-all text-slate-900">
              {generatedToken}
            </div>
            <Button
              onClick={copyToken}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {copied ? (
                <>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Token
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
