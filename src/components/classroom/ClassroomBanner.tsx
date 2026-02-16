import { getClassroomColor } from "@/lib/classroomColors";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ClassroomBannerProps {
  id: string;
  name: string;
  joinCode?: string;
  studentCount?: number;
}

export function ClassroomBanner({ id, name, joinCode, studentCount }: ClassroomBannerProps) {
  const color = getClassroomColor(id);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-36 px-6 py-4 flex flex-col justify-end relative rounded-lg" style={{ backgroundColor: color }}>
      <h1 className="text-white text-3xl font-medium">{name}</h1>
      {studentCount !== undefined && (
        <p className="text-white/80 text-sm mt-1">{studentCount} students</p>
      )}
      {joinCode && (
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : `Code: ${joinCode}`}
        </button>
      )}
    </div>
  );
}
