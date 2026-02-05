import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Star,
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
  LogOut,
  Home,
} from "lucide-react";
import { MenuVertical } from "@/components/ui/menu-vertical";
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
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: FolderOpen, label: "My Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Peer Reviews", href: "/student/reviews" },
  { icon: BarChart3, label: "My Stats", href: "/student/stats" },
];

// Mock data - in production this would come from API
const mockStats = {
  overall_score: 87,
  score_trend: 12,
  percentile: 73,
  breakdown: {
    task_completion: 92,
    meeting_attendance: 85,
    contribution_volume: 88,
    peer_reviews: 84,
    quality: 86,
  },
  contribution_metrics: {
    words_written: 12847,
    edit_sessions: 47,
    active_time_minutes: 1472,
    tasks_completed: 18,
    tasks_total: 22,
    team_average_words: 10200,
  },
  meeting_stats: {
    meetings_attended: 15,
    meetings_total: 18,
    attendance_percentage: 83,
    average_duration_minutes: 48,
    average_response_time_hours: 2.3,
    peer_rating: 4.2,
  },
  recent_meetings: [
    { title: "Team Retro - CS 101", project: "CS 101", date: "Feb 2", duration_minutes: 45, attended: true },
    { title: "Client Call - Marketing", project: "Marketing", date: "Jan 31", duration_minutes: null, attended: false },
    { title: "Design Review - Marketing", project: "Marketing", date: "Jan 29", duration_minutes: 52, attended: true },
  ],
  project_breakdown: [
    { project_id: "1", project_name: "CS 101 Final Project", course: "Computer Science", score: 92, words_written: 3847, tasks_completed: 8, tasks_total: 9, meetings_attended: 5, meetings_total: 5, peer_rating: 4.5, status: "excellent" as const },
    { project_id: "2", project_name: "Marketing Campaign", course: "Business 201", score: 78, words_written: 5200, tasks_completed: 6, tasks_total: 8, meetings_attended: 7, meetings_total: 9, peer_rating: 4.0, status: "good" as const },
    { project_id: "3", project_name: "Biology Lab Report", course: "Biology 150", score: 65, words_written: 3800, tasks_completed: 4, tasks_total: 5, meetings_attended: 3, meetings_total: 4, peer_rating: 3.8, status: "fair" as const },
  ],
  improvement_suggestions: [
    { type: "critical" as const, title: "Improve Meeting Attendance", description: "You've missed 3 meetings. Aim for 100% attendance to boost your score by 5 points.", potential_score_increase: 5 },
    { type: "warning" as const, title: "Complete Pending Tasks", description: "You have 4 tasks in progress. Complete them before deadlines to improve reliability.", potential_score_increase: 3 },
    { type: "info" as const, title: "Faster Response Times", description: "Respond to messages within 24hrs. Your avg. is 2.3hrs - keep it up!", potential_score_increase: 0 },
    { type: "success" as const, title: "Great Contribution Volume", description: "You're writing 26% more than your team avg. Keep up the excellent work!", potential_score_increase: 0 },
  ],
  weekly_summary: {
    total_contributions: 58,
    tasks_completed: 5,
    meetings_attended: 3,
    meetings_total: 3,
    words_written: 2450,
    active_time_minutes: 495,
  },
  achievements: [
    { id: "1", title: "Perfect Week", description: "100% attendance", icon: "trophy", earned: true, earned_at: "2026-01-15" },
    { id: "2", title: "Speed Demon", description: "Fast responder", icon: "zap", earned: true, earned_at: "2026-01-20" },
    { id: "3", title: "Task Master", description: "10 tasks done", icon: "check", earned: true, earned_at: "2026-01-25" },
    { id: "4", title: "Team Player", description: "4.5+ rating", icon: "lock", earned: false, earned_at: null },
  ],
};

const mockGoals = [
  { id: "1", title: "Attend 100% of meetings", goal_type: "meeting_attendance", target_value: 100, current_value: 83, progress_percentage: 83, deadline: "2026-02-28", status: "on_track" as const },
  { id: "2", title: "Complete tasks 1 day before deadline", goal_type: "task_completion", target_value: 100, current_value: 92, progress_percentage: 92, deadline: "2026-03-15", status: "on_track" as const },
  { id: "3", title: "Reach 90+ contribution score", goal_type: "contribution_score", target_value: 90, current_value: 87, progress_percentage: 97, deadline: "2026-02-15", status: "at_risk" as const },
];

// Generate activity data for heatmap
const generateActivityData = () => {
  const data: number[][] = [];
  for (let week = 0; week < 12; week++) {
    const weekData: number[] = [];
    for (let day = 0; day < 7; day++) {
      weekData.push(Math.floor(Math.random() * 5));
    }
    data.push(weekData);
  }
  return data;
};

