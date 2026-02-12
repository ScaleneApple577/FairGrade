import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameWeek,
  startOfMonth,
  endOfMonth,
  parseISO
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
import { 
  getMyAssignments, 
  mapAssignmentToCalendarEvent,
  type Assignment 
} from "@/lib/assignmentUtils";

// Types
interface Project {
  id: string;
  name: string;
  courseName: string;
}

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

interface Recommendation {
  rank: number;
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  totalMembers: number;
  missing: string[];
  score: number;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  link?: string;
  attendees: Array<{ id: string; name: string }>;
}

interface TeamMemberStatus {
  id: string;
  name: string;
  hasSetAvailability: boolean;
  lastUpdated?: string;
}

// Calendar event type for unified display
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  classroomName?: string;
  type: "assignment" | "meeting" | "availability";
  color: string;
}

type ViewMode = "week" | "month";

export default function StudentCalendar() {
  const { toast } = useToast();
  
  // Core state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  
  // Availability state
  const [availabilityData, setAvailabilityData] = useState<Record<string, Record<number, SlotData>>>({});
  const [myAvailability, setMyAvailability] = useState<Record<string, boolean>>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI & Meetings state
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [teamStatus, setTeamStatus] = useState<TeamMemberStatus[]>([]);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false);
  const [isSettingPreset, setIsSettingPreset] = useState(false);
  
  // Assignments state — powered by GET /api/assignments/mine
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  
  // Modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [prefilledMeeting, setPrefilledMeeting] = useState<{ date: string; startTime: string; endTime: string } | null>(null);

  // Computed values
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const isCurrentWeek = useMemo(() => isSameWeek(currentDate, new Date(), { weekStartsOn: 1 }), [currentDate]);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        // Backend returns: [{ id, name, description, created_at }]
        const data = await api.get<Array<{ id: string; name: string; description: string | null; created_at: string }>>('/api/projects/projects');
        // Transform to expected format
        const projects: Project[] = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          courseName: '—', // Not returned by backend
        }));
        setProjects(projects);
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].id);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  // Load assignments when date range changes — GET /api/assignments/mine
  useEffect(() => {
    const loadAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        // Calculate date range based on view mode
        let startDate: string;
        let endDate: string;
        
        if (viewMode === "week") {
          startDate = format(weekStart, "yyyy-MM-dd");
          endDate = format(weekEnd, "yyyy-MM-dd");
        } else {
          const monthStart = startOfMonth(currentDate);
          const monthEnd = endOfMonth(currentDate);
          startDate = format(monthStart, "yyyy-MM-dd");
          endDate = format(monthEnd, "yyyy-MM-dd");
        }
        
        // Fetch assignments from backend
        const assignmentsData = await getMyAssignments(startDate, endDate);
        setAssignments(assignmentsData);
        
        // Convert assignments to calendar events
        const events: CalendarEvent[] = assignmentsData.map(mapAssignmentToCalendarEvent);
        setCalendarEvents(events);
      } catch (error) {
        console.error("Failed to load assignments:", error);
        setAssignments([]);
        setCalendarEvents([]);
      } finally {
        setIsLoadingAssignments(false);
      }
    };
    
    loadAssignments();
  }, [currentDate, viewMode, weekStart, weekEnd]);

  // Load availability data when project or date changes
  // TODO: Availability endpoint does not exist yet on the backend
  useEffect(() => {
    if (!selectedProjectId) return;
    setIsLoadingAvailability(false);
    setAvailabilityData({});
    setMyAvailability({});
  }, [selectedProjectId, weekStart]);

  // Load sidebar data (recommendations, meetings, team status)
  // TODO: These endpoints do not exist on the backend yet
  useEffect(() => {
    if (!selectedProjectId) return;
    setIsLoadingSidebar(false);
    setRecommendations([]);
    setMeetings([]);
    setTeamStatus([]);
  }, [selectedProjectId]);

  // Toggle availability for a slot
  // TODO: Availability endpoint does not exist yet on the backend
  const handleToggleAvailability = useCallback(async (date: string, hour: number) => {
    const slotKey = `${date}-${hour}`;
    const newValue = !myAvailability[slotKey];
    setMyAvailability(prev => ({
      ...prev,
      [slotKey]: newValue
    }));
    toast({
      title: "Note",
      description: "Availability saving is not yet connected to the backend.",
    });
  }, [myAvailability, toast]);

  // Quick set availability presets
  // TODO: Availability endpoint does not exist yet on the backend
  const handleQuickSet = async (preset: string) => {
    if (!selectedProjectId) return;
    toast({
      title: "Note",
      description: "Availability presets are not yet connected to the backend.",
    });
  };

  // Handle AI recommendation selection
  const handleSelectRecommendation = (rec: Recommendation) => {
    // Scroll to that date in the calendar
    setCurrentDate(parseISO(rec.date));
    setViewMode("week");
  };

  // Open meeting modal with prefilled data
  const handleScheduleMeeting = (rec: Recommendation) => {
    setPrefilledMeeting({
      date: rec.date,
      startTime: rec.startTime,
      endTime: rec.endTime,
    });
    setShowMeetingModal(true);
  };

  // Schedule a meeting
  const handleCreateMeeting = async (meeting: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    link?: string;
  }) => {
    if (!selectedProjectId) return;
    
    // TODO: Meetings endpoint does not exist yet on the backend
    toast({
      title: "Note",
      description: "Meeting scheduling is not yet connected to the backend.",
    });
  };

  // Navigation handlers
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());
  const handleSelectDate = (date: Date) => {
    setCurrentDate(date);
    setViewMode("week");
  };

  // Convert meetings to week view format
  const weekViewMeetings = useMemo(() => {
    return meetings.map(m => ({
      id: m.id,
      title: m.title,
      date: m.date,
      startHour: parseInt(m.startTime.split(":")[0]),
      endHour: parseInt(m.endTime.split(":")[0]),
      link: m.link,
    }));
  }, [meetings]);

  // Loading state - only show for initial load, always show calendar after
  if (isLoadingProjects && isLoadingAssignments) {
    return (
      <StudentLayout pageTitle="Calendar">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-slate-400">Loading calendar...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Always show the calendar, even with no projects
  // Assignments are user-level (not project-level), so they show regardless
  return (
    <StudentLayout pageTitle="Calendar">
      <ClassroomGate>

      {/* Project Selector - optional, only shows if user has projects for availability */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedProjectId === project.id
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-400 hover:bg-white/15 hover:text-white"
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column - Calendar */}
        <div className="space-y-4">

          {/* Calendar Navigation Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="bg-white/10 border-white/10 text-white hover:bg-white/15 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                disabled={isCurrentWeek}
                className="bg-white/10 border-white/10 text-white hover:bg-white/15 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="bg-white/10 border-white/10 text-white hover:bg-white/15 px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-white font-medium min-w-[220px] text-center">
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  viewMode === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  viewMode === "month"
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Saving Indicator */}
          {isSaving && (
            <div className="text-slate-500 text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </div>
          )}

          {/* Calendar View */}
          {viewMode === "week" ? (
            <CalendarWeekView
              weekStart={weekStart}
              weekEnd={weekEnd}
              availabilityData={availabilityData}
              myAvailability={myAvailability}
              meetings={weekViewMeetings}
              isLoading={isLoadingAvailability}
              onToggleAvailability={handleToggleAvailability}
              onSavingChange={setIsSaving}
            />
          ) : (
            <CalendarMonthView
              currentDate={currentDate}
              availabilityData={availabilityData}
              isLoading={isLoadingAvailability}
              onSelectDate={handleSelectDate}
            />
          )}

          {/* Legend */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/25 border border-emerald-500/20" />
              <span className="text-slate-300 text-xs">All Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/15" />
              <span className="text-slate-300 text-xs">Most Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/15 border border-orange-500/10" />
              <span className="text-slate-300 text-xs">Some Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/10 border border-red-500/10" />
              <span className="text-slate-300 text-xs">None Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500/25" />
              <span className="text-slate-300 text-xs">AI Recommended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/[0.02] border border-white/5" />
              <span className="text-slate-300 text-xs">No Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-300 text-xs">Your Availability</span>
            </div>
          </div>
        </div>

        {/* Right Column - AI Sidebar */}
        {/* TODO: When teams API is available, use team context from /api/teams for availability recommendations */}
        <CalendarAISidebar
          recommendations={recommendations}
          meetings={meetings}
          teamStatus={teamStatus}
          isLoading={isLoadingSidebar}
          onSelectRecommendation={handleSelectRecommendation}
          onScheduleMeeting={handleScheduleMeeting}
          onQuickSet={handleQuickSet}
          isSettingPreset={isSettingPreset}
        />
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={showMeetingModal}
        onClose={() => {
          setShowMeetingModal(false);
          setPrefilledMeeting(null);
        }}
        onSchedule={handleCreateMeeting}
        prefilledDate={prefilledMeeting?.date}
        prefilledStartTime={prefilledMeeting?.startTime}
        prefilledEndTime={prefilledMeeting?.endTime}
      />
      </ClassroomGate>
    </StudentLayout>
  );
}
