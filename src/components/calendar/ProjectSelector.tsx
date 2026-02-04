import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Users } from "lucide-react";

interface Project {
  id: string;
  name: string;
  member_count: number;
  course_name?: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  isLoading?: boolean;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
  isLoading = false,
}: ProjectSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <FolderOpen className="h-5 w-5 text-slate-400" />
        <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-3 text-slate-500">
        <FolderOpen className="h-5 w-5" />
        <span className="text-sm">No projects available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <FolderOpen className="h-5 w-5 text-primary" />
      <Select value={selectedProjectId || undefined} onValueChange={onSelectProject}>
        <SelectTrigger className="w-64 md:w-80 bg-white border-slate-200">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200">
          {projects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id}
              className="cursor-pointer hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{project.name}</span>
                {project.course_name && (
                  <span className="text-xs text-slate-500">
                    ({project.course_name})
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                  <Users className="h-3 w-3" />
                  {project.member_count}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
