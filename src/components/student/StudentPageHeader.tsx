import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

interface StudentPageHeaderProps {
  /** Optional override for back link text */
  backLabel?: string;
  /** Optional override for back link destination */
  backTo?: string;
  /** Dark text (for light backgrounds like whiteboard). Default true. */
  darkText?: boolean;
}

export function StudentPageHeader({ 
  backLabel = "Back to Dashboard", 
  backTo = "/student/dashboard",
  darkText = true,
}: StudentPageHeaderProps) {
  const navigate = useNavigate();

  const textColor = darkText 
    ? "text-gray-500 hover:text-gray-800" 
    : "text-white/80 hover:text-white";

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <button
        onClick={() => navigate(backTo)}
        className={`flex items-center gap-2 font-['Caveat'] text-xl transition-colors ${textColor}`}
      >
        <ArrowLeft className="w-5 h-5" />
        {backLabel}
      </button>
      <NotificationDropdown />
    </div>
  );
}
