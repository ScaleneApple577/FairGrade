import { FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface FileListItemProps {
  file: { id: string; name: string; drive_file_id: string; mime_type: string; created_at: string };
}

export function FileListItem({ file }: FileListItemProps) {
  const docUrl = `https://docs.google.com/document/d/${file.drive_file_id}/edit`;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#e0e0e0] last:border-0">
      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
        >
          {file.name}
          <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-xs text-[#5f6368]">
          {format(new Date(file.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
}
