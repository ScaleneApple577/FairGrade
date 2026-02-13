import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ClassroomGate } from "@/components/student/ClassroomGate";
import { JoinProjectModal } from "@/components/student/JoinProjectModal";
import { api, fetchProjectsWithFallback } from "@/lib/api";
import { toast } from "sonner";

// Backend API response format
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
  daysUntilDeadline?: number;
  health?: "green" | "yellow" | "red";
  progress?: number;
  myContributionScore?: number;
  teamMembers?: Array<{ id: string; name: string; avatar: string; role: string }>;
  tasksCompleted?: number;
  totalTasks?: number;
  lastActivity?: string;
  isNew?: boolean;
  filesSubmitted?: number;
}

const projectGradients = [
  "from-[#1e3a8a] to-[#3b82f6]",
  "from-[#581c87] to-[#a855f7]",
  "from-[#065f46] to-[#10b981]",
  "from-[#134e4a] to-[#14b8a6]",
  "from-[#312e81] to-[#6366f1]",
  "from-[#9d174d] to-[#ec4899]",
];

const getHealthStyles = (health: string) => {
  switch (health) {
    case "green":
      return { text: "text-emerald-400", dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]", label: "On Track", border: "border-emerald-500/30" };
    case "yellow":
      return { text: "text-yellow-400", dot: "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]", label: "Needs Attention", border: "border-yellow-500/30" };
    case "red":
      return { text: "text-red-400", dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]", label: "At Risk", border: "border-red-500/30" };
    default:
      return { text: "text-white/40", dot: "bg-white/30", label: "Unknown", border: "border-white/10" };
  }
};

export default function StudentProjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProjectsWithFallback<ApiProject>();
        const transformedProjects: Project[] = (data || []).map((p) => ({
          id: p.id, name: p.name, description: p.description || '', created_at: p.created_at,
          course: '—', deadline: undefined, daysUntilDeadline: undefined, health: 'green' as const,
          progress: 0, myContributionScore: 0, teamMembers: [], tasksCompleted: 0, totalTasks: 0,
          lastActivity: p.created_at, isNew: false, filesSubmitted: 0,
        }));
        setProjects(transformedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects");
      } finally { setIsLoading(false); }
    };
    fetchProjects();
  }, []);

  const handleJoinSuccess = async () => {
    try {
      const data = await fetchProjectsWithFallback<ApiProject>();
      const transformedProjects: Project[] = (data || []).map((p) => ({
        id: p.id, name: p.name, description: p.description || '', created_at: p.created_at,
        course: '—', health: 'green' as const, progress: 0, myContributionScore: 0,
        teamMembers: [], tasksCompleted: 0, totalTasks: 0, lastActivity: p.created_at, filesSubmitted: 0,
      }));
      setProjects(transformedProjects);
    } catch (error) { console.error("Failed to refresh projects:", error); }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.progress < 100;
    if (filter === "completed") return project.progress === 100;
    return true;
  });

  if (isLoading) {
    return (
      <StudentLayout pageTitle="My Projects">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="My Projects">
      <ClassroomGate>
      <div className="flex items-center justify-end mb-6">
        <Button onClick={() => setShowJoinModal(true)} className="btn-gradient">
          <UserPlus className="w-4 h-4 mr-2" />Join Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="bg-white/[0.06] rounded-2xl border border-white/[0.06] p-1 inline-flex gap-1">
          {[{ key: "all" as const, label: `All Projects (${projects.length})` }, { key: "active" as const, label: "Active" }, { key: "completed" as const, label: "Completed" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${filter === f.key ? "btn-gradient shadow-lg" : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const healthStyles = getHealthStyles(project.health);
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl overflow-hidden cursor-pointer card-hover"
                onClick={() => navigate(`/student/projects/${project.id}`)}
              >
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${projectGradients[index % projectGradients.length]} p-5 relative`}>
                  {project.isNew && (
                    <Badge className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">NEW</Badge>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${healthStyles.dot}`} />
                    <span className={`text-xs font-medium ${healthStyles.text}`}>{healthStyles.label}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                  <p className="text-sm text-white/60">{project.course}</p>
                </div>

                {/* Dark bottom section */}
                <div className="bg-[#111633]/80 backdrop-blur-sm p-5 space-y-4">
                  <p className="text-sm text-white/40 line-clamp-2">{project.description}</p>

                  {project.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/30" />
                      <span className="text-sm text-white/40">Due: {project.deadline}</span>
                      {project.daysUntilDeadline <= 3 && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{project.daysUntilDeadline} days left</Badge>
                      )}
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/40">Progress</span>
                      <span className="font-semibold text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-400" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  {/* Contribution Score */}
                  <div className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white/40">My Contribution</span>
                    </div>
                    <span className={`text-lg font-bold ${project.myContributionScore >= 70 ? "text-emerald-400" : project.myContributionScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {project.myContributionScore}%
                    </span>
                  </div>

                  {/* Team & Tasks */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.teamMembers.slice(0, 4).map((member) => (
                        <div key={member.id} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-[#111633]" title={member.name}>
                          {member.avatar}
                        </div>
                      ))}
                      {project.teamMembers.length > 4 && (
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/40 text-xs font-semibold border-2 border-[#111633]">+{project.teamMembers.length - 4}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/30">
                      <CheckCircle className="w-3 h-3" />
                      <span>{project.tasksCompleted}/{project.totalTasks} tasks</span>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    {project.filesSubmitted > 0 ? (
                      <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />{project.filesSubmitted} documents submitted</span>
                    ) : (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">⚠ No documents submitted yet</span>
                    )}
                    <p className="text-xs text-white/20">{project.lastActivity}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card text-center py-12">
          <FolderOpen className="w-12 h-12 text-white/15 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
          <p className="text-white/40 mb-6 max-w-md mx-auto">You're not part of any projects yet.</p>
          <Button onClick={() => setShowJoinModal(true)} className="btn-gradient">
            <UserPlus className="w-4 h-4 mr-2" />Join Project
          </Button>
        </div>
      )}

      <JoinProjectModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} onSuccess={handleJoinSuccess} />
      </ClassroomGate>
    </StudentLayout>
  );
}
