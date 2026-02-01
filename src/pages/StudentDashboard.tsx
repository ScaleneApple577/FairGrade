import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  Puzzle,
  Trophy,
  FileText,
  Video,
  MessageSquare,
  Check,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const studentData = {
  name: "Alice Kim",
  email: "alice.kim@school.edu",
  avatar: "AK",
};

const quickStats = [
  { label: "Active Projects", value: "2", icon: TrendingUp },
  { label: "Avg Contribution", value: "29%", icon: Users },
  { label: "Hours This Week", value: "8.5", icon: Clock },
  { label: "Next Deadline", value: "3 days", icon: Calendar },
];

const projects = [
  {
    id: "1",
    name: "CS 101 Final Project",
    course: "Computer Science 101",
    deadline: "12 days",
    group: "Group 1",
    memberCount: 4,
    contribution: 40,
    status: "good",
    groupAvg: 33,
    stats: {
      documentEdits: { percent: 45, diff: "+5%" },
      meetings: { value: "2/2 ✓", note: "Perfect attendance" },
      tasks: { value: "6/8", note: "2 pending" },
      lastActive: { value: "2h ago", note: "● Active today" },
    },
    members: [
      { name: "You", initials: "AK", percent: 40, isUser: true },
      { name: "Bob Lee", initials: "BL", percent: 35 },
      { name: "Charlie M.", initials: "CM", percent: 25 },
    ],
  },
  {
    id: "2",
    name: "MATH 250 Group Lab",
    course: "Mathematics 250",
    deadline: "3 days!",
    group: "Group 3",
    memberCount: 3,
    contribution: 18,
    status: "warning",
    groupAvg: 33,
    stats: {
      documentEdits: { percent: 12, diff: "-21%" },
      meetings: { value: "0/3", note: "Missed all" },
      tasks: { value: "1/6", note: "5 overdue" },
      lastActive: { value: "4d ago", note: "○ Inactive" },
    },
    members: [],
  },
];

const availabilityGrid = [
  { time: "2:00 PM", mon: 4, tue: 3, wed: 4, thu: 1, fri: 2 },
  { time: "3:00 PM", mon: 3, tue: 4, wed: 1, thu: 2, fri: 4 },
  { time: "4:00 PM", mon: 0, tue: 3, wed: 2, thu: 4, fri: 1 },
];

const leaderboard = [
  { rank: 1, name: "Bob Lee", initials: "BL", hours: "12.5", percent: 47, badge: "🏆", note: "Top performer" },
  { rank: 2, name: "You (Alice Kim)", initials: "AK", hours: "8.5", percent: 40, badge: "✨", note: "Above average", isUser: true },
  { rank: 3, name: "Charlie Martinez", initials: "CM", hours: "5.2", percent: 25, badge: "🥉", note: "Good effort" },
  { rank: 4, name: "David Wilson", initials: "DW", hours: "1.8", percent: 13, badge: "", note: "Needs improvement" },
];

const activities = [
  { icon: FileText, title: 'Edited "Project_Draft.docx"', project: "CS 101 Final Project", time: "2 hours ago", detail: "Added 347 characters in Google Docs", color: "bg-primary" },
  { icon: Video, title: "Attended Group Meeting", project: "CS 101 Final Project", time: "Yesterday at 3:00 PM", detail: "45 minutes on Zoom • Camera on 100%", color: "bg-success" },
  { icon: MessageSquare, title: "Sent 12 messages in Slack", project: "CS 101 Final Project", time: "2 days ago", detail: "Active discussion in #group-1 channel", color: "bg-warning" },
  { icon: Check, title: 'Completed Task: "Create outline"', project: "CS 101 Final Project", time: "3 days ago", detail: "Marked as complete", color: "bg-success" },
];

function getAvailabilityClass(count: number) {
  if (count === 4) return "bg-success text-success-foreground";
  if (count >= 3) return "bg-success/60 text-success-foreground";
  if (count >= 2) return "bg-warning/60 text-warning-foreground";
  if (count >= 1) return "bg-warning/30 text-foreground";
  return "bg-destructive/30 text-destructive";
}

