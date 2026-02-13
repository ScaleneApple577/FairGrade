import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek, startOfMonth, endOfMonth, parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ClassroomGate } from "@/components/student/ClassroomGate";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarAISidebar } from "@/components/calendar/CalendarAISidebar";
import { ScheduleMeetingModal } from "@/components/calendar/ScheduleMeetingModal";
import { getMyAssignments, mapAssignmentToCalendarEvent, type Assignment } from "@/lib/assignmentUtils";

// Interfaces and Types
interface Project { id: string; name: string; courseName: string; }
interface TeamMember { id: string; name: string; available: boolean; }
interface SlotData { date: string; hour: number; availableCount: number; totalMembers: number; members: TeamMember[]; isAIRecommended?: boolean; }
interface Recommendation { rank: number; date: string; startTime: string; endTime: string; availableCount: number; totalMembers: number; missing: string[]; score: number; }
interface Meeting { id: string; title: string; date: string; startTime: string; endTime: string; link?: string; attendees: Array<{ id: string; name: string }>; }
interface TeamMemberStatus { id: string; name: string; hasSetAvailability: boolean; lastUpdated?: string; }
interface CalendarEvent { id: string; title: string; description?: string; date: Date; classroomName?: string; type: "assignment" | "meeting" | "availability"; color: string; }
type ViewMode = "week" | "month";

