import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-slate-900">{weekLabel}</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          className="border-slate-200 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="border-slate-200 hover:bg-slate-50"
        >
          Today
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          className="border-slate-200 hover:bg-slate-50"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
