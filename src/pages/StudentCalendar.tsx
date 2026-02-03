import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import {
  Calendar,
  Users,
  Clock,
  Plus,
  Edit3,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Vote,
  Home,
  FolderOpen,
  CheckSquare,
  Star,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar component for student navigation
function StudentSidebar({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { title: "Dashboard", url: "/student/dashboard", icon: Home },
    { title: "My Projects", url: "/student/projects", icon: FolderOpen },
    { title: "Calendar", url: "/student/calendar", icon: Calendar },
    { title: "Tasks", url: "/student/tasks", icon: CheckSquare },
    { title: "Peer Reviews", url: "/student/reviews", icon: Star },
    { title: "My Stats", url: "/student/stats", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-lg text-white">FairGrade</span>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.url || currentPath.startsWith(item.url + '/');
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                isActive 
                  ? "bg-blue-500/20 text-blue-400 border-l-4 border-blue-500 -ml-px" 
                  : "text-zinc-400 hover:bg-blue-500/10 hover:text-blue-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockHeatmapData = {
  "8:00": { "0": 0, "1": 2, "2": 3, "3": 2, "4": 4, "5": 1, "6": 0 },
  "9:00": { "0": 1, "1": 3, "2": 4, "3": 3, "4": 4, "5": 2, "6": 0 },
  "10:00": { "0": 1, "1": 4, "2": 4, "3": 4, "4": 4, "5": 3, "6": 1 },
  "11:00": { "0": 2, "1": 3, "2": 3, "3": 2, "4": 3, "5": 2, "6": 1 },
  "12:00": { "0": 1, "1": 2, "2": 2, "3": 2, "4": 2, "5": 1, "6": 0 },
  "13:00": { "0": 1, "1": 3, "2": 4, "3": 3, "4": 4, "5": 2, "6": 1 },
  "14:00": { "0": 2, "1": 4, "2": 4, "3": 4, "4": 4, "5": 3, "6": 1 },
  "15:00": { "0": 1, "1": 3, "2": 3, "3": 3, "4": 3, "5": 2, "6": 0 },
  "16:00": { "0": 1, "1": 2, "2": 2, "3": 2, "4": 2, "5": 1, "6": 0 },
  "17:00": { "0": 0, "1": 1, "2": 2, "3": 1, "4": 1, "5": 0, "6": 0 },
  "18:00": { "0": 0, "1": 1, "2": 1, "3": 1, "4": 1, "5": 0, "6": 0 },
  "19:00": { "0": 0, "1": 0, "2": 1, "3": 0, "4": 0, "5": 0, "6": 0 },
};

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

export default function StudentCalendar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("heatmap");
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [meetings, setMeetings] = useState(mockMeetings);
  const [checkingInMeeting, setCheckingInMeeting] = useState<string | null>(null);

  const totalMembers = 4; // This would come from the API

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
    <div className="min-h-screen bg-black text-white flex">
      <StudentSidebar currentPath="/student/calendar" />
      
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h1 className="text-lg font-semibold">Team Calendar</h1>
            <Badge variant="outline" className="text-blue-400 border-blue-500/30">
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
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit My Availability
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowScheduler(true)}
                  className="bg-blue-500 hover:bg-blue-600"
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
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main calendar area */}
                <div className="lg:col-span-3">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CardTitle>Team Availability</CardTitle>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="bg-zinc-800">
                            <TabsTrigger value="heatmap" className="data-[state=active]:bg-blue-500">
                              <LayoutGrid className="h-4 w-4 mr-1" />
                              Heatmap
                            </TabsTrigger>
                            <TabsTrigger value="meetings" className="data-[state=active]:bg-blue-500">
                              <List className="h-4 w-4 mr-1" />
                              Meetings
                            </TabsTrigger>
                            <TabsTrigger value="polls" className="data-[state=active]:bg-blue-500">
                              <Vote className="h-4 w-4 mr-1" />
                              Polls
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-2">This Week</span>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activeTab === "heatmap" && (
                        <HeatmapView
                          heatmapData={mockHeatmapData}
                          totalMembers={totalMembers}
                          onCellClick={(day, hour) => {
                            // Could open scheduler with this time pre-selected
                            console.log(`Clicked ${day} at ${hour}:00`);
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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsEditing(true)}
                      >
                        <Clock className="h-4 w-4 mr-2 text-blue-400" />
                        Update Availability
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowScheduler(true)}
                      >
                        <Plus className="h-4 w-4 mr-2 text-green-400" />
                        Schedule Meeting
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab("polls")}
                      >
                        <Vote className="h-4 w-4 mr-2 text-purple-400" />
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
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Best Meeting Times</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Tue & Thu at 10am have 100% availability
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
