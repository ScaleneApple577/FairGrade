import { motion } from "framer-motion";
import { Edit, Clock, TrendingUp } from "lucide-react";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

const activeStudents = [
  { id: "1", name: "Alice Johnson", avatar: "A", avatarColor: "bg-blue-500", project: "CS 101 Final", activeFor: "32 min", currentFile: "Report.docx", lastEdit: "Just now", wordsToday: 450 },
  { id: "2", name: "Bob Smith", avatar: "B", avatarColor: "bg-green-500", project: "Business 201", activeFor: "15 min", currentFile: "Analysis.xlsx", lastEdit: "2 min ago", wordsToday: 280 },
  { id: "3", name: "Carol Williams", avatar: "C", avatarColor: "bg-purple-500", project: "Biology 150", activeFor: "45 min", currentFile: "Lab Notes.docx", lastEdit: "5 min ago", wordsToday: 620 },
  { id: "4", name: "Dave Wilson", avatar: "D", avatarColor: "bg-orange-500", project: "CS 101 Final", activeFor: "8 min", currentFile: "Code.py", lastEdit: "1 min ago", wordsToday: 150 },
  { id: "5", name: "Eve Davis", avatar: "E", avatarColor: "bg-pink-500", project: "English 102", activeFor: "22 min", currentFile: "Essay.docx", lastEdit: "3 min ago", wordsToday: 380 },
  { id: "6", name: "Frank Chen", avatar: "F", avatarColor: "bg-cyan-500", project: "Business 201", activeFor: "12 min", currentFile: "Slides.pptx", lastEdit: "Just now", wordsToday: 95 },
];

const activityStream = [
  { id: "1", userName: "Alice Johnson", userAvatar: "A", userColor: "bg-blue-500", action: "added 47 characters to Section 3", time: "Just now" },
  { id: "2", userName: "Frank Chen", userAvatar: "F", userColor: "bg-cyan-500", action: "created new slide #8", time: "1 min ago" },
  { id: "3", userName: "Dave Wilson", userAvatar: "D", userColor: "bg-orange-500", action: "committed changes to main branch", time: "2 min ago" },
  { id: "4", userName: "Eve Davis", userAvatar: "E", userColor: "bg-pink-500", action: "added 85 words to conclusion", time: "3 min ago" },
  { id: "5", userName: "Carol Williams", userAvatar: "C", userColor: "bg-purple-500", action: "uploaded new image to report", time: "5 min ago" },
  { id: "6", userName: "Bob Smith", userAvatar: "B", userColor: "bg-green-500", action: "updated formula in cell B12", time: "8 min ago" },
  { id: "7", userName: "Alice Johnson", userAvatar: "A", userColor: "bg-blue-500", action: "left comment on paragraph 2", time: "12 min ago" },
  { id: "8", userName: "Eve Davis", userAvatar: "E", userColor: "bg-pink-500", action: "completed task 'Research sources'", time: "15 min ago" },
];

export default function TeacherLiveMonitor() {
  return (
    <TeacherLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Monitoring</h1>
            <p className="text-slate-400 mt-1">See who's working right now</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium border border-green-500/30">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span>{activeStudents.length} students active</span>
          </div>
        </div>

        {/* Active Now Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activeStudents.map((student) => (
            <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 rounded-xl border-2 border-green-500/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 ${student.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>{student.avatar}</div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#111827] rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.project}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">Active {student.activeFor}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Edit className="w-4 h-4 text-blue-400" />
                  <span>Editing: {student.currentFile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Last edit: {student.lastEdit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>+{student.wordsToday} words today</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Stream */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Activity Stream</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activityStream.map((activity) => (
              <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                <div className={`w-8 h-8 ${activity.userColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{activity.userAvatar}</div>
                <p className="text-sm flex-1 text-slate-300">
                  <strong className="text-white">{activity.userName}</strong> {activity.action}
                </p>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}