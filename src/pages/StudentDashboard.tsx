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
  FolderOpen,
  Star,
  User,
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
    case "task_completed": return { icon: CheckCircle, iconColor: "text-emerald-600" };
    case "meeting_checkin": return { icon: Calendar, iconColor: "text-blue-600" };
    case "task_assigned": return { icon: AlertCircle, iconColor: "text-amber-600" };
    case "availability_marked": return { icon: Clock, iconColor: "text-purple-600" };
    case "document_edited": return { icon: Edit3, iconColor: "text-cyan-600" };
    default: return { icon: FileText, iconColor: "text-gray-400" };
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

const chalkboardLinks = [
  { icon: FolderOpen, label: "My Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Peer Reviews", href: "/student/reviews" },
  { icon: User, label: "My Profile", href: "/student-profile" },
];

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

  const firstName = (() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.first_name || (user.fullName || user.name || '').split(' ')[0] || '';
      }
    } catch {}
    return '';
  })();

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

      <div style={{ perspective: "1200px" }}>
        {/* ===== ZONE 1: THE WALL ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="classroom-wall rounded-t-2xl px-6 pt-8 pb-16"
          style={{ minHeight: "420px" }}
        >
          {/* Chalkboard */}
          <div className="chalkboard max-w-3xl mx-auto px-8 py-8 pb-12">
            {/* Chalk doodles */}
            <div className="absolute top-3 right-4 chalk-text text-lg opacity-30 select-none">★ ✦ ☆</div>
            <div className="absolute bottom-8 left-4 chalk-text text-sm opacity-20 select-none">→ ✧</div>

            {/* Welcome */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="chalk-text text-3xl md:text-4xl font-bold text-center mb-2"
            >
              Welcome back{firstName ? `, ${firstName}` : ''}!
            </motion.h1>
            <p className="chalk-text text-center text-sm opacity-50 mb-8">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            {/* Nav grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-md mx-auto">
              {chalkboardLinks.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                >
                  <Link
                    to={item.href}
                    className="chalk-link chalk-text flex items-center gap-3 text-xl md:text-2xl font-bold py-2"
                  >
                    <item.icon className="w-5 h-5 text-white/60 flex-shrink-0" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== TRANSITION SHADOW ===== */}
        <div
          className="h-6 relative z-10"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 40%, transparent 100%)",
          }}
        />

        {/* ===== ZONE 2: THE DESK ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="desk-surface rounded-b-2xl px-6 py-10"
          style={{ minHeight: "340px", transformOrigin: "top center", transform: "rotateX(1deg)" }}
        >
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Paper — Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="paper-card desk-item-hover p-5 md:col-span-1"
              style={{ transform: "rotate(-2deg)" }}
            >
              <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Recent Activity
              </h3>
              {data.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {data.recentActivity.slice(0, 5).map((activity) => {
                    const { icon: Icon, iconColor } = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-2 text-xs">
                        <Icon className={`w-3.5 h-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-gray-700 truncate">{activity.title}</p>
                          <p className="text-gray-400 text-[10px]">{activity.project} · {activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">No recent activity</p>
                </div>
              )}
            </motion.div>

            {/* Sticky Note — Upcoming Assignments */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="sticky-note desk-item-hover p-5 md:col-span-1"
              style={{ transform: "rotate(3deg)" }}
            >
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                Upcoming Assignments
              </h3>
              {data.upcomingAssignments.length > 0 ? (
                <div className="space-y-2">
                  {data.upcomingAssignments.slice(0, 4).map((assignment) => {
                    const urgency = getAssignmentUrgency(assignment);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between text-xs">
                        <p className="text-gray-700 truncate flex-1 mr-2">{assignment.title}</p>
                        <span className={`flex-shrink-0 font-semibold ${urgency === 'today' ? 'text-red-600' : urgency === 'soon' ? 'text-amber-600' : 'text-gray-500'}`}>
                          {formatDueDate(assignment.due_date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">No upcoming assignments</p>
                </div>
              )}
            </motion.div>

            {/* ID Badge — My Team */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="id-badge desk-item-hover p-5 md:col-span-1"
              style={{ transform: "rotate(-1deg)" }}
            >
              <h3 className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                My Team
              </h3>
              {data.team ? (
                <div>
                  <p className="text-[10px] text-gray-500 mb-3">{data.team.groupName} — {data.team.projectName}</p>
                  <div className="space-y-2">
                    {data.team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-700 truncate leading-tight">{member.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">No team assigned</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

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
