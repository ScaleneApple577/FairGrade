import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarHeaderProps {
  currentWeekStart: Date;
  onNavigate: (date: Date) => void;
}

export function CalendarHeader({ currentWeekStart, onNavigate }: CalendarHeaderProps) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // Format: "Feb 10 - Feb 16, 2026"
  const isSameMonth = format(currentWeekStart, 'MMM') === format(weekEnd, 'MMM');
  const weekLabel = isSameMonth
    ? `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`
    : `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const handlePreviousWeek = () => {
    onNavigate(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    onNavigate(addWeeks(currentWeekStart, 1));
  };

  const handleToday = () => {
    onNavigate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const isCurrentWeek = format(currentWeekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <div className="flex items-center justify-between">
      {/* Left: Calendar icon + date range with fixed min-width to prevent layout shift */}
      <div className="flex items-center gap-2 min-w-[220px]">
        <Calendar className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">{weekLabel}</h2>
      </div>
      
      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreviousWeek}
          className="flex items-center gap-1 bg-white/10 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <button
          onClick={handleToday}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isCurrentWeek
              ? 'bg-blue-500/20 border border-blue-400/30 text-blue-400'
              : 'bg-white/10 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
          }`}
        >
          Today
        </button>
        
        <button
          onClick={handleNextWeek}
          className="flex items-center gap-1 bg-white/10 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
