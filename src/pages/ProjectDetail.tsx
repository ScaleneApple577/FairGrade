import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  Settings,
  FileText,
  Bell,
  Filter,
  Play,
  Download,
  Users,
} from "lucide-react";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { MetricCard, AlertItem, ActivityItem } from "@/components/project/ProjectWidgets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupDetailModal } from "@/components/project/GroupDetailModal";
import { StudentTable } from "@/components/project/StudentTable";
import { ReportGenerator } from "@/components/project/ReportGenerator";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data
const projectData = {
  name: "CS 101 Final Project",
  course: "Computer Science 101",
  deadline: "March 15, 2025",
  metrics: {
    students: 20,
    extensionsActive: 18,
    groups: 5,
    groupsNeedAttention: 2,
    avgContribution: 87,
    daysRemaining: 12,
  },
};

const alerts = [
  {
    type: "warning" as const,
    title: "2 students haven't installed extension",
    description:
      "David Chen and Emma Wilson haven't installed the tracking extension yet. Their contributions cannot be tracked.",
    time: "2 hours ago",
    actions: [
      { label: "Send Reminder Email", variant: "primary" as const },
      { label: "View Students", variant: "secondary" as const },
    ],
  },
  {
    type: "danger" as const,
    title: "Frank Martinez - Low Contribution Alert",
    description:
      "Only 13% contribution in Group 2. No activity in past 5 days. Consider reaching out to check on progress.",
    time: "1 day ago",
    actions: [
      { label: "View Group Details", variant: "primary" as const },
      { label: "Generate Report", variant: "secondary" as const },
    ],
  },
  {
    type: "info" as const,
    title: "Deadline in 12 days",
    description:
      "Project due March 15, 2025. All groups are on track with healthy contribution rates.",
    time: "Just now",
  },
];

const activities = [
  {
    avatar: "AK",
    name: "Alice Kim",
    action: "edited",
    target: "Project_Draft.docx",
    details: "Added 347 characters in Google Docs",
    time: "2 hours ago",
    color: "bg-primary",
  },
  {
    avatar: "G3",
    name: "Group 3",
    action: "completed a",
    target: "Zoom meeting",
    details: "4 members attended • 45 minutes duration",
    time: "5 hours ago",
    color: "bg-success",
  },
  {
    avatar: "BL",
    name: "Bob Lee",
    action: "sent messages in",
    target: "Slack #group-1",
    details: "12 messages • Active discussion",
    time: "1 day ago",
    color: "bg-warning",
  },
  {
    avatar: "DM",
    name: "David Martinez",
    action: "pushed commits to",
    target: "GitHub repo",
    details: "3 commits • 127 lines added",
    time: "1 day ago",
    color: "bg-foreground",
  },
  {
    avatar: "EW",
    name: "Emma Wilson",
    action: "installed",
    target: "FairGrade Extension",
    details: "Now tracking contributions",
    time: "2 days ago",
    color: "bg-success",
  },
];

const groups = [
  {
    id: "1",
    name: "Group 1",
    members: ["Alice Kim", "Bob Lee", "Charlie Brown", "Diana Ross"],
    avgContribution: 92,
    status: "healthy",
  },
  {
    id: "2",
    name: "Group 2",
    members: ["David Martinez", "Emma Wilson", "Frank Chen"],
    avgContribution: 67,
    status: "warning",
  },
  {
    id: "3",
    name: "Group 3",
    members: ["Grace Lee", "Henry Wu", "Ivy Zhang", "Jack Smith"],
    avgContribution: 88,
    status: "healthy",
  },
  {
    id: "4",
    name: "Group 4",
    members: ["Karen Johnson", "Leo Brown", "Mia Davis"],
    avgContribution: 95,
    status: "healthy",
  },
  {
    id: "5",
    name: "Group 5",
    members: ["Noah Wilson", "Olivia Miller", "Peter Chen", "Quinn Adams"],
    avgContribution: 78,
    status: "healthy",
  },
];

// Analytics mock data
const contributionTrendData = [
  { date: "Week 1", avgContribution: 65, activities: 120 },
  { date: "Week 2", avgContribution: 72, activities: 185 },
  { date: "Week 3", avgContribution: 78, activities: 220 },
  { date: "Week 4", avgContribution: 85, activities: 310 },
  { date: "Week 5", avgContribution: 87, activities: 380 },
];

