import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, isToday } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapSlot {
  available_count: number;
  total_members: number;
  percentage: number;
  available_members: string[];
  unavailable_members: string[];
}

// Flexible type to handle multiple data formats from API
type HeatmapCellValue = HeatmapSlot | number;

interface HeatmapData {
  [dateKey: string]: {
    [hourKey: string]: HeatmapCellValue;
  };
}

interface HeatmapViewProps {
  heatmapData: HeatmapData;
  totalMembers: number;
  weekStart: Date;
  weekEnd: Date;
  onCellClick?: (date: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

function getAvailabilityColor(available: number, total: number): string {
  if (total === 0) return 'bg-slate-200';
  
  const percentage = (available / total) * 100;
  
  if (percentage === 100) {
    return 'bg-green-500'; // Dark green - everyone
  } else if (percentage >= 75) {
    return 'bg-green-400'; // Light green - most
  } else if (percentage >= 50) {
    return 'bg-yellow-400'; // Yellow - half
  } else if (percentage > 0) {
    return 'bg-red-400'; // Red - few
  } else {
    return 'bg-slate-200'; // Gray - none
  }
}

export function HeatmapView({
  heatmapData,
  totalMembers,
  weekStart,
  weekEnd,
  onCellClick,
}: HeatmapViewProps) {
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${ampm}`;
  };

  const formatTimeRange = (hour: number) => {
    const startAmpm = hour >= 12 ? 'pm' : 'am';
    const endHour = hour + 1;
    const endAmpm = endHour >= 12 ? 'pm' : 'am';
    const displayStart = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayEnd = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
    return `${displayStart}${startAmpm} - ${displayEnd}${endAmpm}`;
  };

  const getSlotData = (date: Date, hour: number): HeatmapSlot => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const hourKey = `${hour}:00`;
    
    const slot = heatmapData?.[dateKey]?.[hourKey];
    
    if (slot && typeof slot === 'object' && 'available_count' in slot) {
      return slot;
    }
    
    // Handle simple count format
    if (typeof slot === 'number') {
      return {
        available_count: slot,
        total_members: totalMembers,
        percentage: totalMembers > 0 ? (slot / totalMembers) * 100 : 0,
        available_members: [],
        unavailable_members: [],
      };
    }
    
    return {
      available_count: 0,
      total_members: totalMembers,
      percentage: 0,
      available_members: [],
      unavailable_members: [],
    };
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-slate-600">Everyone (100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-400" />
          <span className="text-slate-600">Most (75%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400" />
          <span className="text-slate-600">Half (50-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400" />
          <span className="text-slate-600">Few (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-200" />
          <span className="text-slate-600">None (0%)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row with real dates */}
          <div className="grid grid-cols-8 gap-1">
            <div className="p-2 text-center text-sm font-medium text-slate-500">
              Time
            </div>
            {days.map((day) => {
              const isTodayDate = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 text-center",
                    isTodayDate && "bg-blue-50 rounded-t-lg border-t-2 border-x-2 border-primary"
                  )}
                >
                  <div className="text-sm font-medium text-slate-500">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    isTodayDate ? "text-primary" : "text-slate-900"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          {HOURS.map((hour, hourIndex) => (
            <div key={hour} className="grid grid-cols-8 gap-1 mt-1">
              {/* Time label */}
              <div className="p-2 text-xs text-slate-500 flex items-center justify-center h-12 md:h-16">
                {formatHour(hour)}
              </div>
              
              {/* Day cells - NO TEXT, only colors */}
              {days.map((day) => {
                const slotData = getSlotData(day, hour);
                const bgColor = getAvailabilityColor(slotData.available_count, slotData.total_members);
                const isTodayDate = isToday(day);
                const isLastHour = hourIndex === HOURS.length - 1;
                
                return (
                  <Tooltip key={`${day.toISOString()}-${hour}`} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onCellClick?.(day, hour)}
                        className={cn(
                          "h-12 md:h-16 rounded border border-slate-200 cursor-pointer transition-all",
                          "hover:brightness-95 hover:scale-[1.02]",
                          bgColor,
                          isTodayDate && "border-primary/50",
                          isTodayDate && isLastHour && "rounded-b-lg"
                        )}
                        aria-label={`${format(day, 'EEEE MMMM d')}, ${formatHour(hour)}: ${slotData.available_count} of ${slotData.total_members} members available`}
                      />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="max-w-xs bg-slate-900 border-slate-700 p-3"
                    >
                      <div className="text-sm space-y-2">
                        <div className="font-semibold text-white border-b border-slate-700 pb-2">
                          {format(day, 'EEE MMM d, yyyy')} • {formatTimeRange(hour)}
                        </div>
                        
                        {slotData.available_count > 0 && (
                          <div>
                            <p className="text-green-400 font-medium">
                              ✓ Available ({slotData.available_count}):
                            </p>
                            <p className="text-slate-300 text-xs mt-1">
                              {slotData.available_members.length > 0 
                                ? slotData.available_members.join(', ') 
                                : `${slotData.available_count} members`}
                            </p>
                          </div>
                        )}
                        
                        {(slotData.total_members - slotData.available_count) > 0 && (
                          <div>
                            <p className="text-red-400 font-medium">
                              ✗ Unavailable ({slotData.total_members - slotData.available_count}):
                            </p>
                            <p className="text-slate-300 text-xs mt-1">
                              {slotData.unavailable_members.length > 0 
                                ? slotData.unavailable_members.join(', ') 
                                : `${slotData.total_members - slotData.available_count} members`}
                            </p>
                          </div>
                        )}
                        
                        {slotData.available_count === 0 && slotData.total_members === 0 && (
                          <p className="text-slate-500">No availability data</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
