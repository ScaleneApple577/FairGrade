import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Users,
  FolderOpen,
  MoreVertical,
  Mail,
  Calendar,
  Archive,
  FolderPlus,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

// TODO: Connect to GET http://localhost:8000/api/teacher/projects
// TODO: Connect to POST http://localhost:8000/api/projects

interface Project {
  id: string;
  name: string;
  course: string;
  description: string;
  deadline: string;
  student_count: number;
  status: "healthy" | "needs_attention" | "at_risk";
  risk_score: number;
  progress: number;
  issues_count: number;
  flagged_students: number;
  last_activity: string;
  created_at: string;
}

const courses = ["CS 101", "Business 201", "Biology 150", "English 102"];

export default function TeacherProjects() {
  const navigate = useNavigate();

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal states
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Create project wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [projectCourse, setProjectCourse] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [teamSize, setTeamSize] = useState("4");
  const [studentEmails, setStudentEmails] = useState("");
  const [fileUrls, setFileUrls] = useState("");
  const [importFromLMS, setImportFromLMS] = useState(false);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/teacher/projects
    // fetch('http://localhost:8000/api/teacher/projects')
    //   .then(res => res.json())
    //   .then(data => { setProjects(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    return {
      total: projects.length,
      healthy: projects.filter((p) => p.status === "healthy").length,
      needs_attention: projects.filter((p) => p.status === "needs_attention").length,
      at_risk: projects.filter((p) => p.status === "at_risk").length,
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.course.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((p) => p.status === filterStatus);
    }

    if (filterCourse !== "all") {
      result = result.filter((p) => p.course === filterCourse);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "risk":
          return b.risk_score - a.risk_score;
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, filterStatus, filterCourse, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterCourse("all");
  };

  const handleCreateProject = () => {
    // TODO: POST http://localhost:8000/api/projects
    toast.success("Project created successfully!");
    setShowCreateProject(false);
    setCurrentStep(1);
    setProjectName("");
    setProjectCourse("");
    setProjectDescription("");
    setProjectDeadline("");
    setTeamSize("4");
    setStudentEmails("");
    setFileUrls("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const deadline = new Date(dateStr);
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const statusColors = {
    healthy: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", badge: "bg-green-500" },
    needs_attention: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", badge: "bg-yellow-500" },
    at_risk: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", badge: "bg-red-500" },
  };

  const hasActiveFilters = filterStatus !== "all" || filterCourse !== "all" || searchQuery;

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">All Projects</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FolderOpen className="w-4 h-4" />
                <span>{stats.total} total projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>{stats.healthy} healthy</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span>{stats.needs_attention} needs attention</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>{stats.at_risk} at risk</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowBulkActions(true)}
              variant="outline"
              className="flex items-center gap-2 bg-white/10 border-white/10 text-white hover:bg-white/15"
            >
              <Filter className="w-4 h-4" />
              Bulk Actions
            </Button>
            <Button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Search Projects</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/10 text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/10 text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/10 text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="deadline">Deadline (Soonest)</option>
                <option value="risk">Risk Score (Highest)</option>
                <option value="name">Name (A-Z)</option>
                <option value="created">Recently Created</option>
                <option value="progress">Progress (%)</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-slate-500">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Status: {filterStatus.replace("_", " ")}
                  <button onClick={() => setFilterStatus("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterCourse !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Course: {filterCourse}
                  <button onClick={() => setFilterCourse("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-xs text-blue-400 hover:underline ml-2">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* View Toggle & Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            Showing {filteredProjects.length} of {stats.total} projects
          </p>
          <div className="flex border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-white/10 ${
                viewMode === "list" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State or Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 p-16 text-center">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-6">Create your first project to start tracking student contributions</p>
            <Button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const colors = statusColors[project.status];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/5 rounded-xl border ${colors.border} overflow-hidden cursor-pointer hover:bg-white/10 transition-all`}
                  onClick={() => navigate(`/teacher/projects/${project.id}`)}
                >
                  <div className={`${colors.bg} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg leading-tight">{project.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{project.course}</p>
                      </div>
                      <span className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1`}>
                        {project.status === "healthy" && <CheckCircle className="w-3 h-3" />}
                        {project.status === "needs_attention" && <AlertCircle className="w-3 h-3" />}
                        {project.status === "at_risk" && <AlertTriangle className="w-3 h-3" />}
                        {project.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Students</p>
                        <p className="text-lg font-bold text-white">{project.student_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Progress</p>
                        <p className="text-lg font-bold text-white">{project.progress}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Risk</p>
                        <p className={`text-lg font-bold ${colors.text}`}>{project.risk_score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Issues</p>
                        <p className="text-lg font-bold text-white">{project.issues_count}</p>
                      </div>
                    </div>

                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(project.deadline)}
                      </span>
                      <span>{getDaysUntil(project.deadline)} days left</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-400">Project</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Status</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Students</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Progress</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Deadline</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((project) => {
                  const colors = statusColors[project.status];
                  return (
                    <tr key={project.id} className="hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/teacher/projects/${project.id}`)}>
                      <td className="p-4">
                        <p className="font-semibold text-white">{project.name}</p>
                        <p className="text-xs text-slate-500">{project.course}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full`}>
                          {project.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-300">{project.student_count}</td>
                      <td className="p-4 text-center text-slate-300">{project.progress}%</td>
                      <td className="p-4 text-center text-slate-300">{formatDate(project.deadline)}</td>
                      <td className="p-4 text-right">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                <button onClick={() => setShowCreateProject(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? "bg-blue-500 text-white" : "bg-white/10 text-slate-400"
                    }`}>
                      {step}
                    </div>
                    <span className={`text-sm ${currentStep >= step ? "text-white" : "text-slate-500"}`}>
                      {step === 1 ? "Details" : step === 2 ? "Students" : "Files"}
                    </span>
                    {step < 3 && <div className="w-12 h-px bg-white/10" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Project Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., Marketing Campaign Analysis"
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Course</label>
                    <select
                      value={projectCourse}
                      onChange={(e) => setProjectCourse(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 text-slate-300 rounded-lg"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe the project objectives..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
                      <input
                        type="date"
                        value={projectDeadline}
                        onChange={(e) => setProjectDeadline(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Team Size</label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/10 text-slate-300 rounded-lg"
                      >
                        <option value="2">2 students</option>
                        <option value="3">3 students</option>
                        <option value="4">4 students</option>
                        <option value="5">5 students</option>
                        <option value="6">6 students</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Add Students */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Add Students by Email</label>
                    <textarea
                      value={studentEmails}
                      onChange={(e) => setStudentEmails(e.target.value)}
                      placeholder="Enter student emails, one per line..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">Students will receive an email invitation to join the project</p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      id="importLMS"
                      checked={importFromLMS}
                      onChange={(e) => setImportFromLMS(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10"
                    />
                    <label htmlFor="importLMS" className="text-sm text-slate-300">
                      Import student roster from Canvas/Blackboard
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Connect Files */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Google Docs/Sheets URLs</label>
                    <textarea
                      value={fileUrls}
                      onChange={(e) => setFileUrls(e.target.value)}
                      placeholder="Paste Google Docs, Sheets, or Slides URLs, one per line..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">These documents will be tracked for student contributions</p>
                  </div>

                  <div className="p-6 border-2 border-dashed border-white/20 rounded-xl text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                    <FolderPlus className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-300 mb-1">Or connect Google Drive folder</p>
                    <p className="text-xs text-slate-500">All documents in the folder will be automatically tracked</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="bg-white/10 border-white/10 text-white hover:bg-white/20"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                {currentStep < 3 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateProject}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Create Project
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
