import { useState } from "react";
import { format, parseISO } from "date-fns";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (meeting: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    link?: string;
  }) => Promise<void>;
  prefilledDate?: string;
  prefilledStartTime?: string;
  prefilledEndTime?: string;
}

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSchedule,
  prefilledDate,
  prefilledStartTime,
  prefilledEndTime,
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(prefilledDate || format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(prefilledStartTime || "14:00");
  const [duration, setDuration] = useState(60);
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update when prefilled values change
  useState(() => {
    if (prefilledDate) setDate(prefilledDate);
    if (prefilledStartTime) setStartTime(prefilledStartTime);
  });

  const calculateEndTime = () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSchedule({
        title: title.trim(),
        date,
        startTime,
        endTime: calculateEndTime(),
        durationMinutes: duration,
        link: link.trim() || undefined,
      });
      // Reset form
      setTitle("");
      setLink("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-white text-lg font-semibold mb-4">Schedule Meeting</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-300 text-sm">Meeting Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sprint Review"
              className="mt-1 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date" className="text-slate-300 text-sm">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 bg-white/10 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-slate-300 text-sm">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 bg-white/10 border-white/10 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration" className="text-slate-300 text-sm">Duration</Label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full bg-white/10 border border-white/10 text-white rounded-md px-3 py-2 text-sm"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="link" className="text-slate-300 text-sm">Meeting Link (optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Zoom/Google Meet link..."
              className="mt-1 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
