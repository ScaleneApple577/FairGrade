import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HeatmapView } from "@/components/calendar/HeatmapView";
import { AvailabilityEditor } from "@/components/calendar/AvailabilityEditor";
import { MeetingScheduler } from "@/components/calendar/MeetingScheduler";
import { MeetingList } from "@/components/calendar/MeetingList";
import { AttendanceWidget } from "@/components/calendar/AttendanceWidget";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { ProjectSelector } from "@/components/calendar/ProjectSelector";
import { MenuVertical } from "@/components/ui/menu-vertical";
import {
  Calendar,
  Users,
  Clock,
  Plus,
  Edit3,
  LayoutGrid,
  List,
  Vote,
  Home,
  FolderOpen,
  CheckSquare,
  Star,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar component for student navigation
function StudentSidebar({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: Home },
    { label: "My Projects", href: "/student/projects", icon: FolderOpen },
    { label: "Calendar", href: "/student/calendar", icon: Calendar },
    { label: "Peer Reviews", href: "/student/reviews", icon: Star },
    { label: "My Stats", href: "/student/stats", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-11 flex-shrink-0">
            <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
              <path 
                d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" 
                stroke="#3B82F6" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" 
                stroke="#3B82F6" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M10 10 L10 42 Q10 44 8 43.5" 
                stroke="#3B82F6" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold">
            <span className="text-slate-900">Fair</span>
            <span className="text-blue-500">Grade</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <MenuVertical menuItems={menuItems} />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

// Generate mock heatmap data with real dates
function generateMockHeatmapData(weekStart: Date, weekEnd: Date, totalMembers: number) {
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm
  
  const heatmapData: Record<string, Record<string, {
    available_count: number;
    total_members: number;
    percentage: number;
    available_members: string[];
    unavailable_members: string[];
  }>> = {};

  const memberNames = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"].slice(0, totalMembers);

  days.forEach((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    heatmapData[dateKey] = {};
    
    hours.forEach((hour) => {
      const hourKey = `${hour}:00`;
      // Generate random availability (weighted towards work hours)
      const isWorkHour = hour >= 9 && hour <= 17;
      const baseChance = isWorkHour ? 0.7 : 0.3;
      
      const availableMembers = memberNames.filter(() => Math.random() < baseChance);
      const unavailableMembers = memberNames.filter(m => !availableMembers.includes(m));
      
      heatmapData[dateKey][hourKey] = {
        available_count: availableMembers.length,
        total_members: totalMembers,
        percentage: totalMembers > 0 ? (availableMembers.length / totalMembers) * 100 : 0,
        available_members: availableMembers,
        unavailable_members: unavailableMembers,
      };
    });
  });

  return heatmapData;
}

const mockMeetings = [
  {
    id: "1",
    title: "Weekly Sync",
    description: "Team standup and progress check",
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    location: "https://zoom.us/j/123456",
    created_by: "user1",
    attendees: [
      { id: "user1", name: "Alice", status: "accepted" as const, attended: true },
      { id: "user2", name: "Bob", status: "accepted" as const, attended: false },
      { id: "user3", name: "Carol", status: "invited" as const, attended: false },
      { id: "user4", name: "Dave", status: "accepted" as const, attended: false },
    ],
  },
  {
    id: "2",
    title: "Sprint Planning",
    description: "Plan next week's tasks",
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    location: "Room 204",
    created_by: "user2",
    attendees: [
      { id: "user1", name: "Alice", status: "accepted" as const, attended: false },
      { id: "user2", name: "Bob", status: "accepted" as const, attended: false },
      { id: "user3", name: "Carol", status: "accepted" as const, attended: false },
      { id: "user4", name: "Dave", status: "declined" as const, attended: false },
    ],
  },
];

const mockPastMeetings = [
  { id: "p1", title: "Project Kickoff", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), attended: true },
  { id: "p2", title: "Design Review", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), attended: true },
  { id: "p3", title: "Client Call", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), attended: false },
  { id: "p4", title: "Team Retro", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), attended: true },
];

const mockSuggestedTimes = [
  { day: 2, hour: 10, available_count: 4, total_members: 4 },
  { day: 4, hour: 10, available_count: 4, total_members: 4 },
  { day: 2, hour: 14, available_count: 4, total_members: 4 },
  { day: 4, hour: 14, available_count: 4, total_members: 4 },
  { day: 1, hour: 10, available_count: 4, total_members: 4 },
];

// Mock projects for selector
const mockProjects = [
  { id: "proj-1", name: "Marketing Campaign", member_count: 4, course_name: "MKTG 301" },
  { id: "proj-2", name: "Mobile App Design", member_count: 6, course_name: "CS 490" },
  { id: "proj-3", name: "Research Paper", member_count: 3, course_name: "ENG 201" },
];

