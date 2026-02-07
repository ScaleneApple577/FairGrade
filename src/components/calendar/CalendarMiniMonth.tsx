import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarMiniMonthProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarMiniMonth({ currentDate, onSelectDate }: CalendarMiniMonthProps) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(currentDate));
  const today = new Date();

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white text-sm font-medium">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-slate-500 text-[10px] font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isSelected = isSameDay(day, currentDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                w-7 h-7 text-xs rounded-full flex items-center justify-center transition
                ${!isCurrentMonth ? "text-slate-700" : "text-slate-400 hover:bg-white/10"}
                ${isToday ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                ${isSelected && !isToday ? "bg-white/20 text-white" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
