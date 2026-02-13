import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek
} from "date-fns";

interface SlotData { availableCount: number; totalMembers: number; }

interface CalendarMonthViewProps {
  currentDate: Date;
  availabilityData: Record<string, Record<number, SlotData>>;
  isLoading: boolean;
  onSelectDate: (date: Date) => void;
  whiteboard?: boolean;
}

export function CalendarMonthView({ currentDate, availabilityData, isLoading, onSelectDate, whiteboard }: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wb = whiteboard;

  const getDaySummary = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayData = availabilityData[dateStr];
    if (!dayData) return null;
    let fullyAvailableHours = 0; let partiallyAvailableHours = 0;
    Object.values(dayData).forEach((slot) => {
      if (slot.totalMembers === 0) return;
      const pct = slot.availableCount / slot.totalMembers;
      if (pct === 1) fullyAvailableHours++; else if (pct > 0) partiallyAvailableHours++;
    });
    return { fullyAvailableHours, partiallyAvailableHours };
  };

  return (
    <div className={wb ? "bg-white/60 border border-gray-200 rounded-xl overflow-hidden" : "bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"}>
      <div className={`grid grid-cols-7 ${wb ? "bg-gray-50 border-b border-gray-200" : "bg-white/10 border-b border-white/10"}`}>
        {weekDays.map((day) => (
          <div key={day} className={`p-3 text-center text-xs font-medium uppercase tracking-wider ${wb ? "font-['Caveat'] text-gray-400 text-sm" : "text-slate-400"}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const summary = getDaySummary(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`min-h-[100px] p-2 cursor-pointer transition ${
                wb
                  ? `border-b border-r border-gray-200/70 ${!isCurrentMonth ? "bg-gray-50/50" : "hover:bg-blue-50/30"}`
                  : `border-b border-r border-white/5 ${!isCurrentMonth ? "bg-white/[0.01]" : "hover:bg-white/[0.05]"}`
              } ${isLoading ? "animate-pulse" : ""}`}
            >
              <div className={wb ? "relative inline-block" : ""}>
                <span className={`text-sm font-medium mb-1 ${
                  wb
                    ? `font-['Caveat'] text-lg ${!isCurrentMonth ? "text-gray-300" : isDayToday ? "text-[#333] font-bold" : "text-[#333]"}`
                    : `${!isCurrentMonth ? "text-slate-600" : isDayToday ? "text-blue-400" : "text-white"}`
                }`}>
                  {format(day, "d")}
                </span>
                {wb && isDayToday && (
                  <span className="absolute inset-0 -m-1 border-2 border-[#2563eb] rounded-full pointer-events-none" />
                )}
              </div>
              {summary && isCurrentMonth && (
                <div className="space-y-1 mt-1">
                  {summary.fullyAvailableHours > 0 && (
                    <div className={`text-[9px] ${wb ? "font-['Caveat'] text-emerald-600 text-xs" : "text-emerald-400"}`}>
                      {summary.fullyAvailableHours} hrs fully available
                    </div>
                  )}
                  {summary.partiallyAvailableHours > 0 && (
                    <div className={`text-[9px] ${wb ? "font-['Caveat'] text-yellow-600 text-xs" : "text-yellow-400"}`}>
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