export default function StudentCalendar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("heatmap");
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>("proj-1");
  const [userId, setUserId] = useState<string | null>(null);
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [meetings, setMeetings] = useState(mockMeetings);
  const [checkingInMeeting, setCheckingInMeeting] = useState<string | null>(null);
  
  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  
  // Calculate week end
  const currentWeekEnd = useMemo(() => 
    endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    [currentWeekStart]
  );

  // Get current project details
  const currentProject = mockProjects.find(p => p.id === currentProjectId);
  const totalMembers = currentProject?.member_count || 4;
  
  // Generate heatmap data for current week
  const heatmapData = useMemo(() => 
    generateMockHeatmapData(currentWeekStart, currentWeekEnd, totalMembers),
    [currentWeekStart, currentWeekEnd, totalMembers]
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    
    // Get user's first project (for demo)
    const { data: enrollment } = await supabase
      .from("project_students")
      .select("project_id")
      .eq("student_id", user.id)
      .limit(1)
      .single();
    
    if (enrollment) {
      setCurrentProjectId(enrollment.project_id);
      loadAvailability(enrollment.project_id, user.id);
    }
  };

  const loadAvailability = async (projectId: string, studentId: string) => {
    const { data, error } = await supabase
      .from("student_availability")
      .select("*")
      .eq("project_id", projectId)
      .eq("student_id", studentId);
    
    if (data) {
      setExistingSlots(data);
    }
  };

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
      // Delete existing slots
      await supabase
        .from("student_availability")
        .delete()
        .eq("project_id", currentProjectId)
        .eq("student_id", userId);

      // Insert new slots
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
      const { data, error } = await supabase
        .from("meetings")
        .insert({
          project_id: currentProjectId,
          title: meeting.title,
          description: meeting.description,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          location: meeting.location,
          created_by: userId,
        })
        .select()
        .single();

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          attendees: m.attendees.map(a => 
            a.id === "user1" ? { ...a, attended: true } : a
          ),
        };
      }
      return m;
    }));
    
    toast({
      title: "Checked in!",
      description: "Your attendance has been recorded.",
    });
    setCheckingInMeeting(null);
  };

  const handleCheckOut = async (meetingId: string) => {
    toast({
      title: "Checked out",
      description: "Have a great rest of your day!",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <StudentSidebar currentPath="/student/calendar" />
      
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-slate-900">Team Calendar</h1>
            <Badge variant="outline" className="text-primary border-primary/30">
              <Users className="h-3 w-3 mr-1" />
              {totalMembers} members
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-primary/30 text-primary hover:bg-blue-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit My Availability
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowScheduler(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isEditing ? (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Edit3 className="h-5 w-5 text-primary" />
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
                <ProjectSelector
                  projects={mockProjects}
                  selectedProjectId={currentProjectId}
                  onSelectProject={setCurrentProjectId}
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main calendar area */}
                  <div className="lg:col-span-3">
                    <Card className="bg-white border-slate-200 shadow-sm">
                      <CardHeader className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <CardTitle className="text-slate-900">Team Availability</CardTitle>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                              <TabsList className="bg-slate-100">
                                <TabsTrigger value="heatmap" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                  <LayoutGrid className="h-4 w-4 mr-1" />
                                  Heatmap
                                </TabsTrigger>
                                <TabsTrigger value="meetings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                  <List className="h-4 w-4 mr-1" />
                                  Meetings
                                </TabsTrigger>
                                <TabsTrigger value="polls" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                  <Vote className="h-4 w-4 mr-1" />
                                  Polls
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </div>
                        </div>
                        
                        {/* Week Navigation */}
                        {activeTab === "heatmap" && (
                          <CalendarHeader 
                            currentWeekStart={currentWeekStart}
                            onNavigate={setCurrentWeekStart}
                          />
                        )}
                      </CardHeader>
                      <CardContent>
                        {activeTab === "heatmap" && (
                          <HeatmapView
                            heatmapData={heatmapData}
                            totalMembers={totalMembers}
                            weekStart={currentWeekStart}
                            weekEnd={currentWeekEnd}
                            onCellClick={(date, hour) => {
                              console.log(`Clicked ${format(date, 'yyyy-MM-dd')} at ${hour}:00`);
                            }}
                          />
                        )}
                        {activeTab === "meetings" && (
                          <MeetingList
                            meetings={meetings}
                            currentUserId="user1"
                            onCheckIn={handleCheckIn}
                            onCheckOut={handleCheckOut}
                            onViewDetails={(id) => console.log("View meeting", id)}
                            isCheckingIn={checkingInMeeting || undefined}
                          />
                        )}
                        {activeTab === "polls" && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No active polls</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => toast({ title: "Coming soon", description: "Poll creation is under development" })}
                            >
                              Create Poll
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar widgets */}
                  <div className="space-y-6">
                    {/* Quick actions */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base text-slate-900">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-200"
                          onClick={() => setIsEditing(true)}
                        >
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          Update Availability
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-200"
                          onClick={() => setShowScheduler(true)}
                        >
                          <Plus className="h-4 w-4 mr-2 text-green-600" />
                          Schedule Meeting
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-200"
                          onClick={() => setActiveTab("polls")}
                        >
                          <Vote className="h-4 w-4 mr-2 text-purple-600" />
                          Create Poll
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Attendance stats */}
                    <AttendanceWidget
                      attendedCount={3}
                      totalMeetings={4}
                      pastMeetings={mockPastMeetings}
                    />

                    {/* Best times hint */}
                    <Card className="bg-gradient-to-br from-blue-50 to-white border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-slate-900">Best Meeting Times</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Tue & Thu at 10am have 100% availability
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Meeting Scheduler Modal */}
      <MeetingScheduler
        open={showScheduler}
        onOpenChange={setShowScheduler}
        projectId={currentProjectId || ""}
        suggestedTimes={mockSuggestedTimes}
        onSubmit={handleCreateMeeting}
      />
    </div>
  );
}
