import { useState } from "react";
import { Star } from "lucide-react";

interface HalfStarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  showValue?: boolean;
}

export function HalfStarRating({
  rating,
  onRate,
  size = "md",
  interactive = false,
  showValue = false,
}: HalfStarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleMouseMove = (starIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(starIndex + (isHalf ? 0.5 : 1));
  };

  const handleClick = (starIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive || !onRate) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    onRate(starIndex + (isHalf ? 0.5 : 1));
  };

  const renderStar = (starIndex: number) => {
    const filled = displayRating >= starIndex + 1;
    const halfFilled = !filled && displayRating >= starIndex + 0.5;

    return (
      <button
        key={starIndex}
        type="button"
        disabled={!interactive}
        className={`relative ${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}`}
        onMouseMove={(e) => handleMouseMove(starIndex, e)}
        onMouseLeave={() => setHoverRating(null)}
        onClick={(e) => handleClick(starIndex, e)}
      >
        {/* Background (empty) star */}
        <Star className={`${sizeClasses[size]} text-slate-600`} />
        
        {/* Filled overlay */}
        {(filled || halfFilled) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: filled ? "100%" : "50%" }}
          >
            <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {showValue && (
        <span className="ml-2 text-slate-300 text-sm">
          {rating > 0 ? `${rating.toFixed(1)} / 5` : "0 / 5"}
        </span>
      )}
    </div>
  );
}
