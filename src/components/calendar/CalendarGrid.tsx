import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'meeting' | 'availability';
}

interface CalendarGridProps {
  events?: CalendarEvent[];
  selectedSlots?: Set<string>;
  onCellClick?: (day: number, hour: number) => void;
  onCellDrag?: (startDay: number, startHour: number, endDay: number, endHour: number) => void;
  isEditing?: boolean;
  weekStart?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am to 10pm

export function CalendarGrid({
  events = [],
  selectedSlots = new Set(),
  onCellClick,
  onCellDrag,
  isEditing = false,
  weekStart = new Date(),
}: CalendarGridProps) {
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${ampm}`;
  };

  const getCellKey = (day: number, hour: number) => `${day}-${hour}`;

  const isSlotSelected = (day: number, hour: number) => {
    return selectedSlots.has(getCellKey(day, hour));
  };

  const getEventsForCell = (day: number, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventDay = eventStart.getDay();
      const eventHour = eventStart.getHours();
      return eventDay === day && eventHour === hour;
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row with days */}
        <div className="grid grid-cols-8 gap-px bg-border">
          <div className="bg-card p-2 text-center text-sm font-medium text-muted-foreground">
            Time
          </div>
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="bg-card p-2 text-center text-sm font-medium text-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8 gap-px bg-border">
          {HOURS.map((hour) => (
            <>
              {/* Time label */}
              <div
                key={`time-${hour}`}
                className="bg-card p-2 text-xs text-muted-foreground flex items-center justify-center h-12"
              >
                {formatHour(hour)}
              </div>
              
              {/* Day cells */}
              {DAYS.map((_, dayIndex) => {
                const cellEvents = getEventsForCell(dayIndex, hour);
                const isSelected = isSlotSelected(dayIndex, hour);
                
                return (
                  <div
                    key={getCellKey(dayIndex, hour)}
                    onClick={() => onCellClick?.(dayIndex, hour)}
                    className={cn(
                      "bg-card h-12 border-l border-border cursor-pointer transition-colors relative",
                      isEditing && "hover:bg-primary/20",
                      isSelected && "bg-primary/40 hover:bg-primary/50",
                      cellEvents.length > 0 && "bg-purple-500/30"
                    )}
                  >
                    {cellEvents.map((event, idx) => (
                      <div
                        key={event.id}
                        className="absolute inset-1 bg-purple-500 rounded text-xs text-white p-1 truncate"
                        style={{ top: `${idx * 24}px` }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
