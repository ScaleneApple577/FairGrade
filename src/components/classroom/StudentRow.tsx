import { format } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  email: string;
  first_name?: string;
  last_name?: string;
  joined_at?: string;
}

interface StudentRowProps {
  student: Student;
  onRemove: (email: string) => void;
}

function getInitials(s: Student): string {
  if (s.first_name) {
    return (s.first_name.charAt(0) + (s.last_name?.charAt(0) || '')).toUpperCase();
  }
  return s.email.charAt(0).toUpperCase();
}

function getDisplayName(s: Student): string {
  if (s.first_name) {
    return `${s.first_name} ${s.last_name || ''}`.trim();
  }
  return s.email;
}

const AVATAR_COLORS = ['#1a73e8', '#137333', '#8430ce', '#e8710a', '#0d7377', '#c5221f'];

function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function StudentRow({ student, onRemove }: StudentRowProps) {
  return (
    <div className="flex items-center justify-between py-3 px-1 hover:bg-[#f8f9fa] rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ backgroundColor: getAvatarColor(student.email) }}
        >
          {getInitials(student)}
        </div>
        <div>
          <p className="text-sm font-medium text-[#202124]">{getDisplayName(student)}</p>
          <p className="text-xs text-[#5f6368]">{student.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {student.joined_at && (
          <span className="text-xs text-[#5f6368]">
            Joined {format(new Date(student.joined_at), 'MMM d, yyyy')}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full hover:bg-[#e8eaed] transition-colors">
              <MoreVertical className="w-4 h-4 text-[#5f6368]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRemove(student.email)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
