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
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
        <div className="h-10 w-64 bg-zinc-800 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <FolderOpen className="h-5 w-5" />
        <span className="text-sm">No projects available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <FolderOpen className="h-5 w-5 text-blue-400" />
      <Select value={selectedProjectId || undefined} onValueChange={onSelectProject}>
        <SelectTrigger className="w-64 md:w-80 bg-zinc-900 border-zinc-700">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {projects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id}
              className="cursor-pointer hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{project.name}</span>
                {project.course_name && (
                  <span className="text-xs text-muted-foreground">
                    ({project.course_name})
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
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
