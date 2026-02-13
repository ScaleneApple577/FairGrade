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

// Define interfaces for report data
interface Contribution {
  user_id: string;
  name: string;
  contribution_score: number;
  is_at_risk: boolean;
}

interface StudentData {
  name: string;
  email: string;
  contributions: {
    project1: number;
    project2: number;
  };
  attendance: number;
  flags: string[];
}

interface ClassSummary {
  average_contribution: number;
  total_projects: number;
  students_at_risk: number;
}

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
  accent: string;
  btnColor: string;
  title: string;
  description: string;
}[] = [
  { id: 1, key: "individual_student", icon: User, accent: "border-l-blue-400", btnColor: "bg-blue-600 hover:bg-blue-700", title: "Individual Student Report", description: "Detailed contribution report for a single student with timeline and grade recommendation." },
  { id: 2, key: "team_comparison", icon: Users, accent: "border-l-emerald-400", btnColor: "bg-emerald-600 hover:bg-emerald-700", title: "Team Comparison Report", description: "Compare all team members' contributions side-by-side for a specific project." },
  { id: 3, key: "class_analytics", icon: BarChart3, accent: "border-l-purple-400", btnColor: "bg-purple-600 hover:bg-purple-700", title: "Class Analytics Report", description: "Overview of all projects in a course with aggregate statistics and trends." },
  { id: 4, key: "at_risk_students", icon: AlertTriangle, accent: "border-l-red-400", btnColor: "bg-red-600 hover:bg-red-700", title: "At-Risk Students Report", description: "List of students with low contributions, flagged issues, or poor attendance." },
  { id: 5, key: "ai_plagiarism", icon: FileCheck, accent: "border-l-amber-400", btnColor: "bg-amber-600 hover:bg-amber-700", title: "AI/Plagiarism Report", description: "All flagged AI-generated content and plagiarism instances across projects." },
  { id: 6, key: "semester_summary", icon: Calendar, accent: "border-l-indigo-400", btnColor: "bg-indigo-600 hover:bg-indigo-700", title: "Semester Summary", description: "Complete overview of all activity for the entire semester with export option." },
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
        const projectsData = await api.get<Project[]>("/api/projects/projects");
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

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

  const handleGenerateStudentReport = async () => {
    if (!selectedStudentId) { toast.error("Please select a student"); return; }
    setIsGeneratingReport(true);
    try {
      const report = await getStudentReport(selectedStudentId);
      setStudentReport(report);
      toast.success("Student report generated!");
    } catch (error) {
      console.error("Failed to generate student report:", error);
      toast.error("Failed to generate report");
    } finally { setIsGeneratingReport(false); }
  };

  const handleGenerateContributionReport = async () => {
    if (!selectedProjectId) { toast.error("Please select a project"); return; }
    setIsGeneratingReport(true);
    try {
      const report = await getContributionReport(selectedProjectId);
      setContributionReport(report);
      toast.success("Report generated!");
    } catch (error) {
      console.error("Failed to generate contribution report:", error);
      toast.error("Failed to generate report");
    } finally { setIsGeneratingReport(false); }
  };

  const handleRunAnalysis = async () => {
    if (!selectedProjectId) { toast.error("Please select a project"); return; }
    setIsGeneratingReport(true);
    setAnalysisFlags([]);
    try {
      if (selectedDetectionTypes.includes("ai")) { await runAICheck(selectedProjectId); }
      if (selectedDetectionTypes.includes("plagiarism")) { await runPlagiarismCheck(selectedProjectId); }
      const flags = await getAnalysisFlags(selectedProjectId);
      setAnalysisFlags(flags);
      if (flags.length === 0) { toast.info("No issues found!"); } else { toast.success("Analysis complete!"); }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed");
    } finally { setIsGeneratingReport(false); }
  };

  const handleGenerateSemesterSummary = async () => {
    if (selectedProjectIds.length === 0) { toast.error("Please select at least one project"); return; }
    setIsGeneratingReport(true);
    try {
      const reports = await Promise.all(selectedProjectIds.map((pid) => getContributionReport(pid)));
      if (reports.length > 0) { setContributionReport(reports[0]); }
      toast.success(`Generated summary for ${reports.length} project(s)`);
    } catch (error) {
      console.error("Failed to generate semester summary:", error);
      toast.error("Failed to generate summary");
    } finally { setIsGeneratingReport(false); }
  };

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
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-8"
      >
        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {reportTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={`bg-white rounded-xl border-l-[3px] ${template.accent} p-5 shadow-sm card-hover cursor-pointer`}
              onClick={() => openModal(template.key)}
            >
              <template.icon className="w-8 h-8 text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{template.title}</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{template.description}</p>
              <Button
                onClick={(e) => { e.stopPropagation(); openModal(template.key); }}
                className={`w-full ${template.btnColor} text-white rounded-lg shadow-sm text-sm h-9 transition-all duration-150 hover:shadow-md`}
              >
                Generate Report
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Report Modal */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeModal === "individual_student" && "Individual Student Report"}
                  {activeModal === "team_comparison" && "Team Comparison Report"}
                  {activeModal === "class_analytics" && "Class Analytics Report"}
                  {activeModal === "at_risk_students" && "At-Risk Students Report"}
                  {activeModal === "ai_plagiarism" && "AI/Plagiarism Report"}
                  {activeModal === "semester_summary" && "Semester Summary"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Individual Student Report */}
              {activeModal === "individual_student" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                    <input
                      type="text"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      placeholder="Enter student user ID..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <Button onClick={handleGenerateStudentReport} disabled={isGeneratingReport || !selectedStudentId} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-sm">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Report"}
                  </Button>
                  {studentReport && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Student Report</h3>
                      <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 overflow-auto max-h-48 border border-gray-100">{JSON.stringify(studentReport, null, 2)}</pre>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">
                        <Download className="w-4 h-4 mr-2" />Export Report
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Team Comparison, Class Analytics, At-Risk */}
              {(activeModal === "team_comparison" || activeModal === "class_analytics" || activeModal === "at_risk_students") && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900">
                      <option value="">Choose a project...</option>
                      {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <Button onClick={handleGenerateContributionReport} disabled={isGeneratingReport || !selectedProjectId} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-sm">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Report"}
                  </Button>
                  {contributionReport && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        {activeModal === "at_risk_students" ? `At-Risk Students (${filterAtRiskStudents(contributionReport).length})` : `Students (${contributionReport.students?.length || 0})`}
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(activeModal === "at_risk_students" ? filterAtRiskStudents(contributionReport) : contributionReport.students || []).map((s, i) => (
                          <div key={s.user_id || i} className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-900">{s.name || `User ${s.user_id}`}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${s.is_at_risk ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                                Score: {s.contribution_score ?? "—"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">
                        <Download className="w-4 h-4 mr-2" />Export Report
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* AI/Plagiarism Report */}
              {activeModal === "ai_plagiarism" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900">
                      <option value="">Choose a project...</option>
                      {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detection Types</label>
                    <div className="flex gap-2">
                      {["ai", "plagiarism"].map((type) => (
                        <button key={type} onClick={() => toggleDetectionType(type)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDetectionTypes.includes(type) ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {type === "ai" ? "AI Detection" : "Plagiarism"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleRunAnalysis} disabled={isGeneratingReport || !selectedProjectId} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg shadow-sm">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : "Run Analysis"}
                  </Button>
                  {analysisFlags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Results ({analysisFlags.length} flags)</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {analysisFlags.map((flag, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-900">{flag.type}</span>
                              <span className="text-xs text-gray-500">{flag.severity}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{flag.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Semester Summary */}
              {activeModal === "semester_summary" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Projects</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {projects.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input type="checkbox" checked={selectedProjectIds.includes(p.id)} onChange={() => toggleProjectSelection(p.id)} className="rounded border-gray-300" />
                          <span className="text-sm text-gray-900">{p.name}</span>
                        </label>
                      ))}
                      {projects.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No projects available</p>}
                    </div>
                  </div>
                  <Button onClick={handleGenerateSemesterSummary} disabled={isGeneratingReport || selectedProjectIds.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg shadow-sm">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : `Generate Summary (${selectedProjectIds.length} selected)`}
                  </Button>
                  {contributionReport && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
                      <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 overflow-auto max-h-48 border border-gray-100">{JSON.stringify(contributionReport, null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </TeacherLayout>
  );
}
