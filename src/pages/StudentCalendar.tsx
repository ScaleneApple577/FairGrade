import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameWeek,
  parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { StudentLayout } from "@/components/student/StudentLayout";
import { CalendarMiniMonth } from "@/components/calendar/CalendarMiniMonth";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarAISidebar } from "@/components/calendar/CalendarAISidebar";
import { ScheduleMeetingModal } from "@/components/calendar/ScheduleMeetingModal";

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

  // Load availability data when project or date changes
  useEffect(() => {
    if (!selectedProjectId) return;
    
    const loadAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        // TODO: api.get('/api/projects/projects/{project_id}/availability') - endpoint may not exist
        const data = await api.get(`/api/projects/projects/${selectedProjectId}/availability`);
        
        // Transform API response to our format
        if (data?.teamMembers) {
          const transformed: Record<string, Record<number, SlotData>> = {};
          const mySlots: Record<string, boolean> = {};
          
          // Process availability data
          // This would be transformed from the API response
          setAvailabilityData(transformed);
          setMyAvailability(mySlots);
        } else {
          setAvailabilityData({});
          setMyAvailability({});
        }
      } catch (error) {
        console.error("Failed to load availability:", error);
        setAvailabilityData({});
        setMyAvailability({});
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    
    loadAvailability();
  }, [selectedProjectId, weekStart]);

  // Load sidebar data (recommendations, meetings, team status)
  useEffect(() => {
    if (!selectedProjectId) return;
    
    const loadSidebarData = async () => {
      setIsLoadingSidebar(true);
      try {
        // TODO: Parallel API calls for sidebar data - endpoints may not exist yet
        const [recsData, meetingsData, statusData] = await Promise.all([
          api.get(`/api/projects/projects/${selectedProjectId}/availability/recommendations`).catch(() => ({ recommendations: [] })),
          api.get(`/api/projects/projects/${selectedProjectId}/meetings`).catch(() => ({ meetings: [] })),
          api.get(`/api/projects/projects/${selectedProjectId}/availability/status`).catch(() => ({ members: [] })),
        ]);
        
        setRecommendations(recsData?.recommendations || []);
        setMeetings(meetingsData?.meetings || []);
        setTeamStatus(statusData?.members || []);
      } catch (error) {
        console.error("Failed to load sidebar data:", error);
      } finally {
        setIsLoadingSidebar(false);
      }
    };
    
    loadSidebarData();
  }, [selectedProjectId]);

  // Toggle availability for a slot
  const handleToggleAvailability = useCallback(async (date: string, hour: number) => {
    const slotKey = `${date}-${hour}`;
    const newValue = !myAvailability[slotKey];
    
    // Optimistic update
    setMyAvailability(prev => ({
      ...prev,
      [slotKey]: newValue
    }));

    try {
      // TODO: api.post('/api/projects/projects/{project_id}/availability') - endpoint may not exist
      await api.post(`/api/projects/projects/${selectedProjectId}/availability`, {
        slots: [{ date, hour, available: newValue }]
      });
    } catch (error) {
      console.error("Failed to save availability:", error);
      // Revert on error
      setMyAvailability(prev => ({
        ...prev,
        [slotKey]: !newValue
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save availability. Please try again.",
      });
    }
  }, [selectedProjectId, myAvailability, toast]);

  // Quick set availability presets
  const handleQuickSet = async (preset: string) => {
    if (!selectedProjectId) return;
    
    setIsSettingPreset(true);
    try {
      // TODO: api.post('/api/projects/projects/{project_id}/availability/bulk') - endpoint may not exist
      await api.post(`/api/projects/projects/${selectedProjectId}/availability/bulk`, { preset });
      
      toast({
        title: "Availability Updated",
        description: preset === "clear" ? "Your availability has been cleared." : "Your availability has been set.",
      });
      
      // Reload availability data
      const data = await api.get(`/api/projects/projects/${selectedProjectId}/availability`);
      // Update state with new data
    } catch (error) {
      console.error("Failed to set preset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update availability. Please try again.",
      });
    } finally {
      setIsSettingPreset(false);
    }
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
    
    try {
      // TODO: api.post('/api/projects/projects/{project_id}/meetings') - endpoint may not exist
      await api.post(`/api/projects/projects/${selectedProjectId}/meetings`, meeting);
      
      toast({
        title: "Meeting Scheduled",
        description: "Your team has been notified.",
      });
      
      // Reload meetings
      const data = await api.get(`/api/projects/projects/${selectedProjectId}/meetings`);
      setMeetings(data?.meetings || []);
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
      });
      throw error;
    }
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

  // Loading state
  if (isLoadingProjects) {
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

  return (
    <StudentLayout pageTitle="Calendar">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Calendar</h1>
        <p className="text-slate-400 text-sm">Manage your availability and find the best meeting times</p>
      </div>

      {/* Project Selector */}
      {projects.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">No Projects Yet</h3>
          <p className="text-slate-400 text-sm">
            Join a project to access the calendar.
          </p>
        </div>
      ) : (
        <>
          {/* Project Tabs */}
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

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left Column - Calendar */}
            <div className="space-y-4">
              {/* Mini Month Calendar */}
              <CalendarMiniMonth 
                currentDate={currentDate} 
                onSelectDate={handleSelectDate} 
              />

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
        </>
      )}

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
    </StudentLayout>
  );
}
