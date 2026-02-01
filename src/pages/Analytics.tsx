import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Clock,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
} from "recharts";

// Mock data for charts
const contributionTrendData = [
  { date: "Mon", avgContribution: 72, activities: 45, documents: 12 },
  { date: "Tue", avgContribution: 78, activities: 52, documents: 18 },
  { date: "Wed", avgContribution: 85, activities: 68, documents: 24 },
  { date: "Thu", avgContribution: 82, activities: 55, documents: 20 },
  { date: "Fri", avgContribution: 88, activities: 72, documents: 28 },
  { date: "Sat", avgContribution: 65, activities: 25, documents: 8 },
  { date: "Sun", avgContribution: 70, activities: 35, documents: 10 },
];

const platformBreakdownData = [
  { name: "Google Docs", value: 42, color: "hsl(217, 91%, 60%)" },
  { name: "GitHub", value: 28, color: "hsl(142, 71%, 45%)" },
  { name: "Slack", value: 18, color: "hsl(38, 92%, 50%)" },
  { name: "Zoom", value: 12, color: "hsl(262, 83%, 58%)" },
];

const groupPerformanceData = [
  { name: "Group 1", contribution: 92, tasks: 95, meetings: 88 },
  { name: "Group 2", contribution: 67, tasks: 72, meetings: 80 },
  { name: "Group 3", contribution: 88, tasks: 90, meetings: 92 },
  { name: "Group 4", contribution: 95, tasks: 98, meetings: 95 },
  { name: "Group 5", contribution: 78, tasks: 82, meetings: 75 },
];

const activityHeatmapData = [
  { hour: "9AM", Mon: 12, Tue: 15, Wed: 18, Thu: 14, Fri: 20 },
  { hour: "10AM", Mon: 25, Tue: 30, Wed: 35, Thu: 28, Fri: 32 },
  { hour: "11AM", Mon: 35, Tue: 42, Wed: 48, Thu: 38, Fri: 45 },
  { hour: "12PM", Mon: 18, Tue: 22, Wed: 25, Thu: 20, Fri: 24 },
  { hour: "1PM", Mon: 20, Tue: 25, Wed: 28, Thu: 22, Fri: 26 },
  { hour: "2PM", Mon: 38, Tue: 45, Wed: 52, Thu: 42, Fri: 48 },
  { hour: "3PM", Mon: 45, Tue: 52, Wed: 58, Thu: 48, Fri: 55 },
  { hour: "4PM", Mon: 40, Tue: 48, Wed: 54, Thu: 44, Fri: 50 },
  { hour: "5PM", Mon: 30, Tue: 35, Wed: 40, Thu: 32, Fri: 38 },
];

const topContributors = [
  { name: "Alice Kim", group: "Group 1", score: 96, trend: "+5%" },
  { name: "David Martinez", group: "Group 2", score: 94, trend: "+8%" },
  { name: "Grace Lee", group: "Group 3", score: 92, trend: "+3%" },
  { name: "Karen Johnson", group: "Group 4", score: 91, trend: "+6%" },
  { name: "Noah Wilson", group: "Group 5", score: 89, trend: "+4%" },
];

const needsAttention = [
  { name: "Frank Chen", group: "Group 2", score: 13, lastActive: "5 days ago" },
  { name: "Ivy Zhang", group: "Group 3", score: 22, lastActive: "3 days ago" },
  { name: "Peter Chen", group: "Group 5", score: 28, lastActive: "2 days ago" },
];

export default function Analytics() {
  const [selectedProject, setSelectedProject] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights across all your projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="cs101">CS 101 Final Project</SelectItem>
                <SelectItem value="math201">Math 201 Group Work</SelectItem>
                <SelectItem value="eng102">English 102 Essay</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Avg Contribution</span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">82%</div>
            <div className="text-sm text-success">↑ 5% from last week</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Active Students</span>
              <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">89</div>
            <div className="text-sm text-muted-foreground">of 95 total</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
              <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">342h</div>
            <div className="text-sm text-muted-foreground">This week</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Activities</span>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">1,247</div>
            <div className="text-sm text-success">↑ 12% from last week</div>
          </div>
        </motion.div>

        {/* Charts Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="breakdown">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Calendar className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Contribution Trend */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-4">Contribution Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={contributionTrendData}>
                      <defs>
                        <linearGradient id="colorContribution" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#colorContribution)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Over Time */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-4">Activity Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={contributionTrendData}>
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
                      <Line
                        type="monotone"
                        dataKey="activities"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="documents"
                        stroke="hsl(var(--warning))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Activities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm text-muted-foreground">Document Edits</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Platform Breakdown */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-4">Platform Breakdown</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {platformBreakdownData.map((entry, index) => (
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
                    {platformBreakdownData.map((platform) => (
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

              {/* Top Contributors & Needs Attention */}
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                  <h3 className="font-semibold text-foreground mb-4">Top Contributors</h3>
                  <div className="space-y-3">
                    {topContributors.map((student, index) => (
                      <div key={student.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.group}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{student.score}%</p>
                          <p className="text-xs text-success">{student.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-destructive/30 p-6 shadow-soft">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    Needs Attention
                  </h3>
                  <div className="space-y-3">
                    {needsAttention.map((student) => (
                      <div key={student.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.group}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-destructive">{student.score}%</p>
                          <p className="text-xs text-muted-foreground">{student.lastActive}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-soft"
            >
              <h3 className="font-semibold text-foreground mb-4">Group Performance Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="contribution" fill="hsl(var(--primary))" name="Contribution" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="tasks" fill="hsl(var(--success))" name="Tasks" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="meetings" fill="hsl(var(--warning))" name="Meetings" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Contribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Meetings</span>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-soft"
            >
              <h3 className="font-semibold text-foreground mb-4">Activity Heatmap (Peak Hours)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityHeatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="Mon" stackId="a" fill="hsl(217, 91%, 60%)" />
                    <Bar dataKey="Tue" stackId="a" fill="hsl(217, 91%, 55%)" />
                    <Bar dataKey="Wed" stackId="a" fill="hsl(217, 91%, 50%)" />
                    <Bar dataKey="Thu" stackId="a" fill="hsl(217, 91%, 45%)" />
                    <Bar dataKey="Fri" stackId="a" fill="hsl(217, 91%, 40%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Peak activity hours: 2PM - 4PM on weekdays
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
