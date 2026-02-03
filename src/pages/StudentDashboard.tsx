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
  { icon: FileText, title: 'Edited "Project_Draft.docx"', time: "2 hours ago", color: "bg-blue-500" },
  { icon: Video, title: "Attended Group Meeting", time: "Yesterday", color: "bg-green-500" },
  { icon: MessageSquare, title: "Sent 12 messages in Slack", time: "2 days ago", color: "bg-yellow-500" },
  { icon: Check, title: 'Completed Task: "Create outline"', time: "3 days ago", color: "bg-green-500" },
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
      case "High": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-white font-bold text-xl">FairGrade</span>
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
                  ? "bg-blue-500/20 border-l-4 border-blue-500 text-white"
                  : "text-zinc-400 hover:bg-blue-500/10 hover:text-white border-l-4 border-transparent hover:border-blue-500/50"
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.active ? "text-blue-500" : "group-hover:text-blue-400"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-white">Dashboard</h1>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">Overview</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search..."
                  className="w-64 pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>

              <button className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-zinc-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {studentData.avatar}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{studentData.name}</p>
                  <p className="text-xs text-zinc-500">{studentData.email}</p>
                </div>
              </div>

              <Button className="bg-white text-black hover:bg-zinc-200 font-semibold">
                Get Started Free
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
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {studentData.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-zinc-400">
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
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <stat.icon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-xs text-blue-400">{stat.trend}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Projects */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Active Projects</h2>
                <Link to="/student/projects" className="text-blue-400 hover:underline text-sm flex items-center gap-1">
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
                  className={`bg-zinc-900 rounded-xl border ${project.urgent ? "border-red-500/50" : "border-zinc-800"} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-zinc-500">{project.course}</p>
                    </div>
                    <Badge className={project.urgent ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-zinc-800 text-zinc-400"}>
                      Due in {project.deadline}
                    </Badge>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((member, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-zinc-900"
                        >
                          {member.initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-zinc-500">{project.members.length} members</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-blue-400 text-sm font-medium">
                      Your contribution: {project.contribution}%
                    </p>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
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
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Tasks Due Soon</h3>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                        completedTasks.includes(task.id) ? "bg-zinc-800/50 opacity-60" : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          completedTasks.includes(task.id)
                            ? "bg-blue-500 border-blue-500"
                            : "border-zinc-600 hover:border-blue-500"
                        }`}
                      >
                        {completedTasks.includes(task.id) && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${completedTasks.includes(task.id) ? "text-zinc-500 line-through" : "text-white"}`}>
                          {task.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{task.project}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-400">{task.due}</span>
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
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <button className="text-blue-400 hover:underline text-sm">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 group cursor-pointer">
                      <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white group-hover:text-blue-400 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-zinc-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Peer Review Reminder */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Pending Reviews</p>
                    <p className="text-sm text-zinc-400">You have 2 peer reviews</p>
                  </div>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Review Now
                </Button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Extension Token Generated</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Copy this token and paste it into the FairGrade browser extension.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <code className="flex-1 text-sm text-blue-400 font-mono break-all">
                {generatedToken}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToken}
                className="text-zinc-400 hover:text-white"
              >
                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              This token expires in 90 days. Keep it secure.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
