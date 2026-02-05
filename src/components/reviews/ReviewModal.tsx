import { useState, useEffect } from "react";
import { X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HalfStarRating } from "./HalfStarRating";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Teammate {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  teammate: Teammate | null;
  projectName: string;
  onSubmit: (data: {
    teammateId: string;
    projectId: string;
    rating: number;
    feedback: string;
    anonymous: boolean;
  }) => Promise<void>;
}

export function ReviewModal({
  isOpen,
  onClose,
  teammate,
  projectName,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [ratingInput, setRatingInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxCharacters = 500;
  const isOverLimit = feedback.length > maxCharacters;
  const canSubmit = rating > 0 && feedback.trim().length > 0 && !isOverLimit && !isSubmitting;

  // Sync rating input with star rating
  useEffect(() => {
    if (rating > 0) {
      setRatingInput(rating.toFixed(1));
    }
  }, [rating]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setRatingInput("");
      setFeedback("");
      setAnonymous(true);
    }
  }, [isOpen]);

  const handleRatingInputChange = (value: string) => {
    setRatingInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      // Round to nearest 0.5
      const rounded = Math.round(numValue * 2) / 2;
      setRating(rounded);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !teammate) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        teammateId: teammate.id,
        projectId: projectName,
        rating,
        feedback,
        anonymous,
      });
      toast.success(`Review submitted for ${teammate.name}`);
      onClose();
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!teammate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold">
                  Review {teammate.name}
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar and Project */}
              <div className="flex flex-col items-center mb-8">
                <div
                  className={`w-16 h-16 ${teammate.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3`}
                >
                  {teammate.avatar}
                </div>
                <span className="bg-white/10 text-slate-300 text-sm px-3 py-1 rounded-full">
                  {projectName}
                </span>
              </div>

              {/* Rating Section */}
              <div className="mb-6">
                <label className="text-white font-medium mb-3 block">
                  Overall Rating
                </label>
                <div className="flex items-center gap-4">
                  <HalfStarRating
                    rating={rating}
                    onRate={setRating}
                    size="lg"
                    interactive
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={ratingInput}
                      onChange={(e) => handleRatingInputChange(e.target.value)}
                      placeholder="0.0"
                      className="w-20 bg-white/5 border-white/10 text-white text-center"
                    />
                    <span className="text-slate-400 text-sm">/ 5</span>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mb-6">
                <label className="text-white font-medium mb-2 block">
                  Written Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What did this teammate do well? What could they improve? Be specific and constructive..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 min-h-[120px] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none outline-none transition-colors"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      isOverLimit ? "text-red-400" : "text-slate-500"
                    }`}
                  >
                    {feedback.length} / {maxCharacters}
                  </span>
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">
                    Submit anonymously
                  </span>
                  <Switch
                    checked={anonymous}
                    onCheckedChange={setAnonymous}
                  />
                </div>
                <p className="text-slate-600 text-xs mt-1">
                  Your instructor will see your name, but your teammate will not.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors ${
                    canSubmit
                      ? "hover:bg-blue-600"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
