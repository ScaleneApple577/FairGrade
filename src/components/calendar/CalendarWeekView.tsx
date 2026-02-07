import { useState, useCallback, useRef } from "react";
import { format, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from "date-fns";

interface TeamMember {
  id: string;
  name: string;
  available: boolean;
}

interface SlotData {
  date: string;
  hour: number;
  availableCount: number;
  totalMembers: number;
  members: TeamMember[];
  isAIRecommended?: boolean;
}

interface MyAvailability {
  [key: string]: boolean; // "2026-02-03-14" -> true/false
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  startHour: number;
  endHour: number;
  link?: string;
}

interface CalendarWeekViewProps {
  weekStart: Date;
  weekEnd: Date;
  availabilityData: Record<string, Record<number, SlotData>>;
  myAvailability: MyAvailability;
  meetings: Meeting[];
  isLoading: boolean;
  onToggleAvailability: (date: string, hour: number) => void;
  onSavingChange: (saving: boolean) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8 AM to 11 PM

export function CalendarWeekView({
  weekStart,
  weekEnd,
  availabilityData,
  myAvailability,
  meetings,
  isLoading,
  onToggleAvailability,
  onSavingChange,
}: CalendarWeekViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{ date: string; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: string; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: string; hour: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getSlotKey = (date: string, hour: number) => `${date}-${hour}`;

  const getSlotColor = (slot: SlotData | undefined) => {
    if (!slot || slot.totalMembers === 0) return "bg-white/[0.02]";
    
    if (slot.isAIRecommended) {
      return "bg-blue-500/30 border-blue-500/25";
    }

    const percentage = slot.availableCount / slot.totalMembers;
    
    if (percentage === 1) return "bg-emerald-500/25 border-emerald-500/20";
    if (percentage > 0.5) return "bg-yellow-500/20 border-yellow-500/15";
    if (percentage > 0) return "bg-orange-500/15 border-orange-500/10";
    return "bg-red-500/10 border-red-500/10";
  };

  const handleMouseDown = (date: string, hour: number) => {
    setIsDragging(true);
    setDragStart({ date, hour });
    setDragEnd({ date, hour });
  };

  const handleMouseEnter = (date: string, hour: number) => {
    if (isDragging && dragStart?.date === date) {
      setDragEnd({ date, hour });
    }
    setHoveredSlot({ date, hour });
  };

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd && dragStart.date === dragEnd.date) {
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour);
      
      onSavingChange(true);
      for (let h = startHour; h <= endHour; h++) {
        onToggleAvailability(dragStart.date, h);
      }
      setTimeout(() => onSavingChange(false), 500);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, onToggleAvailability, onSavingChange]);

  const isInDragRange = (date: string, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    if (dragStart.date !== date) return false;
    const startHour = Math.min(dragStart.hour, dragEnd.hour);
    const endHour = Math.max(dragStart.hour, dragEnd.hour);
    return hour >= startHour && hour <= endHour;
  };

  const getMeetingForSlot = (date: string, hour: number) => {
    return meetings.find(m => m.date === date && hour >= m.startHour && hour < m.endHour);
  };

  const isMeetingStart = (date: string, hour: number) => {
    return meetings.some(m => m.date === date && m.startHour === hour);
  };

  return (
    <div 
      ref={gridRef}
      className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setHoveredSlot(null);
        if (isDragging) handleMouseUp();
      }}
    >
      {/* Header Row - Days */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] bg-white/10 border-b border-white/10">
        <div className="p-2" /> {/* Empty corner */}
        {days.map((day) => (
          <div 
            key={day.toISOString()} 
            className={`p-2 text-center border-l border-white/5 ${isToday(day) ? "bg-blue-500/20" : ""}`}
          >
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">
              {format(day, "EEE")}
            </div>
            <div className={`text-sm font-medium ${isToday(day) ? "text-blue-400" : "text-white"}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[64px_repeat(7,1fr)]">
            {/* Hour Label */}
            <div className="p-2 text-right pr-3 text-slate-500 text-[10px] border-b border-white/5">
              {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>

            {/* Day Cells */}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const slotKey = getSlotKey(dateStr, hour);
              const slot = availabilityData[dateStr]?.[hour];
              const isMyAvailable = myAvailability[slotKey];
              const inDragRange = isInDragRange(dateStr, hour);
              const meeting = getMeetingForSlot(dateStr, hour);
              const showMeetingBlock = isMeetingStart(dateStr, hour);
              const isPast = isBefore(day, startOfDay(new Date())) && !isSameDay(day, new Date());

              return (
                <div
                  key={`${dateStr}-${hour}`}
                  className={`
                    relative h-10 border-l border-b border-white/5 cursor-pointer transition-all
                    ${isLoading ? "animate-pulse" : ""}
                    ${getSlotColor(slot)}
                    ${inDragRange ? "!bg-blue-500/20 border-blue-500" : ""}
                    ${isPast ? "opacity-50 cursor-not-allowed" : "hover:brightness-125"}
                  `}
                  onMouseDown={() => !isPast && handleMouseDown(dateStr, hour)}
                  onMouseEnter={() => handleMouseEnter(dateStr, hour)}
                >
                  {/* My Availability Dot */}
                  {isMyAvailable && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full" />
                  )}

                  {/* Meeting Block */}
                  {showMeetingBlock && meeting && (
                    <div 
                      className="absolute inset-x-0.5 top-0.5 bg-blue-500/40 border border-blue-500/50 rounded-md z-10 px-1 py-0.5"
                      style={{ height: `${(meeting.endHour - meeting.startHour) * 40 - 4}px` }}
                    >
                      <span className="text-white text-[9px] font-medium truncate block">
                        {meeting.title}
                      </span>
                    </div>
                  )}

                  {/* Hover Tooltip */}
                  {hoveredSlot?.date === dateStr && hoveredSlot?.hour === hour && slot && !isDragging && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none">
                      <div className="bg-[#1e293b] border border-white/10 rounded-lg shadow-xl p-3 min-w-[200px]">
                        {slot.isAIRecommended && (
                          <div className="text-blue-400 text-xs font-medium mb-1">⭐ AI Recommended</div>
                        )}
                        <div className="text-white font-medium text-sm">
                          {format(day, "EEEE, MMM d")} • {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"} – {hour + 1 > 12 ? hour + 1 - 12 : hour + 1}:00 {hour + 1 >= 12 ? "PM" : "AM"}
                        </div>
                        <div className="text-slate-300 text-sm mt-1">
                          {slot.availableCount} of {slot.totalMembers} team members available
                        </div>
                        {slot.members.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {slot.members.map((member) => (
                              <div 
                                key={member.id} 
                                className={`text-xs ${member.available ? "text-emerald-400" : "text-red-400"}`}
                              >
                                {member.available ? "✓" : "✗"} {member.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
