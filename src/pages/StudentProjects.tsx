import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  FolderOpen,
  Calendar,
  Star,
  BarChart3,
  LogOut,
  LayoutDashboard,
  Bell,
  Search,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MenuVertical } from "@/components/ui/menu-vertical";

// Sidebar navigation items
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: FolderOpen, label: "My Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Peer Reviews", href: "/student/reviews" },
  { icon: BarChart3, label: "My Stats", href: "/student/stats" },
];

// Mock projects data
const mockProjects = [
  {
    id: "1",
    name: "CS 101 Final Project",
    course: "Computer Science 101",
    description: "Build a full-stack web application using React and Node.js",
    deadline: "Feb 15, 2026",
    daysUntilDeadline: 9,
    health: "green" as const,
    progress: 75,
    myContributionScore: 82,
    teamMembers: [
      { id: "1", name: "Sarah Johnson", avatar: "SJ", role: "You" },
      { id: "2", name: "Alice Chen", avatar: "AC", role: "Frontend" },
      { id: "3", name: "Bob Smith", avatar: "BS", role: "Backend" },
      { id: "4", name: "Diana Park", avatar: "DP", role: "Design" },
    ],
    tasksCompleted: 12,
    totalTasks: 16,
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    name: "Marketing Campaign",
    course: "Business 201",
    description: "Create a comprehensive digital marketing strategy for a startup",
    deadline: "Feb 20, 2026",
    daysUntilDeadline: 14,
    health: "yellow" as const,
    progress: 45,
    myContributionScore: 65,
    teamMembers: [
      { id: "1", name: "Sarah Johnson", avatar: "SJ", role: "You" },
      { id: "5", name: "Mike Chen", avatar: "MC", role: "Strategist" },
      { id: "6", name: "Emma Davis", avatar: "ED", role: "Content" },
    ],
    tasksCompleted: 5,
    totalTasks: 11,
    lastActivity: "1 day ago",
  },
  {
    id: "3",
    name: "Biology Lab Report",
    course: "Biology 150",
    description: "Document and analyze results from the semester lab experiments",
    deadline: "Feb 8, 2026",
    daysUntilDeadline: 2,
    health: "red" as const,
    progress: 30,
    myContributionScore: 45,
    teamMembers: [
      { id: "1", name: "Sarah Johnson", avatar: "SJ", role: "You" },
      { id: "7", name: "Tom Wilson", avatar: "TW", role: "Research" },
    ],
    tasksCompleted: 3,
    totalTasks: 10,
    lastActivity: "3 days ago",
  },
];

// Health indicator styling
const getHealthStyles = (health: string) => {
  switch (health) {
    case "green":
      return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "On Track", border: "border-green-200" };
    case "yellow":
      return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Needs Attention", border: "border-yellow-200" };
    case "red":
      return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "At Risk", border: "border-red-200" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", label: "Unknown", border: "border-slate-200" };
  }
};

export default function StudentProjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredProjects = mockProjects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.progress < 100;
    if (filter === "completed") return project.progress === 100;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11 flex-shrink-0">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-slate-900">Fair</span>
              <span className="text-blue-500">Grade</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 p-4">
          <MenuVertical menuItems={sidebarItems} />
        </div>

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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between px-8 h-16">
            <h1 className="text-lg font-semibold text-slate-900">My Projects</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search projects..." className="w-64 pl-10 bg-slate-50 border-slate-200" />
              </div>
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
                  <p className="text-slate-600 mt-1">View and manage your group projects</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 inline-flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Projects ({mockProjects.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "active"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "completed"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const healthStyles = getHealthStyles(project.health);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`bg-white rounded-xl shadow-lg border-2 ${healthStyles.border} p-6 cursor-pointer transition-all`}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${healthStyles.dot}`} />
                        <span className={`text-xs font-medium ${healthStyles.text}`}>
                          {healthStyles.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.course}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Due: {project.deadline}</span>
                    {project.daysUntilDeadline <= 3 && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                        {project.daysUntilDeadline} days left
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${healthStyles.dot}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* My Contribution Score */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-600">My Contribution</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      project.myContributionScore >= 70 ? "text-green-600" :
                      project.myContributionScore >= 50 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {project.myContributionScore}%
                    </span>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.teamMembers.slice(0, 4).map((member, i) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                      ))}
                      {project.teamMembers.length > 4 && (
                        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-xs font-semibold border-2 border-white">
                          +{project.teamMembers.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <CheckCircle className="w-3 h-3" />
                      <span>{project.tasksCompleted}/{project.totalTasks} tasks</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Last activity: {project.lastActivity}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Projects Found</h3>
              <p className="text-slate-600">
                {filter === "completed" 
                  ? "You haven't completed any projects yet."
                  : "You don't have any active projects at the moment."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
