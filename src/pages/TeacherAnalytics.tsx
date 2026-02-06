import { useState } from "react";
import { motion } from "framer-motion";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

const contributionData = [65, 72, 58, 80, 75, 68, 85];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const courseData = [
  { course: "CS 101", projects: 8, students: 64, avgScore: 82, completionRate: 87, atRisk: 2 },
  { course: "Business 201", projects: 6, students: 48, avgScore: 74, completionRate: 78, atRisk: 3 },
  { course: "Biology 150", projects: 10, students: 74, avgScore: 79, completionRate: 92, atRisk: 0 },
];

export default function TeacherAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <TeacherLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Analytics Dashboard</h1>

        {/* Time Range */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-2 mb-8 inline-flex gap-2">
          {[{ label: "Last 7 Days", value: "7d" }, { label: "Last 30 Days", value: "30d" }, { label: "This Semester", value: "semester" }, { label: "All Time", value: "all" }].map((range) => (
            <button key={range.value} onClick={() => setTimeRange(range.value)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range.value ? "bg-blue-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>{range.label}</button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-blue-100 text-sm mb-2">Total Contributions</p>
            <p className="text-4xl font-bold mb-2">24,589</p>
            <p className="text-blue-100 text-sm">+15% from last period</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-green-100 text-sm mb-2">Active Students</p>
            <p className="text-4xl font-bold mb-2">186</p>
            <p className="text-green-100 text-sm">98% engagement rate</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-purple-100 text-sm mb-2">Avg. Contribution Score</p>
            <p className="text-4xl font-bold mb-2">78</p>
            <p className="text-purple-100 text-sm">+3 points from last period</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <p className="text-red-100 text-sm mb-2">Free-riders Detected</p>
            <p className="text-4xl font-bold mb-2">12</p>
            <p className="text-red-100 text-sm">6% of total students</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contributions Over Time</h2>
            <div className="h-64 flex items-end gap-2">
              {contributionData.map((height, idx) => (
                <div key={idx} className="flex-1 bg-blue-500 rounded-t hover:bg-blue-400 transition-colors cursor-pointer" style={{ height: `${height}%` }} title={`${height}%`} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              {days.map((day) => (<span key={day}>{day}</span>))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Score Distribution</h2>
            <div className="space-y-3">
              {[{ label: "90-100 (Excellent)", value: 24, color: "bg-green-500" }, { label: "70-89 (Good)", value: 45, color: "bg-blue-500" }, { label: "50-69 (Fair)", value: 22, color: "bg-yellow-500" }, { label: "0-49 (Poor)", value: 9, color: "bg-red-500" }].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Comparison */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Course Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-slate-400">Course</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-400">Projects</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-400">Students</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-400">Avg Score</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-400">Completion Rate</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-400">At-Risk Projects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courseData.map((row) => (
                  <tr key={row.course} className="hover:bg-white/5">
                    <td className="p-3 text-white">{row.course}</td>
                    <td className="p-3 text-center text-slate-300">{row.projects}</td>
                    <td className="p-3 text-center text-slate-300">{row.students}</td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${row.avgScore >= 80 ? "text-green-400" : row.avgScore >= 70 ? "text-yellow-400" : "text-red-400"}`}>{row.avgScore}</span>
                    </td>
                    <td className="p-3 text-center text-slate-300">{row.completionRate}%</td>
                    <td className="p-3 text-center text-slate-300">{row.atRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