const activityData = generateActivityData();

const weeklyActivity = [
  { day: "Mon", contributions: 12 },
  { day: "Tue", contributions: 8 },
  { day: "Wed", contributions: 15 },
  { day: "Thu", contributions: 6 },
  { day: "Fri", contributions: 10 },
  { day: "Sat", contributions: 3 },
  { day: "Sun", contributions: 0 },
];

const StudentStats = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState("contribution_score");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goals, setGoals] = useState(mockGoals);
  const [timeFilter, setTimeFilter] = useState("30");

  const handleCreateGoal = () => {
    if (!goalTitle || !goalTarget || !goalDeadline) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      title: goalTitle,
      goal_type: goalType,
      target_value: parseInt(goalTarget),
      current_value: 0,
      progress_percentage: 0,
      deadline: goalDeadline,
      status: "on_track" as const,
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return { bg: "bg-green-500", text: "text-green-600", label: "Excellent Performance" };
      case "good": return { bg: "bg-blue-500", text: "text-blue-600", label: "Good Performance" };
      case "fair": return { bg: "bg-yellow-500", text: "text-yellow-600", label: "Room for Improvement" };
      default: return { bg: "bg-red-500", text: "text-red-600", label: "Needs Attention" };
    }
  };

  const heatmapColors = [
    "bg-slate-100",
    "bg-green-200",
    "bg-green-300",
    "bg-green-500",
    "bg-green-600",
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-white/10 fixed h-full flex flex-col">
        <div className="p-6 border-b border-white/10">
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
              <span className="text-white">Fair</span>
              <span className="text-blue-400">Grade</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <MenuVertical menuItems={sidebarItems} variant="dark" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Stats</h1>
              <p className="text-slate-400 mt-1">Track your contributions and performance across all projects</p>
            </div>
          </div>
        </div>

        {/* Hero Card - Overall Contribution Score */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            {/* Left Side: Score */}
            <div className="flex-1">
              <p className="text-blue-100 text-sm mb-2">Your Overall Contribution Score</p>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-7xl font-bold">{mockStats.overall_score}</span>
                <span className="text-3xl text-blue-100">/100</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-green-300 font-semibold">+{mockStats.score_trend} points from last month</span>
              </div>
              <p className="text-blue-100 text-sm mt-3">
                You're performing better than <strong className="text-white">{mockStats.percentile}% of students</strong> in your classes
              </p>
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
                  strokeDasharray={`${mockStats.overall_score * 5.53} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold">{mockStats.overall_score}</p>
                  <p className="text-sm text-blue-100">Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown Bar */}
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <p className="text-sm text-blue-100 mb-3">Score Breakdown</p>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{mockStats.breakdown.task_completion}</p>
                <p className="text-xs text-blue-100 mt-1">Task Completion</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.breakdown.meeting_attendance}</p>
                <p className="text-xs text-blue-100 mt-1">Meeting Attendance</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.breakdown.contribution_volume}</p>
                <p className="text-xs text-blue-100 mt-1">Contribution Volume</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.breakdown.peer_reviews}</p>
                <p className="text-xs text-blue-100 mt-1">Peer Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.breakdown.quality}</p>
                <p className="text-xs text-blue-100 mt-1">Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT COLUMN - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contribution Metrics */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Contribution Metrics</h2>
              
              <div className="space-y-6">
                {/* Words Written */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-white">Words Written</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{mockStats.contribution_metrics.words_written.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">vs. team average ({mockStats.contribution_metrics.team_average_words.toLocaleString()})</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +26%
                    </span>
                  </div>
                </div>

                {/* Edit Sessions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-purple-500" />
                      <span className="font-semibold text-white">Edit Sessions</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{mockStats.contribution_metrics.edit_sessions}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">vs. team average (38)</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +24%
                    </span>
                  </div>
                </div>

                {/* Active Time */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-white">Active Time</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{formatTime(mockStats.contribution_metrics.active_time_minutes)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">vs. team average (19h 15m)</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +27%
                    </span>
                  </div>
                </div>

                {/* Tasks Completed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-white">Tasks Completed</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">
                      {mockStats.contribution_metrics.tasks_completed}/{mockStats.contribution_metrics.tasks_total}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(mockStats.contribution_metrics.tasks_completed / mockStats.contribution_metrics.tasks_total) * 100}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{Math.round((mockStats.contribution_metrics.tasks_completed / mockStats.contribution_metrics.tasks_total) * 100)}% completion rate</span>
                    <span className="text-slate-400 font-medium">{mockStats.contribution_metrics.tasks_total - mockStats.contribution_metrics.tasks_completed} in progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting & Collaboration Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Meeting & Collaboration</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600 mb-1">{mockStats.meeting_stats.meetings_attended}/{mockStats.meeting_stats.meetings_total}</p>
                  <p className="text-sm text-slate-600">Meetings Attended</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{mockStats.meeting_stats.attendance_percentage}% attendance</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-600 mb-1">{mockStats.meeting_stats.average_duration_minutes}m</p>
                  <p className="text-sm text-slate-600">Avg. Duration</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">per meeting</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-600 mb-1">{mockStats.meeting_stats.average_response_time_hours}h</p>
                  <p className="text-sm text-slate-600">Avg. Response Time</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">to messages</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-600 mb-1">{mockStats.meeting_stats.peer_rating}/5</p>
                  <p className="text-sm text-slate-600">Peer Rating</p>
                  <p className="text-xs text-yellow-600 font-medium mt-1">from teammates</p>
                </div>
              </div>

              {/* Recent Meetings */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Recent Meetings</h3>
                <div className="space-y-2">
                  {mockStats.recent_meetings.map((meeting, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {meeting.attended ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-slate-700">{meeting.title}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {meeting.date}, {meeting.attended ? `${meeting.duration_minutes}m` : "Missed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Activity Timeline</h2>
                <select 
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Activity Heatmap */}
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-3">Contribution activity</p>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {activityData.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((activityLevel, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm ${heatmapColors[activityLevel]}`}
                          title={`${activityLevel} contributions`}
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

              {/* Daily Breakdown */}
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">This Week's Activity</p>
                <div className="space-y-2">
                  {weeklyActivity.map((item) => (
                    <div key={item.day} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-8">{item.day}</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(item.contributions * 6, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600 w-16 text-right">
                        {item.contributions} {item.contributions === 1 ? 'edit' : 'edits'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project-by-Project Breakdown */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Performance by Project</h2>
              
              <div className="space-y-4">
                {mockStats.project_breakdown.map((project) => {
                  const statusInfo = getStatusColor(project.status);
                  return (
                    <div key={project.project_id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{project.project_name}</h3>
                          <p className="text-xs text-slate-500">{project.course}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getScoreColor(project.score)}`}>{project.score}</p>
                          <p className="text-xs text-slate-500">Score</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">{project.words_written.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">Words</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">{project.tasks_completed}/{project.tasks_total}</p>
                          <p className="text-xs text-slate-500">Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">{project.meetings_attended}/{project.meetings_total}</p>
                          <p className="text-xs text-slate-500">Meetings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">{project.peer_rating}</p>
                          <p className="text-xs text-slate-500">Rating</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${statusInfo.bg} rounded-full`}></div>
                        <span className={`text-sm ${statusInfo.text} font-medium`}>{statusInfo.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 1/3 width */}
          <div className="space-y-6">
            {/* Improvement Suggestions */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-slate-900">Improvement Suggestions</h3>
              </div>

              <div className="space-y-3">
                {mockStats.improvement_suggestions.map((suggestion, index) => {
                  const typeStyles = {
                    critical: { bg: "bg-red-50", border: "border-red-200", icon: AlertCircle, iconColor: "text-red-500", titleColor: "text-red-900", textColor: "text-red-800" },
                    warning: { bg: "bg-yellow-50", border: "border-yellow-200", icon: TrendingUp, iconColor: "text-yellow-500", titleColor: "text-yellow-900", textColor: "text-yellow-800" },
                    info: { bg: "bg-blue-50", border: "border-blue-200", icon: MessageSquare, iconColor: "text-blue-500", titleColor: "text-blue-900", textColor: "text-blue-800" },
                    success: { bg: "bg-green-50", border: "border-green-200", icon: CheckCircle, iconColor: "text-green-500", titleColor: "text-green-900", textColor: "text-green-800" },
                  };
                  const style = typeStyles[suggestion.type];
                  const Icon = style.icon;

                  return (
                    <div key={index} className={`p-3 ${style.bg} border ${style.border} rounded-lg`}>
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 ${style.iconColor} flex-shrink-0 mt-0.5`} />
                        <div>
                          <p className={`text-sm font-semibold ${style.titleColor} mb-1`}>{suggestion.title}</p>
                          <p className={`text-xs ${style.textColor}`}>{suggestion.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Personal Goals */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-slate-900">My Goals</h3>
                </div>
                <button 
                  onClick={() => setShowGoalModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="space-y-4">
                {goals.map((goal) => {
                  const isAtRisk = goal.status === "at_risk";
                  const isOnTrack = goal.status === "on_track" && goal.progress_percentage >= 90;
                  
                  return (
                    <div 
                      key={goal.id} 
                      className={`border rounded-lg p-4 ${
                        isAtRisk ? "border-red-200 bg-red-50" : 
                        isOnTrack ? "border-green-200 bg-green-50" : 
                        "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 text-sm">{goal.title}</h4>
                        <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">Complete by: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className={`font-semibold ${isAtRisk ? "text-red-700" : isOnTrack ? "text-green-700" : "text-slate-900"}`}>
                            {goal.progress_percentage}%
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${isAtRisk ? "bg-red-200" : isOnTrack ? "bg-green-200" : "bg-slate-200"}`}>
                          <div 
                            className={`h-2 rounded-full ${isAtRisk ? "bg-red-600" : isOnTrack ? "bg-green-600" : "bg-blue-500"}`} 
                            style={{ width: `${goal.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      {isAtRisk && (
                        <p className="text-xs text-red-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {goal.target_value - goal.current_value} more points needed!
                        </p>
                      )}
                      {isOnTrack && (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          On track to achieve!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold">This Week's Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm text-purple-100 mb-1">Total Contributions</p>
                  <p className="text-3xl font-bold">{mockStats.weekly_summary.total_contributions}</p>
                  <p className="text-xs text-purple-100 mt-1">+12 from last week</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-100">Tasks completed</span>
                    <span className="font-semibold">{mockStats.weekly_summary.tasks_completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-100">Meetings attended</span>
                    <span className="font-semibold">{mockStats.weekly_summary.meetings_attended}/{mockStats.weekly_summary.meetings_total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-100">Words written</span>
                    <span className="font-semibold">{mockStats.weekly_summary.words_written.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-100">Active time</span>
                    <span className="font-semibold">{formatTime(mockStats.weekly_summary.active_time_minutes)}</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-white text-purple-600 font-semibold py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm">
                  View Full Report
                </button>
              </div>
            </div>

            {/* Achievements & Badges */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-slate-900">Achievements</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {mockStats.achievements.map((achievement) => {
                  if (achievement.earned) {
                    const colors = {
                      trophy: { from: "from-yellow-100", to: "to-yellow-50", border: "border-yellow-300", icon: Trophy, iconColor: "text-yellow-500", titleColor: "text-yellow-900", descColor: "text-yellow-700" },
                      zap: { from: "from-blue-100", to: "to-blue-50", border: "border-blue-300", icon: Zap, iconColor: "text-blue-500", titleColor: "text-blue-900", descColor: "text-blue-700" },
                      check: { from: "from-green-100", to: "to-green-50", border: "border-green-300", icon: CheckCircle, iconColor: "text-green-500", titleColor: "text-green-900", descColor: "text-green-700" },
                    };
                    const style = colors[achievement.icon as keyof typeof colors] || colors.trophy;
                    const Icon = style.icon;

                    return (
                      <div key={achievement.id} className={`text-center p-3 bg-gradient-to-br ${style.from} ${style.to} border-2 ${style.border} rounded-lg`}>
                        <Icon className={`w-10 h-10 ${style.iconColor} mx-auto mb-2`} />
                        <p className={`text-xs font-semibold ${style.titleColor}`}>{achievement.title}</p>
                        <p className={`text-xs ${style.descColor} mt-1`}>{achievement.description}</p>
                      </div>
                    );
                  } else {
                    return (
                      <div key={achievement.id} className="text-center p-3 bg-slate-100 border-2 border-slate-300 rounded-lg opacity-60">
                        <Lock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600">{achievement.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{achievement.description}</p>
                      </div>
                    );
                  }
                })}
              </div>

              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Achievements →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Create New Goal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Goal Title */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                What's your goal? *
              </Label>
              <Input 
                type="text"
                placeholder="e.g., Attend 100% of meetings"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>

            {/* Goal Type */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Goal Type
              </Label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contribution_score">Contribution Score</SelectItem>
                  <SelectItem value="meeting_attendance">Meeting Attendance</SelectItem>
                  <SelectItem value="task_completion">Task Completion</SelectItem>
                  <SelectItem value="peer_rating">Peer Rating</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Value */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Target Value
              </Label>
              <Input 
                type="number"
                placeholder="e.g., 90"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
            </div>

            {/* Deadline */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Deadline
              </Label>
              <Input 
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
              />
            </div>

            {/* Suggested Goals */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Suggested Goals</p>
              <div className="space-y-2">
                <button 
                  onClick={() => setQuickGoal('meeting_100')}
                  className="w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors"
                >
                  Attend 100% of meetings this month
                </button>
                <button 
                  onClick={() => setQuickGoal('score_90')}
                  className="w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors"
                >
                  Reach 90+ contribution score
                </button>
                <button 
                  onClick={() => setQuickGoal('tasks_complete')}
                  className="w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors"
                >
                  Complete all assigned tasks on time
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button 
              variant="outline"
              onClick={() => setShowGoalModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGoal}
              className="flex-1"
            >
              Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentStats;
