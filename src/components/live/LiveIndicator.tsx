import { useState } from "react";

interface LiveIndicatorProps {
  isLive: boolean;
  editors?: string[];
  size?: "sm" | "md";
  showTooltip?: boolean;
}

/**
 * A pulsing "LIVE" indicator badge for files being actively edited.
 * Only renders when isLive is true - renders null otherwise for clean UI.
 */
export function LiveIndicator({
  isLive,
  editors = [],
  size = "md",
  showTooltip = true,
}: LiveIndicatorProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);

  if (!isLive) return null;

  const isSmall = size === "sm";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
    >
      <div
        className={`
          flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full
          ${isSmall ? "px-1.5 py-0.5" : "px-2.5 py-1"}
        `}
      >
        {/* Pulsing red dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>

        {/* LIVE text */}
        <span
          className={`
            text-red-400 font-bold uppercase tracking-wider
            ${isSmall ? "text-[8px]" : "text-[10px]"}
          `}
        >
          LIVE
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipState && editors.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none">
          <div className="bg-[#1e293b] border border-white/10 rounded-lg p-2 shadow-xl whitespace-nowrap">
            <p className="text-white text-xs font-medium">Being edited right now by:</p>
            <div className="mt-1">
              {editors.map((editor, idx) => (
                <p key={idx} className="text-slate-300 text-xs">
                  {editor}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A small pulsing dot indicator for avatars/status columns.
 * Shows editing (red pulse), active (green), or offline (gray).
 */
interface StatusDotProps {
  status: "editing" | "active" | "offline";
  className?: string;
}

export function StatusDot({ status, className = "" }: StatusDotProps) {
  const baseClasses = "w-3 h-3 rounded-full border-2 border-[#111827]";

  if (status === "editing") {
    return (
      <span className={`relative flex ${className}`}>
        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 border-2 border-[#111827]" />
        <span className={`${baseClasses} bg-red-500`} />
      </span>
    );
  }

  if (status === "active") {
    return <span className={`${baseClasses} bg-emerald-500 ${className}`} />;
  }

  return <span className={`${baseClasses} bg-slate-500 ${className}`} />;
}

/**
 * A text label showing what the student is currently editing.
 */
interface EditingLabelProps {
  fileName: string;
}

export function EditingLabel({ fileName }: EditingLabelProps) {
  return (
    <span className="text-red-400 text-[10px] italic truncate max-w-[120px]">
      Editing {fileName}
    </span>
  );
}
