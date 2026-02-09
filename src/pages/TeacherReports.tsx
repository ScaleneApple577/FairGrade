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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { api } from "@/lib/api";
import { runAICheck, runPlagiarismCheck, getAnalysisFlags, type AnalysisFlag } from "@/lib/analysisUtils";

interface Report {
  id: string;
  name: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

const reportTemplates = [
  { id: 1, icon: FileText, color: "text-blue-400", bgColor: "bg-blue-500", title: "Individual Student Report", description: "Detailed contribution report for a single student with timeline and grade recommendation." },
  { id: 2, icon: Users, color: "text-green-400", bgColor: "bg-green-500", title: "Team Comparison Report", description: "Compare all team members' contributions side-by-side for a specific project." },
  { id: 3, icon: BarChart3, color: "text-purple-400", bgColor: "bg-purple-500", title: "Class Analytics Report", description: "Overview of all projects in a course with aggregate statistics and trends." },
  { id: 4, icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500", title: "At-Risk Students Report", description: "List of students with low contributions, flagged issues, or poor attendance." },
  { id: 5, icon: FileCheck, color: "text-yellow-400", bgColor: "bg-yellow-500", title: "AI/Plagiarism Report", description: "All flagged AI-generated content and plagiarism instances across projects.", isAIPlagiarism: true },
  { id: 6, icon: Calendar, color: "text-indigo-400", bgColor: "bg-indigo-500", title: "Semester Summary", description: "Complete overview of all activity for the entire semester with export option." },
];

export default function TeacherReports() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI/Plagiarism modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedDetectionTypes, setSelectedDetectionTypes] = useState<string[]>(["ai", "plagiarism"]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisFlags, setAnalysisFlags] = useState<AnalysisFlag[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch projects for the dropdown
        const projectsData = await api.get<Project[]>("/api/projects/projects");
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
      // TODO: Connect to GET /api/reports for recent reports
      setIsLoading(false);
    };
    fetchData();
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

  const handleGenerateReport = (template: typeof reportTemplates[0]) => {
    if (template.isAIPlagiarism) {
      setShowAIModal(true);
      return;
    }
    // TODO: Implement other report types
    toast.success(`Generating ${template.title}...`);
  };

  const handleRunAnalysis = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    setIsGeneratingReport(true);
    setAnalysisFlags([]);

    try {
      const projectIdNum = parseInt(selectedProjectId, 10);
      
      // Run selected checks
      if (selectedDetectionTypes.includes("ai")) {
        await runAICheck(projectIdNum);
        toast.success("AI check complete!");
      }
      if (selectedDetectionTypes.includes("plagiarism")) {
        await runPlagiarismCheck(projectIdNum);
        toast.success("Plagiarism check complete!");
      }

      // Fetch flags after analysis
      const flags = await getAnalysisFlags(projectIdNum);
      setAnalysisFlags(flags);
      
      if (flags.length === 0) {
        toast.info("No issues found!");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleDetectionType = (type: string) => {
    setSelectedDetectionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
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
              <Button onClick={() => handleGenerateReport(template)} className={`w-full ${template.bgColor} hover:opacity-90`}>Generate Report</Button>
            </motion.div>
          ))}
        </div>

        {/* AI/Plagiarism Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">AI/Plagiarism Report</h2>
                <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Project Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Detection Types */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Detection Types</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleDetectionType("ai")}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      selectedDetectionTypes.includes("ai")
                        ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    🤖 AI Content
                  </button>
                  <button
                    onClick={() => toggleDetectionType("plagiarism")}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      selectedDetectionTypes.includes("plagiarism")
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    📋 Plagiarism
                  </button>
                </div>
              </div>

              {/* Run Analysis Button */}
              <Button
                onClick={handleRunAnalysis}
                disabled={isGeneratingReport || !selectedProjectId || selectedDetectionTypes.length === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 py-3"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  "Run Analysis"
                )}
              </Button>

              {/* Results */}
              {analysisFlags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Found {analysisFlags.length} flag{analysisFlags.length !== 1 ? "s" : ""}
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {analysisFlags.map((flag, i) => (
                      <div key={flag.id || i} className={`p-3 rounded-lg text-sm ${
                        flag.type === "ai" ? "bg-yellow-500/10 text-yellow-400" :
                        flag.type === "plagiarism" ? "bg-red-500/10 text-red-400" :
                        "bg-orange-500/10 text-orange-400"
                      }`}>
                        <span className="font-medium">
                          {flag.type === "ai" ? "🤖" : flag.type === "plagiarism" ? "📋" : "⚠️"}
                        </span>{" "}
                        {flag.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

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