export default function StudentCalendar() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [availabilityData, setAvailabilityData] = useState<Record<string, Record<number, SlotData>>>({});
  const [myAvailability, setMyAvailability] = useState<Record<string, boolean>>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [teamStatus, setTeamStatus] = useState<TeamMemberStatus[]>([]);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false);
  const [isSettingPreset, setIsSettingPreset] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [prefilledMeeting, setPrefilledMeeting] = useState<{ date: string; startTime: string; endTime: string } | null>(null);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const isCurrentWeek = useMemo(() => isSameWeek(currentDate, new Date(), { weekStartsOn: 1 }), [currentDate]);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const data = await api.get<Array<{ id: string; name: string; description: string | null; created_at: string }>>('/api/projects/projects');
        const projects: Project[] = (data || []).map((p) => ({ id: p.id, name: p.name, courseName: '—' }));
        setProjects(projects);
        if (projects.length > 0) { setSelectedProjectId(projects[0].id); }
      } catch (error) { console.error("Failed to load projects:", error); setProjects([]); }
      finally { setIsLoadingProjects(false); }
    };
    loadProjects();
  }, []);

  // Load assignments and calendar events
  useEffect(() => {
    const loadAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        let startDate: string; let endDate: string;
        if (viewMode === "week") { startDate = format(weekStart, "yyyy-MM-dd"); endDate = format(weekEnd, "yyyy-MM-dd"); }
        else { const monthStart = startOfMonth(currentDate); const monthEnd = endOfMonth(currentDate); startDate = format(monthStart, "yyyy-MM-dd"); endDate = format(monthEnd, "yyyy-MM-dd"); }
        const assignmentsData = await getMyAssignments(startDate, endDate);
        setAssignments(assignmentsData);
        const events: CalendarEvent[] = assignmentsData.map(mapAssignmentToCalendarEvent);
        setCalendarEvents(events);
      } catch (error) { console.error("Failed to load assignments:", error); setAssignments([]); setCalendarEvents([]); }
      finally { setIsLoadingAssignments(false); }
    };
    loadAssignments();
  }, [currentDate, viewMode, weekStart, weekEnd]);

  // Reset availability data when project or week changes
  useEffect(() => { if (!selectedProjectId) return; setIsLoadingAvailability(false); setAvailabilityData({}); setMyAvailability({}); }, [selectedProjectId, weekStart]);

  // Reset sidebar data when project changes
  useEffect(() => { if (!selectedProjectId) return; setIsLoadingSidebar(false); setRecommendations([]); setMeetings([]); setTeamStatus([]); }, [selectedProjectId]);

  const handleToggleAvailability = useCallback(async (date: string, hour: number) => {
    const slotKey = `${date}-${hour}`;
    const newValue = !myAvailability[slotKey];
    setMyAvailability(prev => ({ ...prev, [slotKey]: newValue }));
    toast({ title: "Note", description: "Availability saving is not yet connected to the backend." });
  }, [myAvailability, toast]);

  const handleQuickSet = async (preset: string) => {
    if (!selectedProjectId) return;
    toast({ title: "Note", description: "Availability presets are not yet connected to the backend." });
  };

  const handleSelectRecommendation = (rec: Recommendation) => { setCurrentDate(parseISO(rec.date)); setViewMode("week"); };
  const handleScheduleMeeting = (rec: Recommendation) => { setPrefilledMeeting({ date: rec.date, startTime: rec.startTime, endTime: rec.endTime }); setShowMeetingModal(true); };
  const handleCreateMeeting = async (meeting: { title: string; date: string; startTime: string; endTime: string; durationMinutes: number; link?: string }) => {
    if (!selectedProjectId) return;
    toast({ title: "Note", description: "Meeting scheduling is not yet connected to the backend." });
  };

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());
  const handleSelectDate = (date: Date) => { setCurrentDate(date); setViewMode("week"); };

  const weekViewMeetings = useMemo(() => {
    return meetings.map(m => ({ id: m.id, title: m.title, date: m.date, startHour: parseInt(m.startTime.split(":")[0]), endHour: parseInt(m.endTime.split(":")[0]), link: m.link }));
  }, [meetings]);

  if (isLoadingProjects && isLoadingAssignments) {
    return (
      <StudentLayout pageTitle="Calendar">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Calendar">
      <ClassroomGate>

      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {projects.map((project) => (
            <button key={project.id} onClick={() => setSelectedProjectId(project.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedProjectId === project.id ? "btn-gradient shadow-lg" : "bg-white/[0.06] text-white/40 hover:bg-white/10 hover:text-white/60"
              }`}>
              {project.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="btn-glass px-3"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={goToToday} disabled={isCurrentWeek} className="btn-glass px-3 py-1.5 text-sm disabled:opacity-50">Today</Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek} className="btn-glass px-3"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="text-white font-medium min-w-[220px] text-center">
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-1">
              {(["week", "month"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-all duration-200 ${viewMode === v ? "btn-gradient shadow-lg" : "bg-white/[0.06] text-white/40 hover:bg-white/60"}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {isSaving && (<div className="text-white/30 text-xs flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Saving...</div>)}

          {viewMode === "week" ? (
            <CalendarWeekView weekStart={weekStart} weekEnd={weekEnd} availabilityData={availabilityData} myAvailability={myAvailability}
              meetings={weekViewMeetings} isLoading={isLoadingAvailability} onToggleAvailability={handleToggleAvailability} onSavingChange={setIsSaving} />
          ) : (
            <CalendarMonthView currentDate={currentDate} availabilityData={availabilityData} isLoading={isLoadingAvailability} onSelectDate={handleSelectDate} />
          )}

          {/* Legend */}
          <div className="glass-card !p-3 flex flex-wrap items-center gap-4 md:gap-6">
            {[
              { color: "bg-emerald-500/25 border-emerald-500/20", label: "All Available" },
              { color: "bg-yellow-500/20 border-yellow-500/15", label: "Most Available" },
              { color: "bg-orange-500/15 border-orange-500/10", label: "Some Available" },
              { color: "bg-red-500/10 border-red-500/10", label: "None Available" },
              { color: "bg-blue-500/30 border-blue-500/25", label: "AI Recommended" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${item.color} border`} />
                <span className="text-white/40 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <CalendarAISidebar recommendations={recommendations} meetings={meetings} teamStatus={teamStatus}
          isLoading={isLoadingSidebar} onSelectRecommendation={handleSelectRecommendation} onScheduleMeeting={handleScheduleMeeting}
          onQuickSet={handleQuickSet} isSettingPreset={isSettingPreset} />
      </div>

      <ScheduleMeetingModal isOpen={showMeetingModal} onClose={() => { setShowMeetingModal(false); setPrefilledMeeting(null); }}
        onSchedule={handleCreateMeeting} prefilledDate={prefilledMeeting?.date} prefilledStartTime={prefilledMeeting?.startTime} prefilledEndTime={prefilledMeeting?.endTime} />
      </ClassroomGate>
    </StudentLayout>
  );
}
