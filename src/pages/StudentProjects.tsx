import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, X } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { ClassroomGate } from "@/components/student/ClassroomGate";
import { api, fetchProjectsWithFallback } from "@/lib/api";
import { useClassroom } from "@/contexts/ClassroomContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  deadline?: string | null;
  group_size?: number | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  deadline?: string | null;
  teamCount: number;
}

const folderColors = ["#d44a4a", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];
const folderRotations = [-2, 1, -1, 2, -1.5, 1.5];

function darkenColor(hex: string, amount = 25): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `rgb(${r},${g},${b})`;
}

function ProjectFolder({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const color = folderColors[index % folderColors.length];
  const rotation = folderRotations[index % folderRotations.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="cursor-pointer group"
      style={{ width: 280 }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3 } }}
    >
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
        className="group-hover:!transform-none"
      >
        {/* Folder tab */}
        <div
          style={{
            width: 100,
            height: 30,
            backgroundColor: darkenColor(color),
            borderRadius: "8px 8px 0 0",
            marginLeft: 12,
          }}
          className="flex items-center px-3"
        >
          <span className="text-white font-['Caveat'] text-sm truncate">{project.name}</span>
        </div>

        {/* Folder body */}
        <div
          style={{
            backgroundColor: color,
            height: 170,
            boxShadow: "3px 6px 15px rgba(0,0,0,0.3)",
            borderRadius: "4px 8px 8px 8px",
          }}
          className="flex flex-col items-center justify-center px-4 group-hover:shadow-[4px_10px_25px_rgba(0,0,0,0.45)] transition-shadow duration-300"
        >
          <h3 className="text-white font-['Caveat'] text-xl font-bold text-center leading-tight mb-2 line-clamp-2">
            {project.name}
          </h3>
          <p className="text-white/70 font-['Caveat'] text-base">
            Team: {project.teamCount} members
          </p>
          <p className="text-white/70 font-['Caveat'] text-base">
            {project.deadline
              ? `Deadline: ${new Date(project.deadline).toLocaleDateString()}`
              : "No deadline"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function JoinProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onClick={onClick}
      className="cursor-pointer group"
      style={{ width: 280 }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3 } }}
    >
      <div
        style={{
          transform: "rotate(1deg)",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
        className="group-hover:!transform-none"
      >
        {/* Spacer for tab alignment */}
        <div style={{ height: 30 }} />

        <div
          style={{
            backgroundColor: "#fdf6e3",
            height: 170,
            boxShadow: "3px 6px 15px rgba(0,0,0,0.3)",
            borderRadius: "8px",
          }}
          className="flex flex-col items-center justify-center px-4 group-hover:shadow-[4px_10px_25px_rgba(0,0,0,0.45)] transition-shadow duration-300"
        >
          <Plus className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-gray-600 font-['Caveat'] text-xl">Join a Project</p>
          <p className="text-gray-400 font-['Caveat'] text-sm">Enter a class code</p>
        </div>
      </div>
    </motion.div>
  );
}

function JoinProjectPaperModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    try {
      const result = await api.post<{ classroom_id: string; classroom_name: string }>(
        "/api/classrooms/invitations/accept",
        { token: code.trim() }
      );
      toast.success(`Successfully joined ${result.classroom_name || "classroom"}!`);
      setCode("");
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="max-w-md w-full rounded-lg relative"
              style={{
                backgroundColor: "#fdf6e3",
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 31px, #e0d6c8 31px, #e0d6c8 32px)",
                borderLeft: "3px solid #d4a0a0",
                boxShadow: "4px 8px 25px rgba(0,0,0,0.4)",
              }}
            >
              <div className="p-8 pl-10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="font-['Caveat'] text-3xl text-gray-800 mb-2">Join a Project</h2>
                <p className="font-['Caveat'] text-lg text-gray-500 mb-8">
                  Enter the invite code from your email
                </p>

                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Paste your invite code..."
                  className="w-full bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none font-['Caveat'] text-xl text-gray-800 placeholder:text-gray-400 py-2 mb-6 transition-colors"
                  maxLength={10}
                />

                <button
                  onClick={handleJoin}
                  disabled={isLoading || !code.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-['Caveat'] text-xl px-8 py-3 rounded-lg transition-colors"
                >
                  {isLoading ? "Joining..." : "Join"}
                </button>

                <button
                  onClick={onClose}
                  className="w-full text-gray-400 font-['Caveat'] text-lg mt-3 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function StudentProjects() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { refreshClassrooms } = useClassroom();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjectsWithFallback<ApiProject>();
      const transformed: Project[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        created_at: p.created_at,
        deadline: (p as any).deadline || null,
        teamCount: (p as any).group_size || 0,
      }));
      setProjects(transformed);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#b8845a",
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px),
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.02) 40px, rgba(0,0,0,0.02) 41px)
        `,
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-2 font-['Caveat'] text-xl text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <NotificationDropdown />
      </div>

      <ClassroomGate>
        {/* Title */}
        <h1 className="text-white font-['Caveat'] text-4xl text-center mb-8">My Projects</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center pt-12">
            <h2 className="text-white font-['Caveat'] text-2xl mb-2">Your desk is empty</h2>
            <p className="text-white/60 font-['Caveat'] text-lg mb-8">
              Join a project to get started
            </p>
            <JoinProjectCard onClick={() => setShowJoinModal(true)} />
          </div>
        ) : (
          /* Folders grid */
          <div className="flex justify-center px-6 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {projects.map((project, index) => (
                <ProjectFolder
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => navigate(`/student/projects/${project.id}`)}
                />
              ))}
              <JoinProjectCard onClick={() => setShowJoinModal(true)} />
            </div>
          </div>
        )}

        <JoinProjectPaperModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            fetchProjects();
            refreshClassrooms();
          }}
        />
      </ClassroomGate>
    </div>
  );
}
