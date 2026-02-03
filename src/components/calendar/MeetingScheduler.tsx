import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedTime {
  day: number;
  hour: number;
  available_count: number;
  total_members: number;
}

interface MeetingSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  suggestedTimes?: SuggestedTime[];
  onSubmit: (meeting: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
  }) => void;
  isSubmitting?: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function MeetingScheduler({
  open,
  onOpenChange,
  projectId,
  suggestedTimes = [],
  onSubmit,
  isSubmitting = false,
}: MeetingSchedulerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedTime | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !startTime) return;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 1000);

    onSubmit({
      title,
      description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location,
    });
  };

  const selectSuggestion = (suggestion: SuggestedTime) => {
    setSelectedSuggestion(suggestion);
    
    // Get the next occurrence of this day
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = suggestion.day - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    
    setDate(nextDate.toISOString().split('T')[0]);
    setStartTime(`${suggestion.hour.toString().padStart(2, '0')}:00`);
    setShowSuggestions(false);
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage === 100) return 'text-green-400';
    if (percentage >= 75) return 'text-green-300';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Meeting
          </DialogTitle>
          <DialogDescription>
            Create a new meeting for your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly sync"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the meeting about?"
              rows={2}
            />
          </div>

          {/* Find Best Time button */}
          {suggestedTimes.length > 0 && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                Find Best Time
              </Button>

              {showSuggestions && (
                <div className="mt-2 p-3 rounded-lg border border-border bg-background/50 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Times with most availability:
                  </p>
                  {suggestedTimes.slice(0, 5).map((time, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSuggestion(time)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-md",
                        "hover:bg-accent/50 transition-colors text-left",
                        selectedSuggestion === time && "bg-accent"
                      )}
                    >
                      <span className="text-sm">
                        {DAYS[time.day]} at {formatHour(time.hour)}
                      </span>
                      <span className={cn("text-sm font-medium", getAvailabilityColor(time.available_count, time.total_members))}>
                        <Users className="h-3 w-3 inline mr-1" />
                        {time.available_count}/{time.total_members}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start Time *</Label>
              <Input
                id="time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location / Link</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Zoom link or room number"
                className="pl-10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
