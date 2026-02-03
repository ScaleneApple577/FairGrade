import { cn } from "@/lib/utils";
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
  [key: string]: {
    [key: string]: HeatmapCellValue;
  };
}

interface HeatmapViewProps {
  heatmapData: HeatmapData;
  totalMembers: number;
  onCellClick?: (day: number, hour: number) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_INDICES: Record<string, number> = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6
};
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

function getAvailabilityColor(available: number, total: number): string {
  if (total === 0) return 'bg-zinc-800';
  
  const percentage = (available / total) * 100;
  
  if (percentage === 100) {
    return 'bg-green-600'; // Dark green - everyone
  } else if (percentage >= 75) {
    return 'bg-green-400'; // Light green - most
  } else if (percentage >= 50) {
    return 'bg-yellow-500'; // Yellow - half
  } else if (percentage > 0) {
    return 'bg-red-500'; // Red - few
  } else {
    return 'bg-zinc-800'; // Gray - none
  }
}

function getTextColor(available: number, total: number): string {
  if (total === 0) return 'text-zinc-500';
  
  const percentage = (available / total) * 100;
  
  if (percentage >= 50 && percentage < 75) {
    return 'text-black'; // Yellow background needs dark text
  }
  return 'text-white';
}

export function HeatmapView({
  heatmapData,
  totalMembers,
  onCellClick,
}: HeatmapViewProps) {
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${ampm}`;
  };

  const getSlotData = (dayIndex: number, hour: number): HeatmapSlot => {
    const dayName = DAYS[dayIndex].toLowerCase();
    const hourKey = `${hour}:00`;
    
    // Check multiple key formats
    const slot = heatmapData?.[dayName]?.[hourKey] || 
                 heatmapData?.[hourKey]?.[dayIndex.toString()] ||
                 heatmapData?.[dayIndex.toString()]?.[hourKey];
    
    if (slot && typeof slot === 'object' && 'available_count' in slot) {
      return slot;
    }
    
    // Handle simple count format from edge function
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
          <div className="w-4 h-4 rounded bg-green-600" />
          <span className="text-muted-foreground">Everyone (100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-400" />
          <span className="text-muted-foreground">Most (75%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-muted-foreground">Half (50-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-muted-foreground">Few (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-800" />
          <span className="text-muted-foreground">None (0%)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row with days */}
          <div className="grid grid-cols-8 gap-1">
            <div className="p-2 text-center text-sm font-medium text-muted-foreground">
              Time
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time grid */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-1 mt-1">
              {/* Time label */}
              <div className="p-2 text-xs text-muted-foreground flex items-center justify-center h-10">
                {formatHour(hour)}
              </div>
              
              {/* Day cells */}
              {DAYS.map((_, dayIndex) => {
                const slotData = getSlotData(dayIndex, hour);
                const bgColor = getAvailabilityColor(slotData.available_count, slotData.total_members);
                const textColor = getTextColor(slotData.available_count, slotData.total_members);
                
                return (
                  <Tooltip key={`${dayIndex}-${hour}`}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onCellClick?.(dayIndex, hour)}
                        className={cn(
                          "h-10 rounded border border-border cursor-pointer transition-all",
                          "flex items-center justify-center",
                          "hover:scale-105 hover:brightness-110",
                          bgColor,
                          textColor
                        )}
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        <span className="font-semibold text-sm md:text-base">
                          {slotData.available_count}/{slotData.total_members}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-sm">
                        <p className="font-medium mb-1">
                          {DAYS[dayIndex]} at {formatHour(hour)}
                        </p>
                        <p className="text-green-400">
                          Available: {slotData.available_members.length > 0 
                            ? slotData.available_members.join(', ') 
                            : slotData.available_count > 0 ? `${slotData.available_count} members` : 'None'}
                        </p>
                        {slotData.unavailable_members.length > 0 && (
                          <p className="text-red-400">
                            Unavailable: {slotData.unavailable_members.join(', ')}
                          </p>
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
