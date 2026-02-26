import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getMyAssignments,
  formatDueDate,
  getAssignmentUrgency,
  getUrgencyStyles,
  type Assignment,
} from "@/lib/assignmentUtils";

export default function TeacherCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const data = await getMyAssignments(
          format(monthStart, "yyyy-MM-dd"),
          format(monthEnd, "yyyy-MM-dd")
        );
        setAssignments(data);
      } catch (error) {
        console.error("Failed to load assignments:", error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    assignments.forEach((a) => {
      const key = format(new Date(a.due_date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [assignments]);

  const selectedDateAssignments = selectedDate
    ? assignmentsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Assignment Calendar</h1>
            <p className="text-xs text-muted-foreground">
              View due dates across all your classes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayAssignments = assignmentsByDate[key] || [];
                  const inMonth = isSameMonth(day, currentDate);
                  const today = isToday(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(day)}
                      className={[
                        "relative min-h-[80px] p-1.5 rounded-md text-left border transition-colors",
                        !inMonth ? "bg-muted/40 text-muted-foreground/70" : "bg-card",
                        selected
                          ? "border-primary bg-primary/5"
                          : today
                          ? "border-primary/60 bg-primary/5"
                          : "border-border hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                          today ? "bg-primary text-primary-foreground" : "text-foreground",
                        ].join(" ")}
                      >
                        {format(day, "d")}
                      </span>
                      {dayAssignments.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayAssignments.slice(0, 2).map((a) => (
                            <div
                              key={String(a.id)}
                              className="bg-primary/10 text-primary text-[10px] px-1 py-0.5 rounded truncate"
                            >
                              {a.title}
                            </div>
                          ))}
                          {dayAssignments.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">
                              +{dayAssignments.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
              </h3>
            </div>

            {selectedDate ? (
              selectedDateAssignments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAssignments.map((assignment) => {
                    const urgency = getAssignmentUrgency(assignment);
                    const urgencyStyles = getUrgencyStyles(urgency);
                    return (
                      <div
                        key={String(assignment.id)}
                        className={`p-3 rounded-md border-l-2 ${urgencyStyles.border} ${urgencyStyles.bg}`}
                      >
                        <h4 className="text-sm font-medium text-foreground">{assignment.title}</h4>
                        {assignment.classroom_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {assignment.classroom_name}
                          </p>
                        )}
                        <span
                          className={`mt-1 inline-flex items-center gap-1 text-[11px] ${urgencyStyles.text}`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDueDate(assignment.due_date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No assignments due on this date.
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click a date in the calendar to see due assignments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

