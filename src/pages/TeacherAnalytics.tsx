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

const statGradients = [
  "bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]",
  "bg-gradient-to-br from-[#065f46] to-[#10b981]",
  "bg-gradient-to-br from-[#581c87] to-[#a855f7]",
  "bg-gradient-to-br from-[#9d174d] to-[#ec4899]",
];

export default function TeacherAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [timeRange]);

  if (isLoading) {
    return (<TeacherLayout><div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div></TeacherLayout>);
  }

  const overviewCards = [
    { label: "Total Contributions", value: data?.totalContributions ?? 0 },
    { label: "Active Students", value: data?.activeStudents ?? 0 },
    { label: "Avg. Score", value: data?.avgContributionScore ?? "—" },
    { label: "Free-riders", value: data?.freeRidersDetected ?? 0 },
  ];

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-8">
        {/* Time Range */}
        <div className="bg-white/[0.06] rounded-2xl border border-white/[0.06] p-1 mb-8 inline-flex gap-1">
          {[{ label: "Last 7 Days", value: "7d" }, { label: "Last 30 Days", value: "30d" }, { label: "This Semester", value: "semester" }, { label: "All Time", value: "all" }].map((range) => (
            <button key={range.value} onClick={() => setTimeRange(range.value)} className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${timeRange === range.value ? "btn-gradient shadow-lg" : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"}`}>{range.label}</button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {overviewCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`${statGradients[i]} rounded-2xl p-6 card-hover`}>
              <p className="text-white/70 text-xs mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card">
            <h2 className="text-sm font-semibold text-white mb-4">Contributions Over Time</h2>
            {data?.contributionData && data.contributionData.length > 0 ? (
              <div className="h-64 flex items-end gap-2">
                {data.contributionData.map((height, idx) => (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-colors cursor-pointer" style={{ height: `${height}%` }} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-white/15 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No data available</p>
                  <p className="text-white/20 text-xs mt-1">Start tracking projects to see trends</p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h2 className="text-sm font-semibold text-white mb-4">Score Distribution</h2>
            {data?.scoreDistribution && data.scoreDistribution.length > 0 ? (
              <div className="space-y-3">
                {data.scoreDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{item.label}</span>
                      <span className="font-semibold text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-white/15 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Comparison */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-white mb-4">Course Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-white/40">Course</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Projects</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Students</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Avg Score</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">Completion</th>
                  <th className="text-center p-3 text-xs font-medium text-white/40">At-Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data?.courseData && data.courseData.length > 0 ? (
                  data.courseData.map((row) => (
                    <tr key={row.course} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 text-white text-sm">{row.course}</td>
                      <td className="p-3 text-center text-white/50 text-sm">{row.projects}</td>
                      <td className="p-3 text-center text-white/50 text-sm">{row.students}</td>
                      <td className="p-3 text-center"><span className={`font-semibold ${row.avgScore >= 80 ? "text-emerald-400" : row.avgScore >= 70 ? "text-yellow-400" : "text-red-400"}`}>{row.avgScore}</span></td>
                      <td className="p-3 text-center text-white/50 text-sm">{row.completionRate}%</td>
                      <td className="p-3 text-center text-white/50 text-sm">{row.atRisk}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="p-12 text-center"><p className="text-white/30 text-sm">No course data available</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </TeacherLayout>
  );
}
