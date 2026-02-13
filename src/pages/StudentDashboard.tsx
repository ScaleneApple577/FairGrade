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

      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: "linear-gradient(170deg, #2d4a3e 0%, #243f34 40%, #1e3529 100%)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Chalk dust texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }} />

        {/* Chalk doodles */}
        <div className="absolute top-6 right-8 chalk-text text-2xl opacity-20 select-none">★ ✦ ☆</div>
        <div className="absolute bottom-16 left-8 chalk-text text-lg opacity-15 select-none">→ ✧ ∞</div>
        <div className="absolute top-1/3 right-12 chalk-text text-sm opacity-10 select-none rotate-12">π ≈ 3.14</div>
        <div className="absolute bottom-1/3 left-12 chalk-text text-xs opacity-10 select-none -rotate-6">E = mc²</div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center justify-center px-8 py-16"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          {/* Welcome */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="chalk-text text-4xl md:text-5xl font-bold text-center mb-3"
          >
            Welcome back{firstName ? `, ${firstName}` : ''}!
          </motion.h1>
          <p className="chalk-text text-center text-base opacity-50 mb-16">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* Nav grid */}
          <div className="grid grid-cols-2 gap-x-20 gap-y-10 max-w-xl mx-auto">
            {chalkboardLinks.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
              >
                <Link
                  to={item.href}
                  className="chalk-link chalk-text flex items-center gap-4 text-2xl md:text-3xl font-bold py-3 cursor-pointer"
                >
                  <item.icon className="w-7 h-7 text-white/50 flex-shrink-0" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chalk ledge */}
        <div className="absolute bottom-0 left-0 right-0 h-3" style={{
          background: "linear-gradient(180deg, #8B7355 0%, #6d5a43 100%)",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.3)",
        }} />
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
