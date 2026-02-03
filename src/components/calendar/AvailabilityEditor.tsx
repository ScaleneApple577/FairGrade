import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Save, X, Trash2 } from "lucide-react";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityEditorProps {
  projectId: string;
  existingSlots?: AvailabilitySlot[];
  onSave: (slots: AvailabilitySlot[]) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

export function AvailabilityEditor({
  projectId,
  existingSlots = [],
  onSave,
  onCancel,
  isSaving = false,
}: AvailabilityEditorProps) {
  // Convert existing slots to a set of selected cells
  const initializeSelectedCells = useCallback(() => {
    const cells = new Set<string>();
    existingSlots.forEach(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const endHour = parseInt(slot.end_time.split(':')[0]);
      for (let hour = startHour; hour < endHour; hour++) {
        cells.add(`${slot.day_of_week}-${hour}`);
      }
    });
    return cells;
  }, [existingSlots]);

  const [selectedCells, setSelectedCells] = useState<Set<string>>(initializeSelectedCells);
  const [isRecurring, setIsRecurring] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

  const getCellKey = (day: number, hour: number) => `${day}-${hour}`;

  const handleMouseDown = (day: number, hour: number) => {
    const key = getCellKey(day, hour);
    const isSelected = selectedCells.has(key);
    
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragMode(isSelected ? 'remove' : 'add');
    
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (isSelected) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (!isDragging) return;
    
    const key = getCellKey(day, hour);
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (dragMode === 'add') {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleSave = () => {
    // Convert selected cells to availability slots
    const slotsByDay: Record<number, number[]> = {};
    
    selectedCells.forEach(key => {
      const [day, hour] = key.split('-').map(Number);
      if (!slotsByDay[day]) {
        slotsByDay[day] = [];
      }
      slotsByDay[day].push(hour);
    });

    const slots: AvailabilitySlot[] = [];
    
    Object.entries(slotsByDay).forEach(([day, hours]) => {
      hours.sort((a, b) => a - b);
      
      // Group consecutive hours into slots
      let slotStart = hours[0];
      let slotEnd = hours[0] + 1;
      
      for (let i = 1; i <= hours.length; i++) {
        if (i < hours.length && hours[i] === slotEnd) {
          slotEnd = hours[i] + 1;
        } else {
          slots.push({
            day_of_week: parseInt(day),
            start_time: `${slotStart.toString().padStart(2, '0')}:00`,
            end_time: `${slotEnd.toString().padStart(2, '0')}:00`,
          });
          if (i < hours.length) {
            slotStart = hours[i];
            slotEnd = hours[i] + 1;
          }
        }
      }
    });

    onSave(slots);
  };

  const handleClear = () => {
    setSelectedCells(new Set());
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${ampm}`;
  };

  return (
    <div 
      className="w-full select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring" className="text-sm">
              Recurring weekly
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground mb-4">
        Click and drag to select your available times. Blue cells indicate when you're available.
      </p>

      {/* Grid */}
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
                const isSelected = selectedCells.has(getCellKey(dayIndex, hour));
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    onMouseDown={() => handleMouseDown(dayIndex, hour)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, hour)}
                    className={cn(
                      "h-10 rounded border border-border cursor-pointer transition-colors",
                      "flex items-center justify-center",
                      isSelected 
                        ? "bg-primary/60 border-primary hover:bg-primary/70" 
                        : "bg-card hover:bg-accent/30"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
