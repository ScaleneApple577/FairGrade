import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  Target,
  Plus,
  MoreVertical,
  Zap,
  Award,
  Trophy,
  Lock,
  Calendar,
  Star,
  Loader2,
  FolderOpen,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StudentLayout } from "@/components/student/StudentLayout";
import { api } from "@/lib/api";
// NOTE: Task field mapping - backend API uses { title, status } not { name, completed }
// Status values: 'open', 'in_progress', 'done' (backend) vs boolean 'completed' (Supabase table)
import { CircularScoreRing, getScoreLabel, getScoreColorClass } from "@/components/score/CircularScoreRing";
import { ScoreBadge } from "@/components/score/ScoreBadge";
import { ScoreBreakdownModal } from "@/components/score/ScoreBreakdownModal";

// All 30 achievements definition
const allAchievements = [
  // Contribution Milestones (6)
  { id: "first_words", emoji: "📝", name: "First Words", description: "Write your first 100 words in a project", category: "contribution" },
  { id: "wordsmith", emoji: "✍️", name: "Wordsmith", description: "Write 1,000 total words across all projects", category: "contribution" },
  { id: "author", emoji: "📚", name: "Author", description: "Write 5,000 total words across all projects", category: "contribution" },
  { id: "prolific_writer", emoji: "📖", name: "Prolific Writer", description: "Write 10,000 total words across all projects", category: "contribution" },
  { id: "builder", emoji: "🏗️", name: "Builder", description: "Complete 10 tasks across all projects", category: "contribution" },
  { id: "task_machine", emoji: "⚡", name: "Task Machine", description: "Complete 50 tasks across all projects", category: "contribution" },
  // Collaboration Milestones (6)
  { id: "communicator", emoji: "💬", name: "Communicator", description: "Leave 10 comments on shared documents", category: "collaboration" },
  { id: "feedback_pro", emoji: "🗣️", name: "Feedback Pro", description: "Leave 50 comments across all projects", category: "collaboration" },
  { id: "team_player", emoji: "🤝", name: "Team Player", description: "Attend 10 team meetings", category: "collaboration" },
  { id: "reliable", emoji: "🎯", name: "Reliable", description: "Attend 25 consecutive meetings without missing one", category: "collaboration" },
  { id: "helpful_reviewer", emoji: "⭐", name: "Helpful Reviewer", description: "Submit 5 peer reviews", category: "collaboration" },
  { id: "review_master", emoji: "🌟", name: "Review Master", description: "Submit 20 peer reviews", category: "collaboration" },
  // Consistency Milestones (6)
  { id: "day_one", emoji: "📆", name: "Day One", description: "Make a contribution on your first day in a project", category: "consistency" },
  { id: "streak_starter", emoji: "🔥", name: "Streak Starter", description: "Contribute 3 days in a row", category: "consistency" },
  { id: "on_fire", emoji: "🔥🔥", name: "On Fire", description: "Contribute 7 days in a row", category: "consistency" },
  { id: "unstoppable", emoji: "🔥🔥🔥", name: "Unstoppable", description: "Contribute 14 days in a row", category: "consistency" },
  { id: "early_bird", emoji: "⏰", name: "Early Bird", description: "Submit a task more than 48 hours before the deadline", category: "consistency" },
  { id: "steady_pace", emoji: "📊", name: "Steady Pace", description: "Maintain an even work distribution (consistency score > 80) on a project", category: "consistency" },
  // Quality Milestones (6)
  { id: "quality_work", emoji: "💎", name: "Quality Work", description: "Have 95%+ of your words survive to the final document", category: "quality" },
  { id: "peer_approved", emoji: "🎖️", name: "Peer Approved", description: "Receive an average peer rating of 4.0+ on a project", category: "quality" },
  { id: "mvp", emoji: "👑", name: "MVP", description: "Receive the highest peer rating on your team for a project", category: "quality" },
  { id: "original_thinker", emoji: "🧠", name: "Original Thinker", description: "Complete a project with 0 AI content flags", category: "quality" },
  { id: "integrity_first", emoji: "✅", name: "Integrity First", description: "Complete a project with 0 plagiarism flags", category: "quality" },
  { id: "high_scorer", emoji: "🏆", name: "High Scorer", description: "Achieve a FairScore of 90+ on any project", category: "quality" },
  // Social & Team Milestones (6)
  { id: "first_project", emoji: "👋", name: "First Project", description: "Join your first project", category: "social" },
  { id: "multi_tasker", emoji: "🎓", name: "Multi-Tasker", description: "Be active in 3+ projects simultaneously", category: "social" },
  { id: "schedule_master", emoji: "📅", name: "Schedule Master", description: "Mark availability and help schedule 5 meetings", category: "social" },
  { id: "poll_creator", emoji: "🗳️", name: "Poll Creator", description: "Create a When2Meet-style availability poll", category: "social" },
  { id: "goal_setter", emoji: "🎯", name: "Goal Setter", description: "Set and complete a personal goal", category: "social" },
  { id: "well_rounded", emoji: "🌈", name: "Well-Rounded", description: "Score above 70 in ALL five FairScore categories on a single project", category: "social" },
];

