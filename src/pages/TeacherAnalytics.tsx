import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Loader2 } from "lucide-react";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

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
    setIsLoading(false);
  }, [timeRange]);

  if (isLoading) {
    return (<TeacherLayout><div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div></TeacherLayout>);
  }

  const overviewCards = [
    { label: "Total Contributions", value: data?.totalContributions ?? 0, color: "border-l-blue-400", bg: "bg-blue-50" },
    { label: "Active Students", value: data?.activeStudents ?? 0, color: "border-l-emerald-400", bg: "bg-emerald-50" },
    { label: "Avg. Score", value: data?.avgContributionScore ?? "—", color: "border-l-purple-400", bg: "bg-purple-50" },
    { label: "Free-riders", value: data?.freeRidersDetected ?? 0, color: "border-l-red-400", bg: "bg-red-50" },
  ];

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-8">
        {/* Time Range */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-8 inline-flex gap-1 shadow-sm">
          {[{ label: "Last 7 Days", value: "7d" }, { label: "Last 30 Days", value: "30d" }, { label: "This Semester", value: "semester" }, { label: "All Time", value: "all" }].map((range) => (
            <button key={range.value} onClick={() => setTimeRange(range.value)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${timeRange === range.value ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>{range.label}</button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {overviewCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-xl p-5 border-l-[3px] ${card.color} shadow-sm`}>
              <p className="text-gray-500 text-xs mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Contributions Over Time</h2>
            {data?.contributionData && data.contributionData.length > 0 ? (
              <div className="h-64 flex items-end gap-2">
                {data.contributionData.map((height, idx) => (
                  <div key={idx} className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer" style={{ height: `${height}%` }} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No data available</p>
                  <p className="text-gray-400 text-xs mt-1">Start tracking projects to see trends</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Score Distribution</h2>
            {data?.scoreDistribution && data.scoreDistribution.length > 0 ? (
              <div className="space-y-3">
                {data.scoreDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Comparison */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Course Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Course</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Projects</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Students</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Avg Score</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">Completion</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-500">At-Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.courseData && data.courseData.length > 0 ? (
                  data.courseData.map((row) => (
                    <tr key={row.course} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 text-gray-900 text-sm">{row.course}</td>
                      <td className="p-3 text-center text-gray-500 text-sm">{row.projects}</td>
                      <td className="p-3 text-center text-gray-500 text-sm">{row.students}</td>
                      <td className="p-3 text-center"><span className={`font-semibold ${row.avgScore >= 80 ? "text-emerald-600" : row.avgScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>{row.avgScore}</span></td>
                      <td className="p-3 text-center text-gray-500 text-sm">{row.completionRate}%</td>
                      <td className="p-3 text-center text-gray-500 text-sm">{row.atRisk}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="p-12 text-center"><p className="text-gray-400 text-sm">No course data available</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </TeacherLayout>
  );
}
