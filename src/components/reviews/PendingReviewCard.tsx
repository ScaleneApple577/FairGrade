import { CheckCircle } from "lucide-react";

interface Teammate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  color: string;
  reviewed?: boolean;
}

interface PendingReviewCardProps {
  projectName: string;
  deadline: string;
  daysUntilDue: number;
  teammates: Teammate[];
  completedCount: number;
  totalCount: number;
  onReview: (teammate: Teammate) => void;
  onViewReview: (teammate: Teammate) => void;
}

export function PendingReviewCard({
  projectName,
  deadline,
  daysUntilDue,
  teammates,
  completedCount,
  totalCount,
  onReview,
  onViewReview,
}: PendingReviewCardProps) {
  const getDueBadgeStyle = () => {
    if (daysUntilDue < 0) {
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    }
    if (daysUntilDue <= 3) {
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    }
    return "bg-green-500/20 text-green-400 border border-green-500/30";
  };

  const getDueBadgeText = () => {
    if (daysUntilDue < 0) {
      return "Overdue";
    }
    if (daysUntilDue === 0) {
      return "Due today";
    }
    if (daysUntilDue === 1) {
      return "Due tomorrow";
    }
    return `Due in ${daysUntilDue} days`;
  };

  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">{projectName}</h3>
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getDueBadgeStyle()}`}>
          {getDueBadgeText()}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-slate-400 text-sm mb-4">
        Review {totalCount} teammates • Closes {deadline}
      </p>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Progress</span>
          <span className="text-slate-400">
            {completedCount} of {totalCount} completed
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Teammate List */}
      <div className="space-y-3">
        {teammates.map((teammate) => (
          <div
            key={teammate.id}
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
              teammate.reviewed
                ? "bg-white/5 border-l-2 border-green-400 border border-l-2 border-white/5"
                : "bg-white/5 hover:bg-white/10 border border-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${teammate.color} rounded-full flex items-center justify-center text-white font-bold`}
              >
                {teammate.avatar}
              </div>
              <div>
                <p className="text-white font-medium">{teammate.name}</p>
                {teammate.reviewed ? (
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Review submitted
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">{teammate.role}</p>
                )}
              </div>
            </div>
            {teammate.reviewed ? (
              <button
                onClick={() => onViewReview(teammate)}
                className="bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/15 transition-colors"
              >
                View
              </button>
            ) : (
              <button
                onClick={() => onReview(teammate)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Review
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
