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

const projectGradients = [
  "bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]",
  "bg-gradient-to-br from-[#581c87] to-[#a855f7]",
  "bg-gradient-to-br from-[#065f46] to-[#10b981]",
  "bg-gradient-to-br from-[#134e4a] to-[#14b8a6]",
  "bg-gradient-to-br from-[#312e81] to-[#6366f1]",
];

export default function TeacherProjects() {
  const navigate = useNavigate();

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { isProjectLive, getProjectLiveCount } = useLiveStatus();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProjectsWithFallback<ApiProject>();
        const transformedProjects: Project[] = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          created_at: p.created_at,
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
      result = result.filter((p) => p.name.toLowerCase().includes(query) || p.course.toLowerCase().includes(query));
    }
    if (filterStatus !== "all") { result = result.filter((p) => p.status === filterStatus); }
    if (filterCourse !== "all") { result = result.filter((p) => p.course === filterCourse); }
    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline": return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "risk": return b.risk_score - a.risk_score;
        case "name": return a.name.localeCompare(b.name);
        case "created": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
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

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>{stats.total} projects</span>
            <span className="text-emerald-400">{stats.healthy} healthy</span>
            {stats.needs_attention > 0 && <span className="text-yellow-400">{stats.needs_attention} needs attention</span>}
            {stats.at_risk > 0 && <span className="text-red-400">{stats.at_risk} at risk</span>}
          </div>
          <Button onClick={() => setShowCreateProject(true)} className="btn-gradient h-9 px-4 text-sm font-medium hover:scale-[1.03] active:scale-[0.98] transition-transform">
            <Plus className="w-4 h-4 mr-1.5" />New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-9 bg-white/[0.06] border border-white/[0.06] text-white placeholder:text-white/30 rounded-xl text-sm"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white/[0.06] border border-white/[0.06] text-white/60 rounded-xl px-3 h-9 text-xs">
            <option value="all">All</option>
            <option value="healthy">Healthy</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="at_risk">At Risk</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white/[0.06] border border-white/[0.06] text-white/60 rounded-xl px-3 h-9 text-xs">
            <option value="deadline">Deadline</option>
            <option value="risk">Risk</option>
            <option value="name">Name</option>
            <option value="created">Created</option>
          </select>
          <div className="ml-auto flex border border-white/[0.06] rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-xs ${viewMode === "grid" ? "bg-blue-500/20 text-blue-400" : "text-white/30 hover:bg-white/[0.04]"}`}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-xs border-l border-white/[0.06] ${viewMode === "list" ? "bg-blue-500/20 text-blue-400" : "text-white/30 hover:bg-white/[0.04]"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-white/30 mb-4">{filteredProjects.length} of {stats.total} projects</p>

        {/* Content */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-medium text-white mb-1">No projects</p>
            <p className="text-xs text-white/40 mb-4">Create your first project to get started</p>
            <Button onClick={() => setShowCreateProject(true)} className="btn-gradient h-9 px-4 text-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Create Project
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden cursor-pointer card-hover"
                onClick={() => navigate(`/teacher/projects/${project.id}`)}
              >
                {/* Gradient header */}
                <div className={`${projectGradients[i % projectGradients.length]} p-5 relative`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white">{project.name}</h3>
                    {isProjectLive(project.id) && (
                      <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                    )}
                  </div>
                  <p className="text-xs text-white/60">{project.course}</p>
                </div>
                {/* Stats bottom */}
                <div className="bg-[#111633]/80 backdrop-blur-sm p-4">
                  <div className="grid grid-cols-4 gap-2 text-center mb-3">
                    <div>
                      <p className="text-[10px] text-white/30">Students</p>
                      <p className="text-sm font-medium text-white">{project.student_count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30">Progress</p>
                      <p className="text-sm font-medium text-white">{project.progress}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30">Risk</p>
                      <p className={`text-sm font-medium ${project.status === 'at_risk' ? 'text-red-400' : project.status === 'needs_attention' ? 'text-yellow-400' : 'text-emerald-400'}`}>{project.risk_score}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30">Issues</p>
                      <p className="text-sm font-medium text-white">{project.issues_count}</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mb-2">
                    <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/30">
                    <span>{project.deadline ? `Due ${formatDate(project.deadline)}` : 'No deadline'}</span>
                    <span>{project.deadline ? `${getDaysUntil(project.deadline)}d left` : ''}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden !p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-xs font-medium text-white/40">Project</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Status</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Students</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Progress</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Deadline</th>
                  <th className="text-right p-3 text-xs font-medium text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => navigate(`/teacher/projects/${project.id}`)}>
                    <td className="p-3">
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-white/40">{project.course}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`w-2 h-2 rounded-full inline-block ${project.status === 'at_risk' ? 'bg-red-500' : project.status === 'needs_attention' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                    </td>
                    <td className="p-3 text-center text-sm text-white/50">{project.student_count}</td>
                    <td className="p-3 text-center text-sm text-white/50">{project.progress}%</td>
                    <td className="p-3 text-center text-sm text-white/50">{project.deadline ? formatDate(project.deadline) : '—'}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" className="btn-glass h-7 px-3 text-xs rounded-lg">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <CreateProjectWizard
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
        />
      </motion.div>
    </TeacherLayout>
  );
}
