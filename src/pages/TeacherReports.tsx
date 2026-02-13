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

const reportGradients = [
  "bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]",
  "bg-gradient-to-br from-[#065f46] to-[#10b981]",
  "bg-gradient-to-br from-[#581c87] to-[#a855f7]",
  "bg-gradient-to-br from-[#9d174d] to-[#ec4899]",
  "bg-gradient-to-br from-[#9a3412] to-[#f97316]",
  "bg-gradient-to-br from-[#312e81] to-[#6366f1]",
];

const reportTemplates: {
  id: number;
  key: ReportTemplateKey;
  icon: typeof FileText;
  gradient: string;
  title: string;
  description: string;
}[] = [
  { id: 1, key: "individual_student", icon: User, gradient: reportGradients[0], title: "Individual Student Report", description: "Detailed contribution report for a single student with timeline and grade recommendation." },
  { id: 2, key: "team_comparison", icon: Users, gradient: reportGradients[1], title: "Team Comparison Report", description: "Compare all team members' contributions side-by-side for a specific project." },
  { id: 3, key: "class_analytics", icon: BarChart3, gradient: reportGradients[2], title: "Class Analytics Report", description: "Overview of all projects in a course with aggregate statistics and trends." },
  { id: 4, key: "at_risk_students", icon: AlertTriangle, gradient: reportGradients[3], title: "At-Risk Students Report", description: "List of students with low contributions, flagged issues, or poor attendance." },
  { id: 5, key: "ai_plagiarism", icon: FileCheck, gradient: reportGradients[4], title: "AI/Plagiarism Report", description: "All flagged AI-generated content and plagiarism instances across projects." },
  { id: 6, key: "semester_summary", icon: Calendar, gradient: reportGradients[5], title: "Semester Summary", description: "Complete overview of all activity for the entire semester with export option." },
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
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8"
      >
        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`${template.gradient} rounded-2xl p-6 cursor-pointer card-hover relative overflow-hidden`}
              onClick={() => openModal(template.key)}
            >
              <template.icon className="stat-watermark w-20 h-20 text-white" />
              <div className="relative z-10">
                <template.icon className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-1.5 text-sm">{template.title}</h3>
                <p className="text-xs text-white/60 mb-5 leading-relaxed">{template.description}</p>
                <Button
                  onClick={(e) => { e.stopPropagation(); openModal(template.key); }}
                  className="w-full btn-glass text-sm h-9 rounded-xl"
                >
                  Generate Report
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Report Modal */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111633]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
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
                <button onClick={closeModal} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Individual Student Report */}
              {activeModal === "individual_student" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">Select Student</label>
                    <input
                      type="text"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      placeholder="Enter student user ID..."
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30"
                    />
                  </div>
                  <Button onClick={handleGenerateStudentReport} disabled={isGeneratingReport || !selectedStudentId} className="w-full btn-gradient py-3 rounded-xl">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Report"}
                  </Button>
                  {studentReport && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Student Report</h3>
                      <pre className="bg-white/[0.04] rounded-xl p-3 text-xs text-white/60 overflow-auto max-h-48 border border-white/[0.06]">{JSON.stringify(studentReport, null, 2)}</pre>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl">
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
                    <label className="block text-sm font-medium text-white/70 mb-2">Select Project</label>
                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white">
                      <option value="">Choose a project...</option>
                      {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <Button onClick={handleGenerateContributionReport} disabled={isGeneratingReport || !selectedProjectId} className="w-full btn-gradient py-3 rounded-xl">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Report"}
                  </Button>
                  {contributionReport && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">
                        {activeModal === "at_risk_students" ? `At-Risk Students (${filterAtRiskStudents(contributionReport).length})` : `Students (${contributionReport.students?.length || 0})`}
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(activeModal === "at_risk_students" ? filterAtRiskStudents(contributionReport) : contributionReport.students || []).map((s, i) => (
                          <div key={s.user_id || i} className="bg-white/[0.04] rounded-xl p-3 text-sm border border-white/[0.06]">
                            <div className="flex justify-between items-center">
                              <span className="text-white">{s.name || `User ${s.user_id}`}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${s.is_at_risk ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                Score: {s.contribution_score ?? "—"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleExportReport} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl">
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
                    <label className="block text-sm font-medium text-white/70 mb-2">Select Project</label>
                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white">
                      <option value="">Choose a project...</option>
                      {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white/70 mb-2">Detection Types</label>
                    <div className="flex gap-2">
                      {["ai", "plagiarism"].map((type) => (
                        <button key={type} onClick={() => toggleDetectionType(type)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedDetectionTypes.includes(type) ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" : "bg-white/[0.06] text-white/40 hover:bg-white/10"}`}>
                          {type === "ai" ? "AI Detection" : "Plagiarism"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleRunAnalysis} disabled={isGeneratingReport || !selectedProjectId} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-xl">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : "Run Analysis"}
                  </Button>
                  {analysisFlags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Results ({analysisFlags.length} flags)</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {analysisFlags.map((flag, i) => (
                          <div key={i} className="bg-white/[0.04] rounded-xl p-3 text-sm border border-white/[0.06]">
                            <div className="flex justify-between items-center">
                              <span className="text-white">{flag.type}</span>
                              <span className="text-xs text-white/40">{flag.severity}</span>
                            </div>
                            <p className="text-xs text-white/40 mt-1">{flag.message}</p>
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
                    <label className="block text-sm font-medium text-white/70 mb-2">Select Projects</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {projects.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
                          <input type="checkbox" checked={selectedProjectIds.includes(p.id)} onChange={() => toggleProjectSelection(p.id)} className="rounded border-white/20" />
                          <span className="text-sm text-white">{p.name}</span>
                        </label>
                      ))}
                      {projects.length === 0 && <p className="text-sm text-white/30 text-center py-4">No projects available</p>}
                    </div>
                  </div>
                  <Button onClick={handleGenerateSemesterSummary} disabled={isGeneratingReport || selectedProjectIds.length === 0} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 rounded-xl">
                    {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : `Generate Summary (${selectedProjectIds.length} selected)`}
                  </Button>
                  {contributionReport && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Summary</h3>
                      <pre className="bg-white/[0.04] rounded-xl p-3 text-xs text-white/60 overflow-auto max-h-48 border border-white/[0.06]">{JSON.stringify(contributionReport, null, 2)}</pre>
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
