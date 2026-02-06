import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HeatmapView } from "@/components/calendar/HeatmapView";
import { AvailabilityEditor } from "@/components/calendar/AvailabilityEditor";
import { MeetingScheduler } from "@/components/calendar/MeetingScheduler";
import { MeetingList } from "@/components/calendar/MeetingList";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { ProjectSelector } from "@/components/calendar/ProjectSelector";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  Calendar,
  Users,
  Clock,
  Plus,
  Edit3,
  LayoutGrid,
  List,
  Vote,
  Loader2,
} from "lucide-react";

// TODO: Connect to GET http://localhost:8000/api/availability/heatmap/{project_id}
// TODO: Connect to GET http://localhost:8000/api/meetings
// TODO: Connect to GET http://localhost:8000/api/polls
// TODO: Connect to GET http://localhost:8000/api/student/projects

interface Project {
  id: string;
  name: string;
  member_count: number;
  course_name: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  created_by: string;
  attendees: Array<{ id: string; name: string; status: "accepted" | "declined" | "invited"; attended: boolean }>;
}

export default function StudentCalendar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("heatmap");
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [checkingInMeeting, setCheckingInMeeting] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  
  const currentWeekEnd = useMemo(() => 
    endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    [currentWeekStart]
  );

  const handleWeekNavigate = (newWeekStart: Date) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentWeekStart(newWeekStart);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 100);
  };

  const currentProject = projects.find(p => p.id === currentProjectId);
  const totalMembers = currentProject?.member_count || 0;
  
  // Generate empty heatmap data
  const heatmapData = useMemo(() => {
    const days = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    
    const data: Record<string, Record<string, {
      available_count: number;
      total_members: number;
      percentage: number;
      available_members: string[];
      unavailable_members: string[];
    }>> = {};

    days.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      data[dateKey] = {};
      
      hours.forEach((hour) => {
        const hourKey = `${hour}:00`;
        data[dateKey][hourKey] = {
          available_count: 0,
          total_members: totalMembers,
          percentage: 0,
          available_members: [],
          unavailable_members: [],
        };
      });
    });

    return data;
  }, [currentWeekStart, currentWeekEnd, totalMembers]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUserId(user.id);
        
        // TODO: Fetch projects from API
        // const response = await fetch('http://localhost:8000/api/student/projects');
        // const projectsData = await response.json();
        // setProjects(projectsData);
        
        setProjects([]);
        setMeetings([]);
      } catch (error) {
        console.error("Failed to initialize calendar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [navigate]);

  const handleSaveAvailability = async (slots: any[]) => {
    if (!currentProjectId || !userId) {
      toast({
        title: "Error",
        description: "No project selected",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from("student_availability")
        .delete()
        .eq("project_id", currentProjectId)
        .eq("student_id", userId);

      if (slots.length > 0) {
        const { error } = await supabase
          .from("student_availability")
          .insert(
            slots.map(slot => ({
              project_id: currentProjectId,
              student_id: userId,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            }))
          );

        if (error) throw error;
      }

      toast({
        title: "Availability saved",
        description: "Your team can now see when you're available.",
      });
      setIsEditing(false);
      setExistingSlots(slots);
    } catch (error) {
      console.error("Error saving availability:", error);
      toast({
        title: "Error",
        description: "Failed to save availability",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMeeting = async (meeting: any) => {
    if (!currentProjectId || !userId) return;

    try {
      const { error } = await supabase
        .from("meetings")
        .insert({
          project_id: currentProjectId,
          title: meeting.title,
          description: meeting.description,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          location: meeting.location,
          created_by: userId,
        });

      if (error) throw error;

      toast({
        title: "Meeting created",
        description: "Your team has been notified.",
      });
      setShowScheduler(false);
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async (meetingId: string) => {
    setCheckingInMeeting(meetingId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Checked in!",
      description: "Your attendance has been recorded.",
    });
    setCheckingInMeeting(null);
  };

  const handleCheckOut = async () => {
    toast({
      title: "Checked out",
      description: "Have a great rest of your day!",
    });
  };

  if (isLoading) {
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
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Team Calendar</h1>
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10 mt-1">
              <Users className="h-3 w-3 mr-1" />
              {totalMembers} members
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing && currentProjectId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-white/20 text-blue-400 hover:bg-white/10"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit My Availability
              </Button>
              <Button
                size="sm"
                onClick={() => setShowScheduler(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isEditing ? (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Edit3 className="h-5 w-5 text-blue-400" />
                Mark Your Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AvailabilityEditor
                projectId={currentProjectId || ""}
                existingSlots={existingSlots}
                onSave={handleSaveAvailability}
                onCancel={() => setIsEditing(false)}
                isSaving={isSaving}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Project Selector */}
            {projects.length > 0 ? (
              <ProjectSelector
                projects={projects}
                selectedProjectId={currentProjectId}
                onSelectProject={setCurrentProjectId}
              />
            ) : (
              <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Projects</h3>
                <p className="text-slate-400 text-sm">
                  Join a project to view team availability and schedule meetings.
                </p>
              </div>
            )}

            {currentProjectId && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main calendar area */}
                <div className="lg:col-span-3">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-white">Team Availability</CardTitle>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="bg-white/10 p-1">
                            <TabsTrigger 
                              value="heatmap" 
                              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <LayoutGrid className="h-4 w-4 mr-1" />
                              Heatmap
                            </TabsTrigger>
                            <TabsTrigger 
                              value="meetings" 
                              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <List className="h-4 w-4 mr-1" />
                              Meetings
                            </TabsTrigger>
                            <TabsTrigger 
                              value="polls" 
                              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <Vote className="h-4 w-4 mr-1" />
                              Polls
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      {activeTab === "heatmap" && (
                        <CalendarHeader 
                          currentWeekStart={currentWeekStart}
                          onNavigate={handleWeekNavigate}
                        />
                      )}
                    </CardHeader>
                    <CardContent>
                      {activeTab === "heatmap" && (
                        <div 
                          className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
                          style={{ minHeight: '400px' }}
                        >
                          <HeatmapView
                            heatmapData={heatmapData}
                            totalMembers={totalMembers}
                            weekStart={currentWeekStart}
                            weekEnd={currentWeekEnd}
                            onCellClick={(date, hour) => {
                              console.log(`Clicked ${format(date, 'yyyy-MM-dd')} at ${hour}:00`);
                            }}
                          />
                          {totalMembers === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#111827]/80">
                              <div className="text-center">
                                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No availability data yet.</p>
                                <p className="text-slate-500 text-sm">Team members haven't marked their availability.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === "meetings" && (
                        meetings.length > 0 ? (
                          <MeetingList
                            meetings={meetings}
                            currentUserId={userId || ""}
                            onCheckIn={handleCheckIn}
                            onCheckOut={handleCheckOut}
                            onViewDetails={(id) => console.log("View meeting", id)}
                            isCheckingIn={checkingInMeeting || undefined}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No scheduled meetings.</p>
                            <p className="text-slate-500 text-sm mt-1">Schedule a meeting to coordinate with your team.</p>
                          </div>
                        )
                      )}
                      {activeTab === "polls" && (
                        <div className="text-center py-12 text-slate-400">
                          <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No active polls.</p>
                          <p className="text-slate-500 text-sm mt-1">Create a poll to find the best meeting time.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4 border-white/20 text-white hover:bg-white/10"
                            onClick={() => console.log("Create poll")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Poll
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Team Members</span>
                        <span className="text-white font-semibold">{totalMembers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Upcoming Meetings</span>
                        <span className="text-white font-semibold">{meetings.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Active Polls</span>
                        <span className="text-white font-semibold">0</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {showScheduler && (
          <MeetingScheduler
            open={showScheduler}
            onOpenChange={setShowScheduler}
            projectId={currentProjectId || ""}
            suggestedTimes={[]}
            onSubmit={handleCreateMeeting}
          />
        )}
      </motion.div>
    </StudentLayout>
  );
}
