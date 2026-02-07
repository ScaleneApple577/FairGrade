import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO: GET http://localhost:8000/api/student/notifications?type=project_assignment&status=unread
interface ProjectAssignment {
  id: string;
  notificationId: string;
  projectId: string;
  projectName: string;
  courseName: string;
  deadline: string;
  teamSize: number;
}

interface ProjectAssignmentBannerProps {
  assignments: ProjectAssignment[];
  onDismiss: (notificationId: string) => void;
}

export function ProjectAssignmentBanner({ assignments, onDismiss }: ProjectAssignmentBannerProps) {
  const navigate = useNavigate();

  if (assignments.length === 0) return null;

  const handleDismiss = async (notificationId: string) => {
    // TODO: PUT http://localhost:8000/api/student/notifications/{notification_id}/dismiss
    // await fetch(`http://localhost:8000/api/student/notifications/${notificationId}/dismiss`, { method: 'PUT' });
    onDismiss(notificationId);
  };

  return (
    <div className="space-y-3 mb-6">
      {assignments.map((assignment, index) => (
        <motion.div
          key={assignment.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: index * 0.1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-6 h-6 text-blue-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">
                You've been assigned to a new project!
              </p>
              <p className="text-blue-400 text-sm mt-0.5">
                {assignment.projectName} — {assignment.courseName}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Deadline: {assignment.deadline} • Team size: {assignment.teamSize} students
              </p>
              <p className="text-blue-300 text-xs mt-1">
                📄 Submit your Google Docs to get started
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => navigate("/student/projects")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                View Project
              </Button>
              <button
                onClick={() => handleDismiss(assignment.notificationId)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
