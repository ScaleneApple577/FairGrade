import { FileText } from "lucide-react";
import { format } from "date-fns";

interface AssignmentCardProps {
  project: { id: string; name: string; description?: string; created_at: string };
  onClick: () => void;
}

export function AssignmentCard({ project, onClick }: AssignmentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left gc-card flex items-start gap-4 p-4 hover:bg-[hsl(220,10%,97%)] transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#202124]">{project.name}</p>
        {project.description && (
          <p className="text-sm text-[#5f6368] mt-0.5 truncate">{project.description}</p>
        )}
        <p className="text-xs text-[#5f6368] mt-1">
          Posted {format(new Date(project.created_at), "MMM d, yyyy")}
        </p>
      </div>
    </button>
  );
}