const platformData = [
  { name: "Google Docs", value: 45, color: "hsl(217, 91%, 60%)" },
  { name: "GitHub", value: 30, color: "hsl(142, 71%, 45%)" },
  { name: "Slack", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Zoom", value: 10, color: "hsl(262, 83%, 58%)" },
];

const studentData = [
  { id: "1", name: "Alice Kim", email: "alice.kim@school.edu", group: "Group 1", contribution: 96, lastActive: "2h ago", extensionStatus: "active" as const, flags: 0 },
  { id: "2", name: "Bob Lee", email: "bob.lee@school.edu", group: "Group 1", contribution: 88, lastActive: "5h ago", extensionStatus: "active" as const, flags: 0 },
  { id: "3", name: "David Martinez", email: "david.m@school.edu", group: "Group 2", contribution: 55, lastActive: "1d ago", extensionStatus: "active" as const, flags: 0 },
  { id: "4", name: "Emma Wilson", email: "emma.w@school.edu", group: "Group 2", contribution: 32, lastActive: "3d ago", extensionStatus: "inactive" as const, flags: 1 },
  { id: "5", name: "Frank Chen", email: "frank.c@school.edu", group: "Group 2", contribution: 13, lastActive: "5d ago", extensionStatus: "not_installed" as const, flags: 2 },
  { id: "6", name: "Grace Lee", email: "grace.l@school.edu", group: "Group 3", contribution: 91, lastActive: "30m ago", extensionStatus: "active" as const, flags: 0 },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  return (
    <TeacherLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/teacher/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{projectData.name}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{projectData.name}</h1>
              <p className="text-muted-foreground">
                {projectData.course} • Due {projectData.deadline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/project/${id}/timeline`}>
                  <Play className="h-4 w-4 mr-2" />
                  Timeline Replay
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm" onClick={() => setShowReportGenerator(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Students"
                  value={projectData.metrics.students}
                  subtitle={`✓ ${projectData.metrics.extensionsActive} extensions active`}
                  icon="users"
                />
                <MetricCard
                  title="Groups"
                  value={projectData.metrics.groups}
                  subtitle={`⚠️ ${projectData.metrics.groupsNeedAttention} need attention`}
                  icon="groups"
                />
                <MetricCard
                  title="Avg Contribution"
                  value={`${projectData.metrics.avgContribution}%`}
                  subtitle="Balanced overall"
                  icon="contribution"
                />
                <MetricCard
                  title="Days Remaining"
                  value={projectData.metrics.daysRemaining}
                  subtitle={`Due ${projectData.deadline}`}
                  icon="days"
                />
              </div>

              {/* Alerts */}
              <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  <h2 className="font-semibold text-foreground">Alerts & Action Items</h2>
                </div>
                <div className="p-4 space-y-4">
                  {alerts.map((alert, index) => (
                    <AlertItem key={index} {...alert} />
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Recent Activity</h2>
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      <SelectItem value="1">Group 1</SelectItem>
                      <SelectItem value="2">Group 2</SelectItem>
                      <SelectItem value="3">Group 3</SelectItem>
                      <SelectItem value="4">Group 4</SelectItem>
                      <SelectItem value="5">Group 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="px-4 divide-y divide-border">
                  {activities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
                <div className="p-4 border-t border-border">
                  <Button variant="ghost" className="w-full" onClick={() => setActiveTab("activity")}>
                    View All Activity (127 events) →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "students" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">All Students</h2>
                  <p className="text-sm text-muted-foreground">{studentData.length} students enrolled</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Add Students
                  </Button>
                </div>
              </div>

              <StudentTable students={studentData} />
            </motion.div>
          )}

          {activeTab === "groups" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">All Groups</h2>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-card rounded-xl border p-6 cursor-pointer hover:shadow-elevated transition-all ${
                      group.status === "warning"
                        ? "border-warning/50"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-foreground">{group.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          group.status === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {group.avgContribution}% avg
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div
                          key={member}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {member
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          {member}
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4">
                      View Details →
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contribution Trend */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                  <h3 className="font-semibold text-foreground mb-4">Contribution Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={contributionTrendData}>
                        <defs>
                          <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="avgContribution"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#colorContrib)"
                          name="Avg Contribution %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Platform Breakdown */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                  <h3 className="font-semibold text-foreground mb-4">Platform Breakdown</h3>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {platformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => `${value}%`}
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {platformData.map((platform) => (
                        <div key={platform.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: platform.color }}
                            />
                            <span className="text-sm text-foreground">{platform.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{platform.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Comparison */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-4">Group Contribution Comparison</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groups}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="avgContribution"
                        name="Avg Contribution"
                        radius={[4, 4, 0, 0]}
                      >
                        {groups.map((group, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={group.status === "warning" ? "hsl(var(--warning))" : "hsl(var(--primary))"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border shadow-soft overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Full Activity Feed</h2>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="1">Group 1</SelectItem>
                    <SelectItem value="2">Group 2</SelectItem>
                    <SelectItem value="3">Group 3</SelectItem>
                    <SelectItem value="4">Group 4</SelectItem>
                    <SelectItem value="5">Group 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-4 divide-y divide-border">
                {[...activities, ...activities, ...activities].map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Group Detail Modal */}
      <GroupDetailModal
        isOpen={selectedGroup !== null}
        onClose={() => setSelectedGroup(null)}
        groupId={selectedGroup}
      />

      {/* Report Generator Modal */}
      <ReportGenerator
        isOpen={showReportGenerator}
        onClose={() => setShowReportGenerator(false)}
        projectName={projectData.name}
      />
    </TeacherLayout>
  );
}
