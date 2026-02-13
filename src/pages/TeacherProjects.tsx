import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Filter, Grid3X3, List, X, CheckCircle, AlertTriangle, AlertCircle,
  Clock, Users, FolderOpen, MoreVertical, Mail, Calendar, Archive, FolderPlus,
  Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { CreateProjectWizard } from "@/components/project/CreateProjectWizard";
import { api, fetchProjectsWithFallback } from "@/lib/api";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { LiveIndicator } from "@/components/live/LiveIndicator";

// Backend API response format - simplified
interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Frontend display format with optional fields
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  // These fields are not returned by the current backend API
  // Will show defaults until backend supports them
  course?: string;
  deadline?: string;
  student_count?: number;
  status?: "healthy" | "needs_attention" | "at_risk";
  risk_score?: number;
  progress?: number;
  issues_count?: number;
  flagged_students?: number;
  last_activity?: string;
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

  // Live status
  const { isProjectLive, getProjectLiveCount } = useLiveStatus();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Fetch projects with fallback endpoint logic
        const data = await fetchProjectsWithFallback<ApiProject>();
        // Transform API response to frontend format with defaults for missing fields
        const transformedProjects: Project[] = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          created_at: p.created_at,
          // Defaults for fields not supported by backend yet
          course: '—',
          deadline: undefined,
          student_count: 0,
          status: 'healthy' as const,
          risk_score: 0,
          progress: 0,
          issues_count: 0,
          flagged_students: 0,
          last_activity: p.created_at,
        }));
        setProjects(transformedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
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
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, filterStatus, filterCourse, sortBy]);

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

  const statusColors = {
    healthy: { text: "text-emerald-600", badge: "bg-emerald-500" },
    needs_attention: { text: "text-yellow-600", badge: "bg-yellow-500" },
    at_risk: { text: "text-red-600", badge: "bg-red-500" },
  };

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{stats.total} projects</span>
            <span className="text-emerald-600">{stats.healthy} healthy</span>
            {stats.needs_attention > 0 && <span className="text-yellow-600">{stats.needs_attention} needs attention</span>}
            {stats.at_risk > 0 && <span className="text-red-600">{stats.at_risk} at risk</span>}
          </div>
          <Button onClick={() => setShowCreateProject(true)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-lg text-sm font-medium shadow-sm transition-all duration-150 hover:shadow-md hover:scale-[1.02]">
            <Plus className="w-3.5 h-3.5 mr-1.5" />New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 h-8 bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg text-sm shadow-sm"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 text-gray-600 rounded-lg px-2.5 h-8 text-xs shadow-sm">
            <option value="all">All</option>
            <option value="healthy">Healthy</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="at_risk">At Risk</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-200 text-gray-600 rounded-lg px-2.5 h-8 text-xs shadow-sm">
            <option value="deadline">Deadline</option>
            <option value="risk">Risk</option>
            <option value="name">Name</option>
            <option value="created">Created</option>
          </select>
          <div className="ml-auto flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button onClick={() => setViewMode("grid")} className={`px-2.5 py-1.5 text-xs ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")} className={`px-2.5 py-1.5 text-xs border-l border-gray-200 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">{filteredProjects.length} of {stats.total} projects</p>

        {/* Content */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-7 h-7 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No projects</p>
            <p className="text-xs text-gray-500 mb-4">Create your first project to get started</p>
            <Button onClick={() => setShowCreateProject(true)} className="bg-blue-600 hover:bg-blue-700 h-8 px-3 rounded-lg text-sm shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Create Project
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, i) => {
              const colors = statusColors[project.status];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-4 cursor-pointer shadow-sm card-hover"
                  onClick={() => navigate(`/teacher/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        {isProjectLive(project.id) && (
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{project.course}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full mt-1 ${colors.badge}`} />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                    <div>
                      <p className="text-[10px] text-gray-400">Students</p>
                      <p className="text-sm font-medium text-gray-900">{project.student_count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Progress</p>
                      <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Risk</p>
                      <p className={`text-sm font-medium ${colors.text}`}>{project.risk_score}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Issues</p>
                      <p className="text-sm font-medium text-gray-900">{project.issues_count}</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-1 mb-2">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{project.deadline ? `Due ${formatDate(project.deadline)}` : 'No deadline'}</span>
                    <span>{project.deadline ? `${getDaysUntil(project.deadline)}d left` : ''}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Project</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Students</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Progress</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Deadline</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProjects.map((project) => {
                  const colors = statusColors[project.status];
                  return (
                    <tr key={project.id} className="hover:bg-blue-50/30 cursor-pointer transition-colors" onClick={() => navigate(`/teacher/projects/${project.id}`)}>
                      <td className="p-3">
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.course}</p>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`w-2 h-2 rounded-full inline-block ${colors.badge}`} />
                      </td>
                      <td className="p-3 text-center text-sm text-gray-500">{project.student_count}</td>
                      <td className="p-3 text-center text-sm text-gray-500">{project.progress}%</td>
                      <td className="p-3 text-center text-sm text-gray-500">{project.deadline ? formatDate(project.deadline) : '—'}</td>
                      <td className="p-3 text-right">
                        <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-7 px-2.5 rounded-lg text-xs shadow-sm">View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Project Wizard Modal */}
        <CreateProjectWizard
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
        />
      </motion.div>
    </TeacherLayout>
  );
}
