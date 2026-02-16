import { getClassroomColor, getInitial } from "@/lib/classroomColors";

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  created_at?: string;
  instructor_name?: string;
}

interface ClassroomCardProps {
  classroom: Classroom;
  onClick: () => void;
}

export function ClassroomCard({ classroom, onClick }: ClassroomCardProps) {
  const color = getClassroomColor(classroom.id);

  return (
    <button
      onClick={onClick}
      className="gc-card w-full text-left overflow-hidden transition-shadow duration-200 cursor-pointer group"
    >
      <div className="h-24 px-4 py-3 flex flex-col justify-between relative" style={{ backgroundColor: color }}>
        <h3 className="text-white text-xl font-medium truncate pr-12">
          {classroom.name}
        </h3>
        <p className="text-white/80 text-sm truncate">
          {classroom.instructor_name || (classroom.student_count !== undefined ? `${classroom.student_count} students` : '')}
        </p>
        <div className="absolute right-4 top-3 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium text-lg">
          {getInitial(classroom.name)}
        </div>
      </div>
      <div className="h-20 px-4 py-3">
        <p className="text-sm text-[#5f6368]">
          {classroom.student_count !== undefined ? `${classroom.student_count} students` : ''}
        </p>
      </div>
    </button>
  );
}
