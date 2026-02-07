import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CircularScoreRingProps {
  score: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 32, stroke: 3, fontSize: "text-xs", ring: 12 },
  md: { width: 48, stroke: 4, fontSize: "text-sm", ring: 18 },
  lg: { width: 80, stroke: 6, fontSize: "text-xl", ring: 32 },
  xl: { width: 128, stroke: 8, fontSize: "text-4xl", ring: 52 },
};

export function CircularScoreRing({
  score,
  size = "md",
  showLabel = true,
  animate = true,
  className,
}: CircularScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score ?? 0);
  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = config.width / 2;

  useEffect(() => {
    if (!animate || score === null) {
      setDisplayScore(score ?? 0);
      return;
    }

    let start = 0;
    const duration = 800;
    const startTime = performance.now();

    const animateScore = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * score);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };

    requestAnimationFrame(animateScore);
  }, [score, animate]);

  const getScoreColor = (s: number | null) => {
    if (s === null) return { stroke: "stroke-slate-600", text: "text-slate-400", bg: "bg-slate-600" };
    if (s >= 80) return { stroke: "stroke-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500" };
    if (s >= 60) return { stroke: "stroke-blue-500", text: "text-blue-400", bg: "bg-blue-500" };
    if (s >= 40) return { stroke: "stroke-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500" };
    return { stroke: "stroke-red-500", text: "text-red-400", bg: "bg-red-500" };
  };

  const colors = getScoreColor(score);
  const offset = score !== null ? circumference - (displayScore / 100) * circumference : circumference;

  return (
    <div className={cn("relative", className)} style={{ width: config.width, height: config.width }}>
      <svg
        className="transform -rotate-90"
        width={config.width}
        height={config.width}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={config.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colors.stroke, "transition-all duration-300")}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", config.fontSize, colors.text)}>
            {score !== null ? displayScore : "—"}
          </span>
        </div>
      )}
    </div>
  );
}

export function getScoreLabel(score: number | null): { label: string; emoji: string } {
  if (score === null) return { label: "No Data", emoji: "—" };
  if (score >= 90) return { label: "Exceptional", emoji: "⭐" };
  if (score >= 80) return { label: "Strong Contributor", emoji: "✅" };
  if (score >= 70) return { label: "Good", emoji: "👍" };
  if (score >= 60) return { label: "Satisfactory", emoji: "📊" };
  if (score >= 40) return { label: "Needs Improvement", emoji: "⚠" };
  return { label: "At Risk", emoji: "🚨" };
}

export function getScoreColorClass(score: number | null): string {
  if (score === null) return "text-slate-400";
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function getScoreBadgeClass(score: number | null): string {
  if (score === null) return "bg-slate-500/15 text-slate-400";
  if (score >= 80) return "bg-emerald-500/15 text-emerald-400";
  if (score >= 60) return "bg-blue-500/15 text-blue-400";
  if (score >= 40) return "bg-yellow-500/15 text-yellow-400";
  return "bg-red-500/15 text-red-400";
}
