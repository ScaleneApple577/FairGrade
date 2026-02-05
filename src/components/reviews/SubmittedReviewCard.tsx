import { Lock } from "lucide-react";
import { HalfStarRating } from "./HalfStarRating";

interface SubmittedReviewCardProps {
  teammateName: string;
  teammateAvatar: string;
  teammateColor: string;
  projectName: string;
  rating: number;
  feedback: string;
  submittedAt: string;
  anonymous: boolean;
}

export function SubmittedReviewCard({
  teammateName,
  teammateAvatar,
  teammateColor,
  projectName,
  rating,
  feedback,
  submittedAt,
  anonymous,
}: SubmittedReviewCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${teammateColor} rounded-full flex items-center justify-center text-white font-bold`}
          >
            {teammateAvatar}
          </div>
          <span className="text-white font-medium">{teammateName}</span>
        </div>
        <span className="bg-white/10 text-slate-400 text-xs px-2 py-0.5 rounded-full">
          {projectName}
        </span>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <HalfStarRating rating={rating} size="sm" showValue />
      </div>

      {/* Feedback */}
      <p className="text-slate-300 text-sm mb-3 leading-relaxed">{feedback}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-slate-600 text-xs">Submitted {submittedAt}</span>
        {anonymous && (
          <span className="text-slate-500 text-xs flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Anonymous
          </span>
        )}
      </div>
    </div>
  );
}
