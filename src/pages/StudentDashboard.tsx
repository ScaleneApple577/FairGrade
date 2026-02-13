import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  AlertCircle,
  FileText,
  Key,
  Copy,
  CheckCheck,
  Loader2,
  Bell,
  Edit3,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ProjectAssignmentBanner } from "@/components/student/ProjectAssignmentBanner";
import { ClassroomInvitationBanner } from "@/components/student/ClassroomInvitationBanner";
import { api, fetchProjectsWithFallback } from "@/lib/api";
import { 
  getUpcomingAssignments, 
  getOverdueAssignments, 
  formatDueDate, 
  getAssignmentUrgency, 
  type Assignment 
} from "@/lib/assignmentUtils";
import { supabase } from "@/integrations/supabase/client";

// --- Helper functions ---

const getActivityIcon = (type: string) => {
  switch (type) {
    case "task_completed": return { icon: CheckCircle, iconColor: "text-emerald-400" };
    case "meeting_checkin": return { icon: Calendar, iconColor: "text-blue-400" };
    case "task_assigned": return { icon: AlertCircle, iconColor: "text-amber-400" };
    case "availability_marked": return { icon: Clock, iconColor: "text-purple-400" };
    case "document_edited": return { icon: Edit3, iconColor: "text-cyan-400" };
    default: return { icon: FileText, iconColor: "text-white/40" };
  }
};

// --- Types ---

interface ProjectAssignment {
  id: string;
  notificationId: string;
  projectId: string;
  projectName: string;
  courseName: string;
  deadline: string;
  teamSize: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface TeamInfo {
  groupName: string;
  projectName: string;
  members: TeamMember[];
}

interface DashboardData {
  student: { firstName: string };
  recentActivity: Array<{ id: string; type: string; title: string; project: string; timestamp: string }>;
  thisWeekEvents: Array<{ id: string; title: string; date: string; day: string; startTime: string; endTime: string; type: string }>;
  upcomingAssignments: Assignment[];
  team: TeamInfo | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// --- Component ---

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);

  useEffect(() => {
    setProjectAssignments([]);
  }, []);

  const handleDismissAssignment = async (notificationId: string) => {
    setProjectAssignments(prev => prev.filter(a => a.notificationId !== notificationId));
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const upcomingAssignments = await getUpcomingAssignments(7);

        // Fetch team info
        let team: TeamInfo | null = null;
        try {
          const storedUser = localStorage.getItem('user');
          const userId = storedUser ? JSON.parse(storedUser).id : null;
          if (userId) {
            const { data: ps } = await supabase
              .from('project_students')
              .select('group_id, project_id')
              .eq('student_id', userId)
              .not('group_id', 'is', null)
              .limit(1)
              .single();

            if (ps?.group_id) {
              const [{ data: groupData }, { data: projectData }, { data: teammates }] = await Promise.all([
                supabase.from('groups').select('group_name, group_number').eq('id', ps.group_id).single(),
                supabase.from('projects').select('name').eq('id', ps.project_id).single(),
                supabase.from('project_students').select('student_id').eq('group_id', ps.group_id),
              ]);

              const memberIds = (teammates || []).map(t => t.student_id);
              const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, full_name, email')
                .in('user_id', memberIds);

              team = {
                groupName: groupData?.group_name || `Group ${groupData?.group_number || '?'}`,
                projectName: projectData?.name || 'Project',
                members: (profiles || []).map(p => ({
                  id: p.user_id,
                  name: p.full_name || p.email,
                  email: p.email,
                })),
              };
            }
          }
        } catch {}

        setDashboardData({
          student: { firstName: "Student" },
          recentActivity: [],
          thisWeekEvents: [],
          upcomingAssignments,
          team,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error("Failed to load dashboard data");
        setDashboardData({
          student: { firstName: "Student" },
          recentActivity: [], thisWeekEvents: [], upcomingAssignments: [], team: null,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const generateExtensionToken = async () => {
    setIsGenerating(true);
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      if (!userId) { toast.error("You must be logged in to generate a token"); return; }
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      try { await api.post('/api/extension/token', { token }); } catch {}
      setGeneratedToken(token);
      setTokenModalOpen(true);
      toast.success("Extension token generated successfully");
    } catch (error) {
      toast.error("Failed to generate token");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = async () => {
    if (generatedToken) {
      await navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        </div>
      </StudentLayout>
    );
  }

  const data = dashboardData!;

  return (
    <StudentLayout pageTitle="Dashboard">
      <ClassroomInvitationBanner />
      <ProjectAssignmentBanner assignments={projectAssignments} onDismiss={handleDismissAssignment} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">
            Welcome back{(() => {
              try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  const user = JSON.parse(storedUser);
                  const firstName = user.first_name || (user.fullName || user.name || '').split(' ')[0];
                  if (firstName) return `, ${firstName}`;
                }
              } catch {}
              return '';
            })()}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Recent Activity — full width */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="glass-card mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-0.5">
              {data.recentActivity.map((activity) => {
                const { icon: Icon, iconColor } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.title}</p>
                      <p className="text-xs text-white/40">{activity.project} · {activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="w-6 h-6 text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/30">No recent activity</p>
            </div>
          )}
        </motion.div>

        {/* Upcoming Assignments + This Week — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Upcoming Assignments */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Upcoming Assignments</h3>
              <Link to="/student/calendar" className="text-xs text-white/30 hover:text-blue-400 transition-colors">View all</Link>
            </div>
            {data.upcomingAssignments.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingAssignments.map((assignment) => {
                  const urgency = getAssignmentUrgency(assignment);
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{assignment.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">{assignment.classroom_name || 'Classroom'}</p>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-3 ${urgency === 'today' ? 'text-red-400' : urgency === 'soon' ? 'text-amber-400' : 'text-white/30'}`}>
                        {formatDueDate(assignment.due_date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="w-6 h-6 text-white/15 mx-auto mb-2" />
                <p className="text-xs text-white/30">No upcoming assignments</p>
              </div>
            )}
          </motion.div>

          {/* This Week */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="glass-card">
            <h3 className="text-sm font-semibold text-white mb-4">This Week</h3>
            {data.thisWeekEvents.length > 0 ? (
              <div className="space-y-2">
                {data.thisWeekEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="text-center min-w-[32px]">
                      <p className="text-blue-400 text-[10px] font-medium">{event.date}</p>
                      <p className="text-white text-sm font-semibold">{event.day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{event.title}</p>
                      <p className="text-xs text-white/40">{event.startTime}{event.endTime && ` – ${event.endTime}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="w-6 h-6 text-white/15 mx-auto mb-2" />
                <p className="text-xs text-white/30">No events this week</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* My Team */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">My Team</h3>
            {data.team && (
              <span className="text-xs text-white/30 ml-auto">{data.team.projectName}</span>
            )}
          </div>
          {data.team ? (
            <div>
              <p className="text-white/60 text-xs mb-3">{data.team.groupName}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.team.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{member.name}</p>
                      <p className="text-xs text-white/30 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-6 h-6 text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/30">No team assigned</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Token Modal — kept for programmatic access */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent className="bg-[#111633]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Extension Token</DialogTitle>
            <DialogDescription className="text-white/50">
              Copy this token and paste it into the FairGrade browser extension.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl p-3 border border-white/10">
              <code className="flex-1 text-sm text-white/80 break-all font-mono">
                {generatedToken}
              </code>
              <Button onClick={copyToken} size="sm" className="btn-gradient rounded-lg">
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