interface Stats {
  overall_score: number | null;
  score_trend: number;
  percentile: number | null;
  breakdown: {
    work_output: number | null;
    attendance: number | null;
    peer_rating: number | null;
    consistency: number | null;
    integrity: number | null;
  };
  contribution_metrics: {
    words_written: number;
    edit_sessions: number;
    active_time_minutes: number;
    // Task counts - backend API counts tasks where status === 'done' for completed
    tasks_completed: number;
    tasks_total: number;
    team_average_words: number;
  };
  meeting_stats: {
    meetings_attended: number;
    meetings_total: number;
    attendance_percentage: number;
    average_duration_minutes: number;
    average_response_time_hours: number;
    peer_rating: number | null;
  };
  project_scores: ProjectScore[];
}

interface ProjectScore {
  project_id: string;
  project_name: string;
  fairscore: number | null;
  last_updated: string;
}

interface Goal {
  id: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  deadline: string;
  status: "on_track" | "at_risk" | "completed";
}

interface Achievement {
  id: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

const StudentStats = () => {
  const { toast } = useToast();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState("contribution_score");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [timeFilter, setTimeFilter] = useState("30");
  const [selectedAchievement, setSelectedAchievement] = useState<typeof allAchievements[0] | null>(null);

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectScore | null>(null);

  const handleViewProjectScore = (project: ProjectScore) => {
    setSelectedProject(project);
    setScoreModalOpen(true);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: GET /api/student/stats
        // const data = await api.get('/api/student/stats');
        // setStats(data);
        setStats(null);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // TODO: GET /api/student/goals
        // const data = await api.get('/api/student/goals');
        // setGoals(data);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      }
    };
    fetchGoals();
  }, []);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // TODO: GET /api/student/achievements
        // const data = await api.get('/api/student/achievements');
        // setAchievements(data);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      }
    };
    fetchAchievements();
  }, []);

  const handleCreateGoal = () => {
    if (!goalTitle || !goalTarget || !goalDeadline) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // TODO: POST http://localhost:8000/api/student/goals
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalTitle,
      goal_type: goalType,
      target_value: parseInt(goalTarget),
      current_value: 0,
      progress_percentage: 0,
      deadline: goalDeadline,
      status: "on_track",
    };

    setGoals([...goals, newGoal]);
    setShowGoalModal(false);
    setGoalTitle("");
    setGoalTarget("");
    setGoalDeadline("");
    
    toast({
      title: "Goal created!",
      description: "Your new goal has been added successfully.",
    });
  };

  const setQuickGoal = (type: string) => {
    switch (type) {
      case "meeting_100":
        setGoalTitle("Attend 100% of meetings this month");
        setGoalType("meeting_attendance");
        setGoalTarget("100");
        break;
      case "score_90":
        setGoalTitle("Reach 90+ contribution score");
        setGoalType("contribution_score");
        setGoalTarget("90");
        break;
      case "tasks_complete":
        setGoalTitle("Complete all assigned tasks on time");
        setGoalType("task_completion");
        setGoalTarget("100");
        break;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-400";
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return { bg: "bg-green-500", text: "text-green-400", label: "Excellent Performance" };
      case "good": return { bg: "bg-blue-500", text: "text-blue-400", label: "Good Performance" };
      case "fair": return { bg: "bg-yellow-500", text: "text-yellow-400", label: "Room for Improvement" };
      default: return { bg: "bg-red-500", text: "text-red-400", label: "Needs Attention" };
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const isAchievementUnlocked = (id: string) => achievements.find(a => a.id === id)?.unlocked || false;
  const getAchievementUnlockDate = (id: string) => achievements.find(a => a.id === id)?.unlocked_at || null;

  const heatmapColors = [
    "bg-white/5",
    "bg-green-500/30",
    "bg-green-500/50",
    "bg-green-500/70",
    "bg-green-500",
  ];

  // Generate empty activity data for heatmap
  const activityData: number[][] = Array(12).fill(null).map(() => Array(7).fill(0));

  if (isLoading) {
    return (
      <StudentLayout pageTitle="My Stats">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="My Stats">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Stats</h1>
            <p className="text-slate-400">Track your contributions and performance across all projects</p>
          </div>
        </div>
      </motion.div>

      {/* Hero Card - Overall Contribution Score */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          {/* Left Side: Score */}
          <div className="flex-1">
            <p className="text-blue-100 text-sm mb-2">Your Overall Contribution Score</p>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-7xl font-bold">{stats?.overall_score ?? "—"}</span>
              <span className="text-3xl text-blue-100">/100</span>
            </div>
            {stats?.score_trend ? (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-green-300 font-semibold">+{stats.score_trend} points from last month</span>
              </div>
            ) : (
              <p className="text-blue-100 text-sm">No trend data available yet</p>
            )}
            {stats?.percentile ? (
              <p className="text-blue-100 text-sm mt-3">
                You're performing better than <strong className="text-white">{stats.percentile}% of students</strong> in your classes
              </p>
            ) : null}
          </div>

          {/* Right Side: Circular Progress */}
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(stats?.overall_score ?? 0) * 5.53} 553`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl font-bold">{stats?.overall_score ?? "—"}</p>
                <p className="text-sm text-blue-100">Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Bar */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm text-blue-100 mb-3">FairScore Breakdown</p>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats?.breakdown?.work_output ?? "—"}</p>
              <p className="text-xs text-blue-100 mt-1">Work Output</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.breakdown?.attendance ?? "—"}</p>
              <p className="text-xs text-blue-100 mt-1">Attendance</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.breakdown?.peer_rating ?? "—"}</p>
              <p className="text-xs text-blue-100 mt-1">Peer Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.breakdown?.consistency ?? "—"}</p>
              <p className="text-xs text-blue-100 mt-1">Consistency</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.breakdown?.integrity ?? "—"}</p>
              <p className="text-xs text-blue-100 mt-1">Integrity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Scores */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">FairScores by Project</h2>
        {(stats?.project_scores ?? []).length > 0 ? (
          <div className="space-y-3">
            {stats?.project_scores.map((project) => (
              <div
                key={project.project_id}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{project.project_name}</p>
                  <p className="text-slate-500 text-xs">
                    Last updated: {new Date(project.last_updated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <CircularScoreRing score={project.fairscore} size="md" animate={false} />
                  <button
                    onClick={() => handleViewProjectScore(project)}
                    className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Breakdown
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No project scores available yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Your FairScores will appear here as you contribute to projects
            </p>
          </div>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* LEFT COLUMN - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contribution Metrics */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Contribution Metrics</h2>
            
            {stats ? (
              <div className="space-y-6">
                {/* Words Written */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">Words Written</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{stats.contribution_metrics.words_written.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="text-sm text-slate-400">vs. team average ({stats.contribution_metrics.team_average_words.toLocaleString()})</div>
                </div>

                {/* Edit Sessions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-white">Edit Sessions</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{stats.contribution_metrics.edit_sessions}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2"></div>
                </div>

                {/* Active Time */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-white">Active Time</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{formatTime(stats.contribution_metrics.active_time_minutes)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2"></div>
                </div>

                {/* Tasks Completed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-white">Tasks Completed</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">
                      {stats.contribution_metrics.tasks_completed}/{stats.contribution_metrics.tasks_total}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2"></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No contribution data yet</p>
                <p className="text-slate-500 text-sm mt-1">Start contributing to your projects to see metrics here</p>
              </div>
            )}
          </div>

          {/* Meeting & Collaboration Stats */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Meeting & Collaboration</h2>
            
            {stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-400 mb-1">{stats.meeting_stats.meetings_attended}/{stats.meeting_stats.meetings_total}</p>
                  <p className="text-sm text-slate-400">Meetings Attended</p>
                  <p className="text-xs text-green-400 font-medium mt-1">{stats.meeting_stats.attendance_percentage}% attendance</p>
                </div>

                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-400 mb-1">{stats.meeting_stats.average_duration_minutes}m</p>
                  <p className="text-sm text-slate-400">Avg. Duration</p>
                </div>

                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-400 mb-1">{stats.meeting_stats.average_response_time_hours}h</p>
                  <p className="text-sm text-slate-400">Avg. Response Time</p>
                </div>

                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-400 mb-1">{stats.meeting_stats.peer_rating ?? "—"}/5</p>
                  <p className="text-sm text-slate-400">Peer Rating</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No meeting data yet</p>
                <p className="text-slate-500 text-sm mt-1">Attend meetings to see collaboration stats</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Activity Timeline</h2>
              <select 
                className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Activity Heatmap - Empty */}
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-3">Contribution activity</p>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {activityData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((activityLevel, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="w-3 h-3 rounded-sm bg-white/5"
                        title="No activity"
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>Less</span>
                <div className="flex gap-1">
                  {heatmapColors.map((color, i) => (
                    <div key={i} className={`w-3 h-3 ${color} rounded-sm`}></div>
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Empty state */}
            <div className="text-center py-8 border-t border-white/10">
              <p className="text-slate-500 text-sm">No activity recorded yet</p>
            </div>
          </div>

          {/* Project-by-Project Breakdown */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Performance by Project</h2>
            
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No project data yet</p>
              <p className="text-slate-500 text-sm mt-1">Join a project to see your performance breakdown</p>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Achievements</h2>
              </div>
              <span className="text-slate-500 text-sm">{unlockedCount} / 30 unlocked</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">Earn achievements by being a great teammate</p>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {allAchievements.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.id);
                const unlockDate = getAchievementUnlockDate(achievement.id);
                
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={unlocked ? { scale: 1.05 } : undefined}
                    onClick={() => setSelectedAchievement(achievement)}
                    className={`rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      unlocked 
                        ? "bg-white/[0.06] border border-white/10 shadow-lg shadow-blue-500/5 hover:border-blue-500/30" 
                        : "bg-white/[0.03] border border-white/[0.06] opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl">{achievement.emoji}</span>
                    <p className={`text-xs font-medium mt-2 ${unlocked ? "text-white" : "text-slate-500"}`}>
                      {achievement.name}
                    </p>
                    {unlocked && unlockDate ? (
                      <p className="text-slate-500 text-[10px] mt-1">
                        {new Date(unlockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    ) : (
                      <p className="text-slate-600 text-[10px] mt-1">🔒</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 1/3 width */}
        <div className="space-y-6">
          {/* Improvement Suggestions - Empty */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-white">Improvement Suggestions</h3>
            </div>

            <div className="text-center py-8">
              <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No suggestions yet</p>
              <p className="text-slate-500 text-xs mt-1">Keep contributing to receive personalized tips</p>
            </div>
          </div>

          {/* Personal Goals */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">My Goals</h3>
              </div>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const isAtRisk = goal.status === "at_risk";
                  const isOnTrack = goal.status === "on_track" && goal.progress_percentage >= 90;
                  
                  return (
                    <div 
                      key={goal.id} 
                      className={`border rounded-lg p-4 ${
                        isAtRisk ? "border-red-500/30 bg-red-500/10" : 
                        isOnTrack ? "border-green-500/30 bg-green-500/10" : 
                        "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">{goal.title}</h4>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Complete by: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className={`font-semibold ${isAtRisk ? "text-red-400" : isOnTrack ? "text-green-400" : "text-white"}`}>
                            {goal.progress_percentage}%
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${isAtRisk ? "bg-red-500/20" : isOnTrack ? "bg-green-500/20" : "bg-white/10"}`}>
                          <div 
                            className={`h-2 rounded-full ${isAtRisk ? "bg-red-500" : isOnTrack ? "bg-green-500" : "bg-blue-500"}`} 
                            style={{ width: `${goal.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No goals set yet</p>
                <p className="text-slate-500 text-xs mt-1">Create a personal goal to track your progress</p>
                <button 
                  onClick={() => setShowGoalModal(true)}
                  className="mt-4 text-blue-400 text-sm hover:text-blue-300"
                >
                  Add Goal
                </button>
              </div>
            )}
          </div>

          {/* Weekly Summary - Empty */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold">This Week's Summary</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm text-purple-100 mb-1">Total Contributions</p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-purple-100 mt-1">No activity this week</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-100">Tasks completed</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-100">Meetings attended</span>
                  <span className="font-semibold">0/0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-100">Words written</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-100">Active time</span>
                  <span className="font-semibold">0h 0m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Goal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Quick Goal Options */}
            <div>
              <p className="text-sm text-slate-400 mb-3">Quick goals:</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setQuickGoal("meeting_100")}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                >
                  🎯 100% meeting attendance
                </button>
                <button 
                  onClick={() => setQuickGoal("score_90")}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
                >
                  📈 Reach 90+ score
                </button>
                <button 
                  onClick={() => setQuickGoal("tasks_complete")}
                  className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30 transition-colors"
                >
                  ✅ Complete all tasks on time
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="goalTitle" className="text-slate-300">Goal Title</Label>
                <Input
                  id="goalTitle"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Improve meeting attendance"
                  className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-slate-300">Goal Type</Label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="contribution_score">Contribution Score</SelectItem>
                    <SelectItem value="meeting_attendance">Meeting Attendance</SelectItem>
                    <SelectItem value="task_completion">Task Completion</SelectItem>
                    <SelectItem value="words_written">Words Written</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goalTarget" className="text-slate-300">Target Value</Label>
                  <Input
                    id="goalTarget"
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="e.g., 90"
                    className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="goalDeadline" className="text-slate-300">Deadline</Label>
                  <Input
                    id="goalDeadline"
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="mt-2 bg-white/10 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowGoalModal(false)} className="bg-white/10 border-white/10 text-white hover:bg-white/20">
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} className="bg-blue-500 hover:bg-blue-600">
                Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Detail Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
          {selectedAchievement && (
            <div className="text-center py-4">
              <span className="text-5xl">{selectedAchievement.emoji}</span>
              <h3 className="text-white font-semibold text-lg mt-4">{selectedAchievement.name}</h3>
              <p className="text-slate-300 text-sm mt-2">{selectedAchievement.description}</p>
              <p className="text-slate-500 text-xs mt-4 capitalize">Category: {selectedAchievement.category}</p>
              {isAchievementUnlocked(selectedAchievement.id) ? (
                <p className="text-green-400 text-sm mt-3 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Unlocked {getAchievementUnlockDate(selectedAchievement.id) && new Date(getAchievementUnlockDate(selectedAchievement.id)!).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-slate-500 text-sm mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-4 h-4" />
                  Not yet unlocked
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Score Breakdown Modal */}
      {selectedProject && (
        <ScoreBreakdownModal
          open={scoreModalOpen}
          onOpenChange={setScoreModalOpen}
          studentId=""
          studentName="You"
          projectId={selectedProject.project_id}
          projectName={selectedProject.project_name}
          isTeacher={false}
        />
      )}
    </StudentLayout>
  );
};

export default StudentStats;
