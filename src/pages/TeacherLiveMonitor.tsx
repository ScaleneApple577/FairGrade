import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Play, Filter, ChevronDown, MessageSquare, Trash2, Type, Upload, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

// Mock activity feed data
const mockActivityFeed = [
  { id: "1", studentName: "Alice Johnson", studentAvatar: "A", studentColor: "bg-blue-500", action: "edited", fileName: "Research_Report.docx", fileId: "file-001", projectName: "CS 101 Final Project", timestamp: "2 minutes ago", detail: "Added 47 words to Section 3" },
  { id: "2", studentName: "Bob Smith", studentAvatar: "B", studentColor: "bg-green-500", action: "commented", fileName: "Research_Report.docx", fileId: "file-001", projectName: "CS 101 Final Project", timestamp: "5 minutes ago", detail: "Left comment on Introduction paragraph" },
  { id: "3", studentName: "Carol Williams", studentAvatar: "C", studentColor: "bg-purple-500", action: "formatted", fileName: "Budget_Analysis.xlsx", fileId: "file-002", projectName: "Business 201", timestamp: "8 minutes ago", detail: "Applied heading style to row 1" },
  { id: "4", studentName: "Dave Wilson", studentAvatar: "D", studentColor: "bg-orange-500", action: "deleted", fileName: "Presentation_Deck.pptx", fileId: "file-003", projectName: "CS 101 Final Project", timestamp: "12 minutes ago", detail: "Removed slide 5" },
  { id: "5", studentName: "Eve Davis", studentAvatar: "E", studentColor: "bg-pink-500", action: "edited", fileName: "Marketing_Strategy.docx", fileId: "file-004", projectName: "Marketing 301", timestamp: "15 minutes ago", detail: "Added 89 words to Conclusion" },
  { id: "6", studentName: "Frank Chen", studentAvatar: "F", studentColor: "bg-cyan-500", action: "uploaded", fileName: "Team_Photo.png", fileId: "file-005", projectName: "Business 201", timestamp: "20 minutes ago", detail: "Uploaded new image asset" },
  { id: "7", studentName: "Alice Johnson", studentAvatar: "A", studentColor: "bg-blue-500", action: "edited", fileName: "Research_Report.docx", fileId: "file-001", projectName: "CS 101 Final Project", timestamp: "25 minutes ago", detail: "Revised paragraph 4 in Section 2" },
  { id: "8", studentName: "Grace Lee", studentAvatar: "G", studentColor: "bg-indigo-500", action: "commented", fileName: "Budget_Analysis.xlsx", fileId: "file-002", projectName: "Business 201", timestamp: "32 minutes ago", detail: "Added review comment on cell B12" },
  { id: "9", studentName: "Bob Smith", studentAvatar: "B", studentColor: "bg-green-500", action: "formatted", fileName: "Research_Report.docx", fileId: "file-001", projectName: "CS 101 Final Project", timestamp: "45 minutes ago", detail: "Applied bold formatting to headings" },
  { id: "10", studentName: "Carol Williams", studentAvatar: "C", studentColor: "bg-purple-500", action: "edited", fileName: "Presentation_Deck.pptx", fileId: "file-003", projectName: "CS 101 Final Project", timestamp: "1 hour ago", detail: "Added speaker notes to slide 3" },
  { id: "11", studentName: "Dave Wilson", studentAvatar: "D", studentColor: "bg-orange-500", action: "edited", fileName: "Budget_Analysis.xlsx", fileId: "file-002", projectName: "Business 201", timestamp: "1 hour ago", detail: "Updated formula in column D" },
  { id: "12", studentName: "Eve Davis", studentAvatar: "E", studentColor: "bg-pink-500", action: "commented", fileName: "Marketing_Strategy.docx", fileId: "file-004", projectName: "Marketing 301", timestamp: "2 hours ago", detail: "Suggested revision to opening paragraph" },
  { id: "13", studentName: "Frank Chen", studentAvatar: "F", studentColor: "bg-cyan-500", action: "edited", fileName: "Team_Charter.docx", fileId: "file-006", projectName: "Business 201", timestamp: "2 hours ago", detail: "Added team roles section" },
  { id: "14", studentName: "Alice Johnson", studentAvatar: "A", studentColor: "bg-blue-500", action: "deleted", fileName: "Research_Report.docx", fileId: "file-001", projectName: "CS 101 Final Project", timestamp: "3 hours ago", detail: "Removed outdated references" },
  { id: "15", studentName: "Grace Lee", studentAvatar: "G", studentColor: "bg-indigo-500", action: "formatted", fileName: "Presentation_Deck.pptx", fileId: "file-003", projectName: "CS 101 Final Project", timestamp: "4 hours ago", detail: "Applied consistent slide theme" },
  { id: "16", studentName: "Bob Smith", studentAvatar: "B", studentColor: "bg-green-500", action: "uploaded", fileName: "Data_Chart.png", fileId: "file-007", projectName: "CS 101 Final Project", timestamp: "5 hours ago", detail: "Uploaded chart visualization" },
  { id: "17", studentName: "Carol Williams", studentAvatar: "C", studentColor: "bg-purple-500", action: "edited", fileName: "Budget_Analysis.xlsx", fileId: "file-002", projectName: "Business 201", timestamp: "6 hours ago", detail: "Added new budget category" },
  { id: "18", studentName: "Dave Wilson", studentAvatar: "D", studentColor: "bg-orange-500", action: "commented", fileName: "Team_Charter.docx", fileId: "file-006", projectName: "Business 201", timestamp: "8 hours ago", detail: "Flagged meeting schedule conflict" },
];

const actionIcons = {
  edited: FileText,
  commented: MessageSquare,
  deleted: Trash2,
  formatted: Palette,
  uploaded: Upload,
};

const actionLabels = {
  edited: "edited",
  commented: "commented on",
  deleted: "deleted from",
  formatted: "formatted",
  uploaded: "uploaded",
};

// TODO: Connect to GET /api/teacher/live-activity — returns recent activity feed with filters

export default function TeacherLiveMonitor() {
  const navigate = useNavigate();
  const [projectFilter, setProjectFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");

  const projects = ["All Projects", "CS 101 Final Project", "Business 201", "Marketing 301"];
  const students = ["All Students", "Alice Johnson", "Bob Smith", "Carol Williams", "Dave Wilson", "Eve Davis", "Frank Chen", "Grace Lee"];
  const timeRanges = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
  ];

  // Filter activity based on selections
  const filteredActivity = mockActivityFeed.filter((activity) => {
    if (projectFilter !== "all" && activity.projectName !== projectFilter) return false;
    if (studentFilter !== "all" && activity.studentName !== studentFilter) return false;
    return true;
  });

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
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-xs">{activity.projectName}</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-slate-600 text-xs">{activity.timestamp}</span>
                  </div>
                </div>

                {/* View Replay Button */}
                <button
                  onClick={() => navigate(`/teacher/live-replay/${activity.fileId}`)}
                  className="flex items-center gap-1.5 text-blue-400 text-sm hover:text-blue-300 transition-colors whitespace-nowrap"
                >
                  <span>View Replay</span>
                  <Play className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {filteredActivity.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No activity matches your filters</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
