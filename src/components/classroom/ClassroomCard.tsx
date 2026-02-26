import type { MouseEvent } from "react";
import { Users, FileText } from "lucide-react";

const COLOR_CLASSES = [
  "bg-blue-500",
  "bg-red-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-teal-500",
];

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  created_at?: string;
  instructor_name?: string;
}

interface ClassroomCardProps {
  classroom: Classroom;
  assignmentCount?: number;
  onClick: () => void;
  index: number;
  onHoverStart?: (rect: DOMRect) => void;
  onHoverEnd?: () => void;
}

export function ClassroomCard({
  classroom,
  assignmentCount = 0,
  onClick,
  index,
  onHoverStart,
  onHoverEnd,
}: ClassroomCardProps) {
  const studentCount = classroom.student_count ?? 0;
  const created = classroom.created_at ? new Date(classroom.created_at).toLocaleDateString() : '';
  const colorClass = COLOR_CLASSES[index % COLOR_CLASSES.length];

  return (
    <div
      onClick={onClick}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) =>
        onHoverStart?.(e.currentTarget.getBoundingClientRect())
      }
      onMouseLeave={() => onHoverEnd?.()}
      className={`gc-card relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 border-none rounded-2xl overflow-hidden min-h-[250px] max-h-[300px] min-w-[350px] max-w-[450px] ${colorClass}`}
    >
      <div className="grid grid-cols-[7fr_3fr] h-full">
        <div className="flex items-start pl-5 pr-3 pt-4 pb-4">
          <h3 className="text-4xl font-bold text-white leading-tight line-clamp-3 text-left">
            {classroom.name}
          </h3>
        </div>
        <div className="flex flex-col border-l border-white/30 bg-white/10 min-w-0">
          <div className="flex-1 flex items-center justify-center border-b border-white/30 px-2 py-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-7 h-7 text-white shrink-0" />
              <span className="text-xl font-semibold text-white">{studentCount}</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-2 py-4">
            <div className="flex items-center gap-1.5">
              <FileText className="w-7 h-7 text-white shrink-0" />
              <span className="text-xl font-semibold text-white">{assignmentCount}</span>
            </div>
          </div>
        </div>
      </div>
      {created && (
        <div className="absolute bottom-2 right-3">
          <p className="text-[11px] text-white/80">Created {created}</p>
        </div>
      )}
    </div>
  );
}
