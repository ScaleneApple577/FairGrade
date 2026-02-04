import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Flag,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Search,
  ChevronRight,
  Activity,
  Zap,
  Bot,
  FileWarning,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

// Sidebar navigation items for teachers
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: true },
  { icon: FolderOpen, label: "All Projects", path: "/dashboard/projects" },
  { icon: Users, label: "Students", path: "/dashboard/students" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Eye, label: "Live Monitoring", path: "/live-monitor" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// Mock data
const teacherData = {
  name: "Dr. Sarah Johnson",
  email: "s.johnson@university.edu",
  avatar: "SJ",
};

const quickStats = [
  { label: "Active Projects", value: "5", icon: FolderOpen, trend: "+2 this semester" },
  { label: "Total Students", value: "127", icon: Users, trend: "Across all courses" },
  { label: "Projects Due This Week", value: "2", icon: Calendar, trend: "CS101, MATH250" },
  { label: "Avg Contribution Score", value: "73%", icon: TrendingUp, trend: "+8% vs last month" },
];

const projectHealth = [
  {
    id: "1",
    name: "CS 101 Final Project",
    status: "healthy",
    progress: 65,
    lastActivity: "2 hours ago",
    members: ["AK", "BL", "CM", "DP"],
    flags: 0,
  },
  {
    id: "2",
    name: "MATH 250 Group Lab",
    status: "at-risk",
    progress: 45,
    lastActivity: "3 days ago",
    members: ["EF", "GH", "IJ"],
    flags: 2,
    warning: "No activity in 3 days",
  },
  {
    id: "3",
    name: "ENG 202 Essay Project",
    status: "critical",
    progress: 20,
    lastActivity: "5 days ago",
    members: ["KL", "MN"],
    flags: 4,
    warning: "Deadline in 2 days, only 20% complete",
  },
  {
    id: "4",
    name: "PHYS 301 Lab Report",
    status: "healthy",
    progress: 85,
    lastActivity: "1 hour ago",
    members: ["OP", "QR", "ST", "UV"],
    flags: 0,
  },
];

const recentFlags = [
  { icon: Bot, title: "AI content detected in Project X", time: "1 hour ago", severity: "error" },
  { icon: FileWarning, title: "Large paste detected (500 words) - Student Y", time: "3 hours ago", severity: "warning" },
  { icon: UserMinus, title: "Student Z missed 3 meetings", time: "Yesterday", severity: "warning" },
  { icon: Clock, title: "Late submission from Group 4", time: "2 days ago", severity: "info" },
];

const liveActivity = [
  { student: "Alice K.", action: "added 120 words to Project B", time: "Just now" },
  { student: "Team C", action: "scheduled meeting for tomorrow", time: "5 min ago" },
  { student: "Bob L.", action: "completed task 'Research section'", time: "12 min ago" },
  { student: "Diana P.", action: "uploaded 3 files to shared drive", time: "25 min ago" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return { color: "bg-green-500", text: "On Track", dotColor: "bg-green-500" };
      case "at-risk":
        return { color: "bg-yellow-500", text: "Needs Attention", dotColor: "bg-yellow-500" };
      case "critical":
        return { color: "bg-red-500", text: "Critical", dotColor: "bg-red-500" };
      default:
        return { color: "bg-slate-400", text: "Unknown", dotColor: "bg-slate-400" };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "bg-red-50 text-red-600 border-red-200";
      case "warning": return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "info": return "bg-blue-50 text-blue-600 border-blue-200";
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
                  placeholder="Search projects, students..."
                  className="w-72 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {teacherData.avatar}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{teacherData.name}</p>
                  <p className="text-xs text-slate-500">{teacherData.email}</p>
                </div>
              </div>

              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-semibold">
                <Link to="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
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
              Welcome back, Professor {teacherData.name.split(" ").pop()}! 👋
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
            {/* Group Health Monitoring */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Group Health Status</h2>
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:text-slate-900">
                  <Flag className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectHealth.map((project, index) => {
                  const statusConfig = getStatusConfig(project.status);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-white rounded-xl border p-5 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        project.status === "critical"
                          ? "border-red-200"
                          : project.status === "at-risk"
                          ? "border-yellow-200"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                          <span className={`text-sm font-medium ${
                            project.status === "critical" ? "text-red-600" :
                            project.status === "at-risk" ? "text-yellow-600" : "text-green-600"
                          }`}>
                            {statusConfig.text}
                          </span>
                        </div>
                        {project.flags > 0 && (
                          <Badge className="bg-red-50 text-red-600 border-red-200">
                            {project.flags} flags
                          </Badge>
                        )}
                      </div>

                      {/* Project Name */}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>

                      {/* Warning Message */}
                      {project.warning && (
                        <div className={`flex items-center gap-2 text-sm mb-3 ${
                          project.status === "critical" ? "text-red-600" : "text-yellow-600"
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                          <span>{project.warning}</span>
                        </div>
                      )}

                      {/* Team Members */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {project.members.map((member, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-700 border-2 border-white"
                            >
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-slate-900 font-medium">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${statusConfig.color}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Last activity: {project.lastActivity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${
                            project.status === "critical"
                              ? "text-red-600 hover:text-red-700"
                              : project.status === "at-risk"
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {project.status === "critical" ? "Take Action" : project.status === "at-risk" ? "Intervene" : "View Details"}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Recent Flags */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  {recentFlags.map((flag, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        flag.severity === "error" ? "bg-red-50" :
                        flag.severity === "warning" ? "bg-yellow-50" : "bg-blue-50"
                      }`}>
                        <flag.icon className={`h-4 w-4 ${
                          flag.severity === "error" ? "text-red-600" :
                          flag.severity === "warning" ? "text-yellow-600" : "text-blue-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{flag.title}</p>
                        <p className="text-xs text-slate-500">{flag.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Live Activity Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <h3 className="text-lg font-semibold text-slate-900">Live Activity</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {liveActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">
                          <span className="font-medium">{activity.student}</span> {activity.action}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
