import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Play, ChevronDown, MessageSquare, Trash2, Palette, Upload, Activity, Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

// TODO: GET http://localhost:8000/api/teacher/live-activity — returns recent activity feed with filters
// Activity types include: edited, commented, deleted, formatted, uploaded, submitted (for file submissions)

interface ActivityItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentColor: string;
  action: string;
  fileName: string;
  fileId: string;
  projectName: string;
  timestamp: string;
  detail: string;
  googleFileUrl?: string; // For file submissions
}

const actionIcons = {
  edited: FileText,
  commented: MessageSquare,
  deleted: Trash2,
  formatted: Palette,
  uploaded: Upload,
  submitted: Upload, // File submission
};

const actionLabels = {
  edited: "edited",
  commented: "commented on",
  deleted: "deleted from",
  formatted: "formatted",
  uploaded: "uploaded",
  submitted: "submitted", // File submission
};

export default function TeacherLiveMonitor() {
  const navigate = useNavigate();
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");

  const projects = ["All Projects"];
  const students = ["All Students"];
  const timeRanges = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
  ];

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/teacher/live-activity
    // fetch('http://localhost:8000/api/teacher/live-activity')
    //   .then(res => res.json())
    //   .then(data => { setActivityFeed(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, [projectFilter, studentFilter, timeFilter]);

  // Filter activity based on selections
  const filteredActivity = activityFeed.filter((activity) => {
    if (projectFilter !== "all" && activity.projectName !== projectFilter) return false;
    if (studentFilter !== "all" && activity.studentName !== studentFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Live Activity</h1>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 mb-6">
          {/* Project Filter */}
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="appearance-none bg-white/10 border border-white/10 text-slate-300 text-sm px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {projects.map((project, idx) => (
                <option key={project} value={idx === 0 ? "all" : project} className="bg-slate-800 text-white">
                  {project}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Student Filter */}
          <div className="relative">
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="appearance-none bg-white/10 border border-white/10 text-slate-300 text-sm px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {students.map((student, idx) => (
                <option key={student} value={idx === 0 ? "all" : student} className="bg-slate-800 text-white">
                  {student}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Time Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-white/10 border border-white/10 text-slate-300 text-sm px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-slate-800 text-white">
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Activity Feed */}
        {filteredActivity.length > 0 ? (
          <div className="space-y-3">
            {filteredActivity.map((activity, index) => {
              const ActionIcon = actionIcons[activity.action as keyof typeof actionIcons] || FileText;
              const actionLabel = actionLabels[activity.action as keyof typeof actionLabels] || activity.action;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:bg-white/[0.06] transition-colors flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 ${activity.studentColor} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {activity.studentAvatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="text-white font-medium">{activity.studentName}</span>
                      <span className="text-slate-400"> {actionLabel} </span>
                      <span className="text-blue-400">{activity.fileName}</span>
                      {activity.action === "submitted" && (
                        <span className="text-slate-400"> to </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 text-xs">{activity.projectName}</span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-slate-600 text-xs">{activity.timestamp}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {activity.googleFileUrl && (
                      <button
                        onClick={() => window.open(activity.googleFileUrl, "_blank")}
                        className="flex items-center gap-1.5 text-slate-400 text-sm hover:text-white transition-colors whitespace-nowrap"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/teacher/live-replay/${activity.fileId}`)}
                      className="flex items-center gap-1.5 text-blue-400 text-sm hover:text-blue-300 transition-colors whitespace-nowrap"
                    >
                      <span>View Replay</span>
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent activity</p>
            <p className="text-slate-500 text-sm mt-1">Activity will appear here when students start working on their projects</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