export default function StudentDashboard() {
  const [leaderboardFilter, setLeaderboardFilter] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="font-semibold text-foreground">Student Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {studentData.avatar}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{studentData.name}</p>
                  <p className="text-xs text-muted-foreground">{studentData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {studentData.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground">Here's how your projects are going</p>
        </motion.div>

        {/* Extension Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/10 border border-success/20 rounded-xl p-4 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                <Puzzle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Extension is Active & Tracking
                </p>
                <p className="text-sm text-muted-foreground">
                  Tracking 2 projects • Last sync: 2 minutes ago
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">View Settings</Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-4 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card rounded-xl border shadow-soft overflow-hidden ${
                project.status === "warning" ? "border-warning/50" : "border-border"
              }`}
            >
              {/* Project Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.course}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      project.status === "warning"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-muted"
                    }
                  >
                    {project.status === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    Due in {project.deadline}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {project.group} • {project.memberCount} members
                </div>
              </div>

              {/* Contribution Score */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Your Contribution</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-foreground">{project.contribution}%</span>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          project.status === "warning" ? "text-warning" : "text-success"
                        }`}
                      >
                        {project.status === "warning" ? "⚠️ Below Average" : "✓ Above Average"}
                      </p>
                      <p className="text-xs text-muted-foreground">Group avg: {project.groupAvg}%</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all ${
                      project.status === "warning" ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${project.contribution}%` }}
                  />
                </div>

                {/* Alert for warning status */}
                {project.status === "warning" && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Action Needed!</p>
                        <p className="text-sm text-muted-foreground">
                          You're behind your groupmates. Contribute more to avoid grade penalties.
                          Your last contribution was 4 days ago.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Document Edits</p>
                    <p className="font-semibold text-foreground">{project.stats.documentEdits.percent}%</p>
                    <p
                      className={`text-xs ${
                        project.stats.documentEdits.diff.startsWith("+")
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {project.stats.documentEdits.diff} vs avg
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Meetings</p>
                    <p className="font-semibold text-foreground">{project.stats.meetings.value}</p>
                    <p className="text-xs text-muted-foreground">{project.stats.meetings.note}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tasks Complete</p>
                    <p className="font-semibold text-foreground">{project.stats.tasks.value}</p>
                    <p className="text-xs text-muted-foreground">{project.stats.tasks.note}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Last Active</p>
                    <p className="font-semibold text-foreground">{project.stats.lastActive.value}</p>
                    <p className="text-xs text-muted-foreground">{project.stats.lastActive.note}</p>
                  </div>
                </div>

                {/* Group Members (only for good status projects) */}
                {project.members.length > 0 && (
                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Group Contributions</span>
                      <button className="text-xs text-primary hover:underline">View Details</button>
                    </div>
                    <div className="space-y-2">
                      {project.members.map((member) => (
                        <div key={member.name} className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                              member.isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {member.initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className={member.isUser ? "font-medium text-foreground" : "text-muted-foreground"}>
                                {member.name}
                              </span>
                              <span className="font-medium text-foreground">{member.percent}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  member.isUser ? "bg-primary" : "bg-muted-foreground/50"
                                }`}
                                style={{ width: `${member.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant={project.status === "warning" ? "default" : "ghost"}
                  className={`w-full ${project.status === "warning" ? "bg-warning hover:bg-warning/90" : ""}`}
                >
                  {project.status === "warning" ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Take Action Now
                    </>
                  ) : (
                    <>
                      View Full Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Availability Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-soft p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Team Availability - When Can We Meet?
              </h2>
              <p className="text-sm text-muted-foreground">See when your groupmates are available</p>
            </div>
            <Button variant="outline" size="sm">Update My Availability</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Time</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Mon</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Tue</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Wed</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Thu</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Fri</th>
                </tr>
              </thead>
              <tbody>
                {availabilityGrid.map((row) => (
                  <tr key={row.time} className="border-b border-border">
                    <td className="py-3 px-2 font-medium text-foreground">{row.time}</td>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((count, i) => (
                      <td key={i} className="text-center py-3 px-2">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium ${getAvailabilityClass(count)}`}
                        >
                          {count}/4 free
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-muted-foreground">All available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success/60" />
              <span className="text-muted-foreground">Most available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/30" />
              <span className="text-muted-foreground">Conflict</span>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-soft p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Top Contributors This Week
              </h2>
              <p className="text-sm text-muted-foreground">See who's working the hardest across all your projects</p>
            </div>
            <Select value={leaderboardFilter} onValueChange={setLeaderboardFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="cs101">CS 101 Final Project</SelectItem>
                <SelectItem value="math250">MATH 250 Group Lab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  entry.isUser ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank === 1
                      ? "bg-warning text-warning-foreground"
                      : entry.rank === 2
                      ? "bg-muted-foreground/50 text-background"
                      : entry.rank === 3
                      ? "bg-warning/60 text-warning-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {entry.rank}
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    entry.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {entry.initials}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${entry.isUser ? "text-primary" : "text-foreground"}`}>
                    {entry.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.hours} hours • {entry.percent}% contribution
                  </p>
                </div>
                <div className="text-right">
                  {entry.badge && <span className="text-xl">{entry.badge}</span>}
                  <p className={`text-sm ${entry.rank <= 3 ? "text-success" : "text-muted-foreground"}`}>
                    {entry.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-soft p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              My Activity This Week
            </h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="relative">
                  {index < activities.length - 1 && (
                    <div className="absolute left-1/2 top-10 bottom-0 w-0.5 -translate-x-1/2 bg-border h-8" />
                  )}
                  <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center`}>
                    <activity.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.project} • {activity.time}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
