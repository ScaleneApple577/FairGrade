import { useState, useEffect } from "react";
import { MoreVertical, User, Send, FolderPlus, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
}

interface StudentActionsMenuProps {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: "active" | "pending" | "inactive";
  onRefresh: () => void;
}

export function StudentActionsMenu({
  studentId,
  studentName,
  studentEmail,
  status,
  onRefresh,
}: StudentActionsMenuProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const fetchProjects = async () => {
    if (projects.length > 0) return;
    setIsLoadingProjects(true);
    try {
      // TODO: GET /api/teacher/projects
      const data = await api.get("/api/teacher/projects");
      setProjects(data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleResendInvite = async () => {
    setIsResending(true);
    try {
      // TODO: POST /api/teacher/students/{student_id}/resend-invite
      await api.post(`/api/teacher/students/${studentId}/resend-invite`);
      toast.success(`Invitation resent to ${studentEmail}`);
    } catch (error) {
      console.error("Failed to resend invite:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setIsResending(false);
    }
  };

  const handleAssignToProject = async (projectId: string, projectName: string) => {
    try {
      // TODO: POST /api/projects/{project_id}/students
      await api.post(`/api/projects/${projectId}/students`, { student_id: studentId });
      toast.success(`${studentName || studentEmail} assigned to ${projectName}`);
      onRefresh();
    } catch (error) {
      console.error("Failed to assign student:", error);
      toast.error("Failed to assign student to project");
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      // TODO: DELETE /api/teacher/students/{student_id}
      await api.delete(`/api/teacher/students/${studentId}`);
      toast.success(`${studentName || studentEmail} removed from classroom`);
      setShowRemoveDialog(false);
      onRefresh();
    } catch (error) {
      console.error("Failed to remove student:", error);
      toast.error("Failed to remove student");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-slate-400 hover:text-white p-1 rounded transition">
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#1e293b] border-white/10 text-white min-w-[180px]"
        >
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-white/10">
            <User className="w-4 h-4" />
            View Profile
          </DropdownMenuItem>

          {status === "pending" && (
            <DropdownMenuItem
              onClick={handleResendInvite}
              disabled={isResending}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/10"
            >
              {isResending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Resend Invitation
            </DropdownMenuItem>
          )}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              onPointerEnter={fetchProjects}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/10"
            >
              <FolderPlus className="w-4 h-4" />
              Assign to Project
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1e293b] border-white/10 text-white">
              {isLoadingProjects ? (
                <div className="px-3 py-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading...
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-slate-400 text-sm">
                  No projects yet
                </div>
              ) : (
                projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => handleAssignToProject(project.id, project.name)}
                    className="cursor-pointer hover:bg-white/10"
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-red-500/15 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Remove from Classroom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="bg-[#1e293b] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Remove Student?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to remove{" "}
              <span className="text-white font-medium">
                {studentName || studentEmail}
              </span>{" "}
              from your classroom? They will be removed from all projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
