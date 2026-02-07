import { cn } from "@/lib/utils";
import { getScoreBadgeClass } from "./CircularScoreRing";

interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "font-bold rounded-lg",
        sizeClasses[size],
        getScoreBadgeClass(score),
        className
      )}
    >
      {score !== null ? score : "—"}
    </span>
  );
}
