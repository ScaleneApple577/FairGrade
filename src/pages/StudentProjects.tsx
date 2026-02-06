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

// TODO: Connect to GET http://localhost:8000/api/student/projects
interface Project {
  id: string;
  name: string;
  course: string;
  description: string;
  deadline: string;
  daysUntilDeadline: number;
  health: "green" | "yellow" | "red";
  progress: number;
  myContributionScore: number;
  teamMembers: Array<{ id: string; name: string; avatar: string; role: string }>;
  tasksCompleted: number;
  totalTasks: number;
  lastActivity: string;
}

// Health indicator styling
const getHealthStyles = (health: string) => {
  switch (health) {
    case "green":
      return { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-500", label: "On Track", border: "border-green-500/30" };
    case "yellow":
      return { bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500", label: "Needs Attention", border: "border-yellow-500/30" };
    case "red":
      return { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-500", label: "At Risk", border: "border-red-500/30" };
    default:
      return { bg: "bg-white/10", text: "text-slate-400", dot: "bg-slate-500", label: "Unknown", border: "border-white/10" };
  }
};

export default function StudentProjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('http://localhost:8000/api/student/projects');
        // const data = await response.json();
        // setProjects(data);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects([]);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-slate-400">Loading projects...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="My Projects">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Projects</h1>
              <p className="text-slate-400 mt-1">View and manage your group projects</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="bg-white/5 rounded-xl border border-white/10 p-2 inline-flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === "active"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === "completed"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length > 0 ? (
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
                className={`bg-white/5 rounded-xl border ${healthStyles.border} p-6 cursor-pointer transition-all hover:bg-white/10`}
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
                    <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.course}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>

                {/* Deadline */}
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">Due: {project.deadline}</span>
                  {project.daysUntilDeadline <= 3 && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      {project.daysUntilDeadline} days left
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-semibold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${healthStyles.dot}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* My Contribution Score */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-400">My Contribution</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    project.myContributionScore >= 70 ? "text-green-400" :
                    project.myContributionScore >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {project.myContributionScore}%
                  </span>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-[#111827]"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                    {project.teamMembers.length > 4 && (
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-slate-400 text-xs font-semibold border-2 border-[#111827]">
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
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500">Last activity: {project.lastActivity}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            You're not part of any projects yet. Join a project with an invite code or wait for your instructor to add you.
          </p>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Join Project
          </Button>
        </div>
      )}
    </StudentLayout>
  );
}
