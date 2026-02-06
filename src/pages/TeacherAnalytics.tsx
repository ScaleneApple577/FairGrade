import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Loader2 } from "lucide-react";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

// TODO: Connect to GET http://localhost:8000/api/teacher/analytics

interface AnalyticsData {
  totalContributions: number;
  activeStudents: number;
  avgContributionScore: number;
  freeRidersDetected: number;
  contributionData: number[];
  scoreDistribution: { label: string; value: number; color: string }[];
  courseData: { course: string; projects: number; students: number; avgScore: number; completionRate: number; atRisk: number }[];
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TeacherAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/teacher/analytics
    // fetch('http://localhost:8000/api/teacher/analytics')
    //   .then(res => res.json())
    //   .then(data => { setData(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, [timeRange]);

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
            <p className="text-4xl font-bold mb-2">{data?.totalContributions ?? 0}</p>
            <p className="text-blue-100 text-sm">No previous data</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-green-100 text-sm mb-2">Active Students</p>
            <p className="text-4xl font-bold mb-2">{data?.activeStudents ?? 0}</p>
            <p className="text-green-100 text-sm">No engagement data</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-purple-100 text-sm mb-2">Avg. Contribution Score</p>
            <p className="text-4xl font-bold mb-2">{data?.avgContributionScore ?? "—"}</p>
            <p className="text-purple-100 text-sm">No score data</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <p className="text-red-100 text-sm mb-2">Free-riders Detected</p>
            <p className="text-4xl font-bold mb-2">{data?.freeRidersDetected ?? 0}</p>
            <p className="text-red-100 text-sm">No flags</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contributions Over Time</h2>
            {data?.contributionData && data.contributionData.length > 0 ? (
              <div className="h-64 flex items-end gap-2">
                {data.contributionData.map((height, idx) => (
                  <div key={idx} className="flex-1 bg-blue-500 rounded-t hover:bg-blue-400 transition-colors cursor-pointer" style={{ height: `${height}%` }} title={`${height}%`} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No data available</p>
                  <p className="text-slate-500 text-sm">Start tracking projects to see contribution trends</p>
                </div>
              </div>
            )}
            {data?.contributionData && data.contributionData.length > 0 && (
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                {days.map((day) => (<span key={day}>{day}</span>))}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Score Distribution</h2>
            {data?.scoreDistribution && data.scoreDistribution.length > 0 ? (
              <div className="space-y-3">
                {data.scoreDistribution.map((item) => (
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
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No data available</p>
                  <p className="text-slate-500 text-sm">Score distribution will appear when students have scores</p>
                </div>
              </div>
            )}
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
                {data?.courseData && data.courseData.length > 0 ? (
                  data.courseData.map((row) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <p className="text-slate-400">No course data available</p>
                      <p className="text-slate-500 text-sm mt-1">Create projects to see course comparisons</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
