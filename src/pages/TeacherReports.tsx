import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Eye,
  Users,
  BarChart3,
  AlertTriangle,
  FileCheck,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

// TODO: Connect to POST http://localhost:8000/api/reports/generate

interface Report {
  id: string;
  name: string;
  createdAt: string;
}

const reportTemplates = [
  { id: 1, icon: FileText, color: "text-blue-400", bgColor: "bg-blue-500", title: "Individual Student Report", description: "Detailed contribution report for a single student with timeline and grade recommendation." },
  { id: 2, icon: Users, color: "text-green-400", bgColor: "bg-green-500", title: "Team Comparison Report", description: "Compare all team members' contributions side-by-side for a specific project." },
  { id: 3, icon: BarChart3, color: "text-purple-400", bgColor: "bg-purple-500", title: "Class Analytics Report", description: "Overview of all projects in a course with aggregate statistics and trends." },
  { id: 4, icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500", title: "At-Risk Students Report", description: "List of students with low contributions, flagged issues, or poor attendance." },
  { id: 5, icon: FileCheck, color: "text-yellow-400", bgColor: "bg-yellow-500", title: "AI/Plagiarism Report", description: "All flagged AI-generated content and plagiarism instances across projects." },
  { id: 6, icon: Calendar, color: "text-indigo-400", bgColor: "bg-indigo-500", title: "Semester Summary", description: "Complete overview of all activity for the entire semester with export option." },
];

export default function TeacherReports() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/reports
    // fetch('http://localhost:8000/api/reports')
    //   .then(res => res.json())
    //   .then(data => { setRecentReports(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleGenerateReport = (title: string) => {
    // TODO: POST http://localhost:8000/api/reports/generate
    toast.success(`Generating ${title}...`);
  };

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
        <h1 className="text-3xl font-bold text-white mb-8">Reports</h1>

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTemplates.map((template) => (
            <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="bg-white/5 rounded-xl border border-white/10 p-6 cursor-pointer transition-all hover:bg-white/10">
              <template.icon className={`w-12 h-12 ${template.color} mb-4`} />
              <h3 className="font-bold text-white mb-2">{template.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{template.description}</p>
              <Button onClick={() => handleGenerateReport(template.title)} className={`w-full ${template.bgColor} hover:opacity-90`}>Generate Report</Button>
            </motion.div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Reports</h2>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-semibold text-white">{report.name}</p>
                      <p className="text-xs text-slate-500">Generated {formatRelativeTime(report.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/10 text-slate-300 hover:bg-white/15">
                      <Eye className="w-4 h-4 mr-1" />View
                    </Button>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                      <Download className="w-4 h-4 mr-1" />Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">0 reports generated</p>
              <p className="text-slate-500 text-sm mt-1">Generate your first report once you have project data</p>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
