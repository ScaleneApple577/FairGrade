import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Users, Activity, Clock, FileText, MessageSquare, Video, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OnlineStudent {
  id: string;
  name: string;
  initials: string;
  color: string;
  project: string;
  group: number;
  currentActivity: string;
  platform: string;
  lastAction: string;
  duration: string;
}

const mockOnlineStudents: OnlineStudent[] = [
  {
    id: "1",
    name: "Alice Kim",
    initials: "AK",
    color: "bg-blue-500",
    project: "CS 101 Final Project",
    group: 1,
    currentActivity: "Editing document",
    platform: "Google Docs",
    lastAction: "Added 47 characters",
    duration: "32 mins",
  },
  {
    id: "2",
    name: "Bob Lee",
    initials: "BL",
    color: "bg-green-500",
    project: "CS 101 Final Project",
    group: 1,
    currentActivity: "Editing document",
    platform: "Google Docs",
    lastAction: "Reviewing section 3",
    duration: "15 mins",
  },
  {
    id: "3",
    name: "Charlie Martinez",
    initials: "CM",
    color: "bg-purple-500",
    project: "MATH 250 Midterm",
    group: 2,
    currentActivity: "In meeting",
    platform: "Zoom",
    lastAction: "Team sync call",
    duration: "8 mins",
  },
  {
    id: "4",
    name: "Diana Chen",
    initials: "DC",
    color: "bg-pink-500",
    project: "CS 101 Final Project",
    group: 2,
    currentActivity: "Messaging",
    platform: "Slack",
    lastAction: "Sent message in #project-chat",
    duration: "2 mins",
  },
];

interface RecentEvent {
  id: string;
  studentName: string;
  studentInitials: string;
  studentColor: string;
  eventType: "edit" | "paste" | "message" | "meeting" | "comment" | "flag";
  description: string;
  platform: string;
  timestamp: string;
  details?: string;
}

const mockRecentEvents: RecentEvent[] = [
  {
    id: "1",
    studentName: "Alice Kim",
    studentInitials: "AK",
    studentColor: "bg-blue-500",
    eventType: "edit",
    description: "Added 47 characters to Section 3",
    platform: "Google Docs",
    timestamp: "Just now",
  },
  {
    id: "2",
    studentName: "Bob Lee",
    studentInitials: "BL",
    studentColor: "bg-green-500",
    eventType: "comment",
    description: "Left comment on Introduction",
    platform: "Google Docs",
    timestamp: "2 mins ago",
  },
  {
    id: "3",
    studentName: "Diana Chen",
    studentInitials: "DC",
    studentColor: "bg-pink-500",
    eventType: "message",
    description: "Sent message in #project-chat",
    platform: "Slack",
    timestamp: "5 mins ago",
  },
  {
    id: "4",
    studentName: "Charlie Martinez",
    studentInitials: "CM",
    studentColor: "bg-purple-500",
    eventType: "meeting",
    description: "Joined team sync call",
    platform: "Zoom",
    timestamp: "8 mins ago",
  },
  {
    id: "5",
    studentName: "David Wilson",
    studentInitials: "DW",
    studentColor: "bg-orange-500",
    eventType: "flag",
    description: "Large paste detected (523 chars)",
    platform: "Google Docs",
    timestamp: "15 mins ago",
    details: "AI Score: 87%",
  },
  {
    id: "6",
    studentName: "Alice Kim",
    studentInitials: "AK",
    studentColor: "bg-blue-500",
    eventType: "paste",
    description: "Pasted 89 characters",
    platform: "Google Docs",
    timestamp: "20 mins ago",
  },
];

const eventTypeIcons = {
  edit: FileText,
  paste: FileText,
  message: MessageSquare,
  meeting: Video,
  comment: MessageSquare,
  flag: AlertTriangle,
};

const eventTypeColors = {
  edit: "text-blue-500",
  paste: "text-orange-500",
  message: "text-green-500",
  meeting: "text-purple-500",
  comment: "text-cyan-500",
  flag: "text-destructive",
};

export default function LiveMonitor() {
  const [project, setProject] = useState("all");

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="relative">
                  <Eye className="w-8 h-8 text-success" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
                </div>
                Live Monitor
              </h1>
              <p className="text-muted-foreground">Real-time student activity across all projects</p>
            </div>

            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="cs101">CS 101 Final Project</SelectItem>
                <SelectItem value="math250">MATH 250 Midterm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{mockOnlineStudents.length}</p>
                  <p className="text-sm text-muted-foreground">Students Online</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">47</p>
                  <p className="text-sm text-muted-foreground">Events (Last Hour)</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">2</p>
                  <p className="text-sm text-muted-foreground">Active Meetings</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">1</p>
                  <p className="text-sm text-muted-foreground">New Flags</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Online Students */}
            <div className="col-span-5">
              <div className="bg-card rounded-xl border border-border shadow-soft">
                <div className="p-4 border-b border-border">
                  <h2 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Online Now
                  </h2>
                </div>

                <div className="divide-y divide-border">
                  {mockOnlineStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${student.color} rounded-full flex items-center justify-center text-white font-bold relative`}>
                          {student.initials}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.project} • Group {student.group}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs mb-1">
                            {student.platform}
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {student.duration}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 ml-13 pl-0.5">
                        {student.currentActivity} • {student.lastAction}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Stream */}
            <div className="col-span-7">
              <div className="bg-card rounded-xl border border-border shadow-soft">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-bold text-foreground">Recent Activity</h2>
                  <Badge variant="outline">Live</Badge>
                </div>

                <div className="divide-y divide-border max-h-[600px] overflow-auto">
                  {mockRecentEvents.map((event, index) => {
                    const Icon = eventTypeIcons[event.eventType];
                    const iconColor = eventTypeColors[event.eventType];

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-4 hover:bg-muted/50 transition-colors ${
                          event.eventType === "flag" ? "bg-destructive/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 ${event.studentColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {event.studentInitials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground text-sm">{event.studentName}</p>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                              <Badge variant="secondary" className="text-xs">
                                {event.platform}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            {event.details && (
                              <p className="text-xs text-destructive mt-1 font-medium">{event.details}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.timestamp}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
