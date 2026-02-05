import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Activity,
  Zap,
  Bot,
  FileWarning,
  FileText,
  AlertCircle,
  Info,
  Edit,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MenuVertical } from "@/components/ui/menu-vertical";

// Sidebar navigation items for teachers
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "All Projects", href: "/teacher/projects" },
  { icon: Users, label: "Students", href: "/teacher/students" },
  { icon: BarChart3, label: "Analytics", href: "/teacher/analytics" },
  { icon: Activity, label: "Live Monitor", href: "/teacher/live-monitor" },
  { icon: FileText, label: "Reports", href: "/teacher/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

// Mock data for teacher
const teacherData = {
  name: "Professor Smith",
  email: "p.smith@university.edu",
};

// Mock stats
const dashboardStats = {
  activeProjects: 24,
  totalStudents: 186,
  atRiskProjects: 5,
  flaggedIssues: 12,
};

// Mock project health data
const projectHealthData = [
  {
    id: "1",
    name: "Marketing Campaign Analysis",
    course: "Business 201",
    studentCount: 5,
    deadline: "Feb 15, 2026",
    status: "at_risk" as const,
    riskScore: 85,
    progress: 35,
    issues: [
      { type: "free_rider", description: "Dave has 0 contributions in 7 days" },
      { type: "work_imbalance", description: "1 student doing 60% of work" },
      { type: "ai_content", description: "3 flagged paste events" },
    ],
    metrics: {
      activityLevel: "Low",
      workBalance: "Poor",
    },
  },
  {
    id: "2",
    name: "Machine Learning Final Project",
    course: "CS 101",
    studentCount: 4,
    deadline: "Feb 20, 2026",
    status: "needs_attention" as const,
    riskScore: 45,
    progress: 55,
    issues: [
      { type: "deadline", description: "14 days remaining, 55% complete" },
      { type: "meeting", description: "2 of 4 students missed last meeting" },
    ],
    metrics: {
      activityLevel: "Medium",
      workBalance: "Fair",
    },
  },
  {
    id: "3",
    name: "Cell Biology Lab Report",
    course: "Biology 150",
    studentCount: 3,
    deadline: "Feb 25, 2026",
    status: "healthy" as const,
    riskScore: 12,
    progress: 75,
    issues: [],
    positiveIndicators: [
      "Balanced contributions: All members contributing equally",
      "On schedule: 75% complete, ahead of timeline",
    ],
    metrics: {
      activityLevel: "High",
      workBalance: "Good",
    },
  },
];

// Mock predictions
const predictions = [
  {
    projectName: "Marketing Campaign",
    riskPercentage: 78,
    prediction: "Predicted to miss deadline based on current progress rate",
  },
  {
    projectName: "ML Final Project",
    riskPercentage: 45,
    prediction: "Team conflict likely if work imbalance continues",
  },
  {
    projectName: "Biology Lab Report",
    riskPercentage: 12,
    prediction: "On track for successful completion",
  },
];

// Mock alerts
const recentAlerts = [
  {
    id: "1",
    type: "free_rider",
    severity: "critical",
    title: "Free-rider Detected",
    description: "Dave Wilson (Marketing Campaign) has 0 contributions in 7 days",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "ai_content",
    severity: "warning",
    title: "AI Content Detected",
    description: "Alice Johnson pasted 450 words with 85% AI probability",
    timestamp: "3 hours ago",
  },
  {
    id: "3",
    type: "plagiarism",
    severity: "warning",
    title: "Plagiarism Alert",
    description: "Bob Smith's document shows 32% similarity to web sources",
    timestamp: "5 hours ago",
  },
  {
    id: "4",
    type: "deadline",
    severity: "warning",
    title: "Deadline Warning",
    description: "ML Final Project is 55% complete with 14 days remaining",
    timestamp: "1 day ago",
  },
  {
    id: "5",
    type: "conflict",
    severity: "info",
    title: "Team Conflict",
    description: "Low peer review scores detected in Marketing Campaign (avg 2.5/5)",
    timestamp: "1 day ago",
  },
  {
    id: "6",
    type: "milestone",
    severity: "info",
    title: "Project Milestone",
    description: "Biology Lab Report reached 75% completion",
    timestamp: "2 days ago",
  },
];

// Mock live activity
const liveActivity = [
  { name: "Alice Johnson", avatar: "A", action: 'edited "Introduction.docx"', project: "CS 101", time: "Just now", color: "bg-green-500" },
  { name: "Bob Smith", avatar: "B", action: 'completed task "Fix bug #23"', project: "CS 101", time: "2 min ago", color: "bg-purple-500" },
  { name: "Sarah Lee", avatar: "S", action: "checked in to meeting", project: "Marketing", time: "5 min ago", color: "bg-blue-500" },
  { name: "Tom Harris", avatar: "T", action: "added 320 words to report", project: "Biology 150", time: "12 min ago", color: "bg-orange-500" },
];

// Mock weekly stats
const weeklyStats = {
  totalEdits: 1247,
  meetingsHeld: 32,
  tasksCompleted: 89,
  newAlerts: 12,
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getAlertConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { borderColor: "border-red-500", bgColor: "bg-red-50", icon: AlertTriangle, iconColor: "text-red-500" };
      case "warning":
        return { borderColor: "border-yellow-500", bgColor: "bg-yellow-50", icon: AlertCircle, iconColor: "text-yellow-500" };
      case "info":
        return { borderColor: "border-blue-500", bgColor: "bg-blue-50", icon: Info, iconColor: "text-blue-500" };
      default:
        return { borderColor: "border-slate-300", bgColor: "bg-slate-50", icon: Info, iconColor: "text-slate-500" };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "free_rider":
        return AlertTriangle;
      case "ai_content":
        return Bot;
      case "plagiarism":
        return FileWarning;
      case "deadline":
        return Clock;
      case "conflict":
        return Users;
      case "milestone":
        return Info;
      default:
        return Info;
    }
  };

  const filteredProjects = projectHealthData.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) return false;
    if (courseFilter !== "all" && !project.course.toLowerCase().includes(courseFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11">
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
          <div className="mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              Teacher
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <MenuVertical
            menuItems={sidebarItems}
            color="hsl(217, 91%, 60%)"
            skew={-2}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Welcome Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {teacherData.name}!</h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your courses</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Generating reports...")}
              className="flex items-center gap-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Download className="w-4 h-4" />
              Export Reports
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardStats.activeProjects}</h3>
            <p className="text-slate-600 text-sm mb-2">Active Projects</p>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <TrendingUp className="w-3 h-3" />
              <span>+3 this semester</span>
            </div>
          </motion.div>

          {/* Total Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardStats.totalStudents}</h3>
            <p className="text-slate-600 text-sm mb-2">Total Students</p>
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Info className="w-3 h-3" />
              <span>Across 24 projects</span>
            </div>
          </motion.div>

          {/* At-Risk Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardStats.atRiskProjects}</h3>
            <p className="text-slate-600 text-sm mb-2">At-Risk Projects</p>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>Require intervention</span>
            </div>
          </motion.div>

          {/* Flagged Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{dashboardStats.flaggedIssues}</h3>
            <p className="text-slate-600 text-sm mb-2">Flagged Issues</p>
            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <Clock className="w-3 h-3" />
              <span>AI/Plagiarism alerts</span>
            </div>
          </motion.div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT COLUMN - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Health Monitoring Grid */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Project Health Overview</h2>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Projects</option>
                    <option value="healthy">Healthy Only</option>
                    <option value="needs_attention">Needs Attention</option>
                    <option value="at_risk">At Risk</option>
                  </select>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Courses</option>
                    <option value="cs">CS 101</option>
                    <option value="business">Business 201</option>
                    <option value="biology">Biology 150</option>
                  </select>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Healthy - All metrics good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Needs Attention - Minor issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">At Risk - Critical issues</span>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      project.status === "at_risk"
                        ? "border-red-300 bg-red-50"
                        : project.status === "needs_attention"
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-green-300 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-900">{project.name}</h3>
                          <span
                            className={`px-2 py-1 text-white text-xs rounded-full font-medium flex items-center gap-1 ${
                              project.status === "at_risk"
                                ? "bg-red-500"
                                : project.status === "needs_attention"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          >
                            {project.status === "at_risk" ? (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                At Risk
                              </>
                            ) : project.status === "needs_attention" ? (
                              <>
                                <Clock className="w-3 h-3" />
                                Needs Attention
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Healthy
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {project.course} • {project.studentCount} students • Due {project.deadline}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/project/${project.id}`)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          project.status === "at_risk"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : project.status === "needs_attention"
                            ? "bg-white border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                            : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {project.status === "at_risk" ? "Intervene" : project.status === "needs_attention" ? "Review" : "View"}
                      </button>
                    </div>

                    {/* Issues / Positive Indicators */}
                    <div className="space-y-2 mb-3">
                      {project.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-sm ${
                            project.status === "at_risk" ? "text-red-700" : "text-yellow-700"
                          }`}
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            <strong>{issue.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</strong>{" "}
                            {issue.description}
                          </span>
                        </div>
                      ))}
                      {project.positiveIndicators?.map((indicator, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{indicator}</span>
                        </div>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div
                      className={`grid grid-cols-4 gap-3 pt-3 border-t ${
                        project.status === "at_risk"
                          ? "border-red-200"
                          : project.status === "needs_attention"
                          ? "border-yellow-200"
                          : "border-green-200"
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">Activity</p>
                        <p
                          className={`text-lg font-bold ${
                            project.status === "at_risk"
                              ? "text-red-600"
                              : project.status === "needs_attention"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {project.metrics.activityLevel}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">Balance</p>
                        <p
                          className={`text-lg font-bold ${
                            project.status === "at_risk"
                              ? "text-red-600"
                              : project.status === "needs_attention"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {project.metrics.workBalance}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">Progress</p>
                        <p
                          className={`text-lg font-bold ${
                            project.status === "at_risk"
                              ? "text-red-600"
                              : project.status === "needs_attention"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {project.progress}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">Risk Score</p>
                        <p
                          className={`text-lg font-bold ${
                            project.status === "at_risk"
                              ? "text-red-600"
                              : project.status === "needs_attention"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {project.riskScore}/100
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View All Button */}
              <button
                onClick={() => navigate("/dashboard/projects")}
                className="w-full mt-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                View All Projects →
              </button>
            </div>

            {/* Predictive Analytics Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold">AI Predictions</h3>
              </div>

              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{prediction.projectName}</span>
                      <span
                        className={`px-2 py-1 text-white text-xs rounded-full font-bold ${
                          prediction.riskPercentage >= 70
                            ? "bg-red-500"
                            : prediction.riskPercentage >= 40
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      >
                        {prediction.riskPercentage}% Risk
                      </span>
                    </div>
                    <p className="text-sm text-purple-100">{prediction.prediction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 1/3 width */}
          <div className="space-y-6">
            {/* Real-Time Alerts Feed */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Recent Alerts</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentAlerts.map((alert) => {
                  const config = getAlertConfig(alert.severity);
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`border-l-4 ${config.borderColor} ${config.bgColor} p-3 rounded-r-lg`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertIcon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              alert.severity === "critical"
                                ? "text-red-900"
                                : alert.severity === "warning"
                                ? "text-yellow-900"
                                : "text-blue-900"
                            }`}
                          >
                            {alert.title}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              alert.severity === "critical"
                                ? "text-red-700"
                                : alert.severity === "warning"
                                ? "text-yellow-700"
                                : "text-blue-700"
                            }`}
                          >
                            {alert.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-slate-900">Live Activity</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {liveActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                    >
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">
                        <strong>{activity.name}</strong> {activity.action}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.project} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Activity →
              </button>
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">This Week</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-700">Total Edits</span>
                  </div>
                  <span className="font-bold text-slate-900">{weeklyStats.totalEdits.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-slate-700">Meetings Held</span>
                  </div>
                  <span className="font-bold text-slate-900">{weeklyStats.meetingsHeld}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-700">Tasks Completed</span>
                  </div>
                  <span className="font-bold text-slate-900">{weeklyStats.tasksCompleted}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-700">New Alerts</span>
                  </div>
                  <span className="font-bold text-red-600">{weeklyStats.newAlerts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
