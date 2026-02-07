import { useNavigate } from "react-router-dom";
import { LiveEdit } from "@/hooks/useLiveStatus";

interface LiveEditsNotificationProps {
  liveEdits: LiveEdit[];
  totalActive: number;
  variant?: "sidebar" | "dashboard";
}

/**
 * A notification component showing currently active edits.
 * Can be used in sidebar (compact) or dashboard (full card).
 */
export function LiveEditsNotification({
  liveEdits,
  totalActive,
  variant = "sidebar",
}: LiveEditsNotificationProps) {
  const navigate = useNavigate();

  // Don't render if no active edits
  if (totalActive === 0) return null;

  if (variant === "sidebar") {
    return (
      <button
        onClick={() => navigate("/teacher/live-monitor")}
        className="w-full bg-red-500/15 border border-red-500/20 rounded-lg px-3 py-2 mx-3 mb-2 hover:bg-red-500/25 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-red-400 text-xs font-medium">
            {totalActive} live edit{totalActive !== 1 ? "s" : ""}
          </span>
        </div>
      </button>
    );
  }

  // Dashboard variant - full card
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-white text-sm font-medium">
          {totalActive} document{totalActive !== 1 ? "s" : ""} being edited right now
        </span>
      </div>

      <div className="space-y-2">
        {liveEdits.slice(0, 5).map((edit) => (
          <button
            key={`${edit.fileId}-${edit.studentId}`}
            onClick={() => navigate(`/teacher/projects/${edit.projectId}`)}
            className="w-full flex items-center justify-between p-2 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] transition text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0">
                {edit.fileType === "google_doc" ? "📄" : edit.fileType === "google_sheet" ? "📊" : "📽"}
              </span>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{edit.fileName}</p>
                <p className="text-slate-400 text-[10px] truncate">
                  {edit.studentName} • {edit.projectName}
                </p>
              </div>
            </div>
            <span className="text-blue-400 text-[10px] flex-shrink-0 ml-2">View →</span>
          </button>
        ))}

        {liveEdits.length > 5 && (
          <button
            onClick={() => navigate("/teacher/live-monitor")}
            className="w-full text-center text-blue-400 text-xs hover:text-blue-300 py-1"
          >
            +{liveEdits.length - 5} more...
          </button>
        )}
      </div>
    </div>
  );
}
