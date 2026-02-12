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
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { api } from "@/lib/api";
import { runAICheck, runPlagiarismCheck, getAnalysisFlags, type AnalysisFlag } from "@/lib/analysisUtils";
import {
  getContributionReport,
  getStudentReport,
  exportReport,
  filterAtRiskStudents,
  type ContributionReport,
  type StudentReport,
  type FrontendReportType,
  REPORT_CONFIGS,
} from "@/lib/reportUtils";

interface Report {
  id: string;
  name: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

type ReportTemplateKey = "individual_student" | "team_comparison" | "class_analytics" | "at_risk_students" | "ai_plagiarism" | "semester_summary";

const reportTemplates: {
  id: number;
  key: ReportTemplateKey;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  title: string;
  description: string;
}[] = [
  { id: 1, key: "individual_student", icon: User, color: "text-blue-400", bgColor: "bg-blue-500", title: "Individual Student Report", description: "Detailed contribution report for a single student with timeline and grade recommendation." },
  { id: 2, key: "team_comparison", icon: Users, color: "text-green-400", bgColor: "bg-green-500", title: "Team Comparison Report", description: "Compare all team members' contributions side-by-side for a specific project." },
  { id: 3, key: "class_analytics", icon: BarChart3, color: "text-purple-400", bgColor: "bg-purple-500", title: "Class Analytics Report", description: "Overview of all projects in a course with aggregate statistics and trends." },
  { id: 4, key: "at_risk_students", icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500", title: "At-Risk Students Report", description: "List of students with low contributions, flagged issues, or poor attendance." },
  { id: 5, key: "ai_plagiarism", icon: FileCheck, color: "text-yellow-400", bgColor: "bg-yellow-500", title: "AI/Plagiarism Report", description: "All flagged AI-generated content and plagiarism instances across projects." },
  { id: 6, key: "semester_summary", icon: Calendar, color: "text-indigo-400", bgColor: "bg-indigo-500", title: "Semester Summary", description: "Complete overview of all activity for the entire semester with export option." },
];

export default function TeacherReports() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<ReportTemplateKey | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Results state
  const [contributionReport, setContributionReport] = useState<ContributionReport | null>(null);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [analysisFlags, setAnalysisFlags] = useState<AnalysisFlag[]>([]);
  const [selectedDetectionTypes, setSelectedDetectionTypes] = useState<string[]>(["ai", "plagiarism"]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch projects for dropdowns
        const projectsData = await api.get<Project[]>("/api/projects/projects");
        setProjects(projectsData || []);
        
        // TODO: Need endpoint to list all students for the teacher
        // GET /api/users?role=student or similar
        // For now, students will need to be selected from project members
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
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

  const openModal = (key: ReportTemplateKey) => {
    setActiveModal(key);
    setContributionReport(null);
    setStudentReport(null);
    setAnalysisFlags([]);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedProjectId("");
    setSelectedStudentId("");
    setSelectedProjectIds([]);
    setContributionReport(null);
    setStudentReport(null);
    setAnalysisFlags([]);
  };

  // Individual Student Report → GET /api/reports/student/{user_id}
  const handleGenerateStudentReport = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    setIsGeneratingReport(true);
    try {
      const report = await getStudentReport(selectedStudentId);
      setStudentReport(report);
      toast.success("Student report generated!");
    } catch (error) {
      console.error("Failed to generate student report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Team Comparison, Class Analytics, At-Risk → GET /api/reports/contribution/{project_id}
  const handleGenerateContributionReport = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    setIsGeneratingReport(true);
    try {
      const report = await getContributionReport(selectedProjectId);
      setContributionReport(report);
      toast.success("Report generated!");
    } catch (error) {
      console.error("Failed to generate contribution report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // AI/Plagiarism → Uses analysis endpoints
  const handleRunAnalysis = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    setIsGeneratingReport(true);
    setAnalysisFlags([]);
    try {
      if (selectedDetectionTypes.includes("ai")) {
        await runAICheck(selectedProjectId);
      }
      if (selectedDetectionTypes.includes("plagiarism")) {
        await runPlagiarismCheck(selectedProjectId);
      }
      const flags = await getAnalysisFlags(selectedProjectId);
      setAnalysisFlags(flags);
      if (flags.length === 0) {
        toast.info("No issues found!");
      } else {
        toast.success("Analysis complete!");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Semester Summary → Multiple contribution reports
  const handleGenerateSemesterSummary = async () => {
    if (selectedProjectIds.length === 0) {
      toast.error("Please select at least one project");
      return;
    }
    setIsGeneratingReport(true);
    try {
      // Fetch all selected project reports
      const reports = await Promise.all(
        selectedProjectIds.map((pid) => getContributionReport(pid))
      );
      // For now, just show the first one — could aggregate
      if (reports.length > 0) {
        setContributionReport(reports[0]);
      }
      toast.success(`Generated summary for ${reports.length} project(s)`);
    } catch (error) {
      console.error("Failed to generate semester summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Export report
  const handleExportReport = async () => {
    try {
      if (activeModal === "individual_student" && selectedStudentId) {
        await exportReport("student", undefined, selectedStudentId);
        toast.success("Export started!");
      } else if (selectedProjectId) {
        await exportReport("contribution", selectedProjectId);
        toast.success("Export started!");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    }
  };

  const toggleDetectionType = (type: string) => {
    setSelectedDetectionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((p) => p !== projectId) : [...prev, projectId]
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

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTemplates.map((template) => (
            <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="bg-white/5 rounded-xl border border-white/10 p-6 cursor-pointer transition-all hover:bg-white/10">
              <template.icon className={`w-12 h-12 ${template.color} mb-4`} />
              <h3 className="font-bold text-white mb-2">{template.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{template.description}</p>
              <Button onClick={() => openModal(template.key)} className={`w-full ${template.bgColor} hover:opacity-90`}>Generate Report</Button>
            </motion.div>
          ))}
        </div>

        {/* Report Modal */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {activeModal === "individual_student" && "Individual Student Report"}
                  {activeModal === "team_comparison" && "Team Comparison Report"}
                  {activeModal === "class_analytics" && "Class Analytics Report"}
                  {activeModal === "at_risk_students" && "At-Risk Students Report"}
                  {activeModal === "ai_plagiarism" && "AI/Plagiarism Report"}
                  {activeModal === "semester_summary" && "Semester Summary"}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Individual Student Report — needs student selection */}
              {activeModal === "individual_student" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Student</label>
                    <input
                      type="text"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      placeholder="Enter student user ID..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Note: Student list endpoint needed (GET /api/users?role=student)
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateStudentReport}
                    disabled={isGeneratingReport || !selectedStudentId}
                    className="w-full bg-blue-500 hover:bg-blue-600 py-3"
                  >
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Report"}
                  </Button>
                  {studentReport && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Student Report</h3>
                      <pre className="bg-white/5 rounded-lg p-3 text-xs text-slate-300 overflow-auto max-h-48">
                        {JSON.stringify(studentReport, null, 2)}
                      </pre>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-green-500 hover:bg-green-600">
                        <Download className="w-4 h-4 mr-2" />Export Report
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Team Comparison, Class Analytics, At-Risk — needs project selection */}
              {(activeModal === "team_comparison" || activeModal === "class_analytics" || activeModal === "at_risk_students") && (
                <>
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
                  <Button
                    onClick={handleGenerateContributionReport}
                    disabled={isGeneratingReport || !selectedProjectId}
                    className="w-full bg-blue-500 hover:bg-blue-600 py-3"
                  >
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Report"}
                  </Button>
                  {contributionReport && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">
                        {activeModal === "at_risk_students" 
                          ? `At-Risk Students (${filterAtRiskStudents(contributionReport).length})`
                          : `Students (${contributionReport.students?.length || 0})`
                        }
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(activeModal === "at_risk_students" 
                          ? filterAtRiskStudents(contributionReport)
                          : contributionReport.students || []
                        ).map((s, i) => (
                          <div key={s.user_id || i} className="bg-white/5 rounded-lg p-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-white">{s.name || `User ${s.user_id}`}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                s.is_at_risk ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                              }`}>
                                Score: {s.contribution_score ?? "—"}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(activeModal === "at_risk_students" ? filterAtRiskStudents(contributionReport) : contributionReport.students || []).length === 0 && (
                          <p className="text-slate-500 text-sm text-center py-4">No students found</p>
                        )}
                      </div>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-green-500 hover:bg-green-600">
                        <Download className="w-4 h-4 mr-2" />Export Report
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* AI/Plagiarism Report — uses analysis endpoints */}
              {activeModal === "ai_plagiarism" && (
                <>
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
                  <Button
                    onClick={handleRunAnalysis}
                    disabled={isGeneratingReport || !selectedProjectId || selectedDetectionTypes.length === 0}
                    className="w-full bg-blue-500 hover:bg-blue-600 py-3"
                  >
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running Analysis...</> : "Run Analysis"}
                  </Button>
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
                </>
              )}

              {/* Semester Summary — multi-project selection */}
              {activeModal === "semester_summary" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Projects</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => toggleProjectSelection(p.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                            selectedProjectIds.includes(p.id)
                              ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                              : "bg-white/5 border-white/10 text-slate-300"
                          }`}
                        >
                          {selectedProjectIds.includes(p.id) ? "✓ " : ""}{p.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Selected: {selectedProjectIds.length} project(s)
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateSemesterSummary}
                    disabled={isGeneratingReport || selectedProjectIds.length === 0}
                    className="w-full bg-blue-500 hover:bg-blue-600 py-3"
                  >
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Summary"}
                  </Button>
                  {contributionReport && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Summary Generated</h3>
                      <p className="text-slate-400 text-sm">
                        Report includes data from {selectedProjectIds.length} project(s).
                      </p>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-green-500 hover:bg-green-600">
                        <Download className="w-4 h-4 mr-2" />Export Report
                      </Button>
                    </div>
                  )}
                </>
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
