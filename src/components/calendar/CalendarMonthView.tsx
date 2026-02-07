import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  startOfWeek,
  endOfWeek,
  getDay
} from "date-fns";

interface SlotData {
  availableCount: number;
  totalMembers: number;
}

interface CalendarMonthViewProps {
  currentDate: Date;
  availabilityData: Record<string, Record<number, SlotData>>;
  isLoading: boolean;
  onSelectDate: (date: Date) => void;
}

export function CalendarMonthView({
  currentDate,
  availabilityData,
  isLoading,
  onSelectDate,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaySummary = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayData = availabilityData[dateStr];
    
    if (!dayData) return null;

    let fullyAvailableHours = 0;
    let partiallyAvailableHours = 0;
    
    Object.values(dayData).forEach((slot) => {
      if (slot.totalMembers === 0) return;
      const percentage = slot.availableCount / slot.totalMembers;
      if (percentage === 1) fullyAvailableHours++;
      else if (percentage > 0) partiallyAvailableHours++;
    });

    return { fullyAvailableHours, partiallyAvailableHours };
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 bg-white/10 border-b border-white/10">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const summary = getDaySummary(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                min-h-[100px] p-2 border-b border-r border-white/5 cursor-pointer transition
                ${!isCurrentMonth ? "bg-white/[0.01]" : "hover:bg-white/[0.05]"}
                ${isDayToday ? "border-blue-500 border-2" : ""}
                ${isLoading ? "animate-pulse" : ""}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${!isCurrentMonth ? "text-slate-600" : isDayToday ? "text-blue-400" : "text-white"}`}>
                {format(day, "d")}
              </div>
              
              {summary && isCurrentMonth && (
                <div className="space-y-1">
                  {summary.fullyAvailableHours > 0 && (
                    <div className="text-[9px] text-emerald-400">
                      {summary.fullyAvailableHours} hrs fully available
                    </div>
                  )}
                  {summary.partiallyAvailableHours > 0 && (
                    <div className="text-[9px] text-yellow-400">
                      {summary.partiallyAvailableHours} hrs partial
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
