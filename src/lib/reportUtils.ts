import { api } from "@/lib/api";

// ============ Report API Utilities ============
// Backend endpoints:
// - GET /api/reports/contribution/{project_id} — Contribution report for all students in a project
// - GET /api/reports/student/{user_id} — Student report with all their contributions
// - POST /api/reports/export?report_type={type}&project_id={id}&user_id={id} — Export a report

// Helper to parse response that might be string or JSON
function parseReportResponse<T>(response: any): T {
  if (typeof response === "string") {
    try {
      return JSON.parse(response);
    } catch {
      return response as T;
    }
  }
  return response;
}

// ============ Report Types ============

export interface ContributionReportStudent {
  user_id: number;
  name?: string;
  email?: string;
  contribution_score?: number;
  words_written?: number;
  tasks_completed?: number;
  meetings_attended?: number;
  peer_rating?: number;
  flags?: number;
  is_at_risk?: boolean;
}

export interface ContributionReport {
  project_id: number;
  project_name?: string;
  generated_at?: string;
  students: ContributionReportStudent[];
  summary?: {
    total_students?: number;
    avg_contribution_score?: number;
    at_risk_count?: number;
    flagged_count?: number;
  };
}

export interface StudentReport {
  user_id: number;
  name?: string;
  email?: string;
  projects?: {
    project_id: number;
    project_name?: string;
    contribution_score?: number;
    words_written?: number;
    tasks_completed?: number;
    meetings_attended?: number;
    peer_rating?: number;
    flags?: number;
  }[];
  overall_stats?: {
    total_projects?: number;
    avg_contribution_score?: number;
    total_words_written?: number;
    total_tasks_completed?: number;
  };
}

// ============ API Functions ============

/**
 * Get contribution report for a project (all students)
 * GET /api/reports/contribution/{project_id}
 * 
 * Maps to:
 * - Team Comparison Report (shows all team members side-by-side)
 * - Class Analytics Report (aggregate stats for the project)
 * - At-Risk Students Report (filter students where is_at_risk = true)
 */
export async function getContributionReport(projectId: number | string): Promise<ContributionReport> {
  const id = typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
  const response = await api.get(`/api/reports/contribution/${id}`);
  return parseReportResponse<ContributionReport>(response);
}

/**
 * Get student report with all their contributions
 * GET /api/reports/student/{user_id}
 * 
 * Maps to:
 * - Individual Student Report (detailed contribution report for a single student)
 */
export async function getStudentReport(userId: number | string): Promise<StudentReport> {
  const id = typeof userId === "string" ? parseInt(userId, 10) : userId;
  const response = await api.get(`/api/reports/student/${id}`);
  return parseReportResponse<StudentReport>(response);
}

/**
 * Export a report
 * POST /api/reports/export?report_type={type}&project_id={id}&user_id={id}
 * 
 * @param reportType - "contribution" | "student"
 * @param projectId - Required for contribution reports
 * @param userId - Required for student reports
 */
export async function exportReport(
  reportType: "contribution" | "student",
  projectId?: number | string,
  userId?: number | string
): Promise<Blob | string> {
  const params = new URLSearchParams();
  params.set("report_type", reportType);
  
  if (projectId) {
    const pid = typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
    params.set("project_id", pid.toString());
  }
  
  if (userId) {
    const uid = typeof userId === "string" ? parseInt(userId, 10) : userId;
    params.set("user_id", uid.toString());
  }
  
  const response = await api.post(`/api/reports/export?${params.toString()}`);
  return response;
}

// ============ Report Type Mapping ============
// Maps frontend report types to backend endpoints

export type FrontendReportType = 
  | "individual_student"    // → GET /api/reports/student/{user_id}
  | "team_comparison"       // → GET /api/reports/contribution/{project_id}
  | "class_analytics"       // → GET /api/reports/contribution/{project_id} (aggregate view)
  | "at_risk_students"      // → GET /api/reports/contribution/{project_id} (filtered)
  | "ai_plagiarism"         // → Uses analysis endpoints (separate)
  | "semester_summary";     // → GET /api/reports/contribution/{project_id} for each project

export interface ReportConfig {
  requiresProject: boolean;
  requiresStudent: boolean;
  backendType: "contribution" | "student" | "analysis";
  description: string;
}

export const REPORT_CONFIGS: Record<FrontendReportType, ReportConfig> = {
  individual_student: {
    requiresProject: false,
    requiresStudent: true,
    backendType: "student",
    description: "Fetches GET /api/reports/student/{user_id}",
  },
  team_comparison: {
    requiresProject: true,
    requiresStudent: false,
    backendType: "contribution",
    description: "Fetches GET /api/reports/contribution/{project_id}",
  },
  class_analytics: {
    requiresProject: true,
    requiresStudent: false,
    backendType: "contribution",
    description: "Fetches GET /api/reports/contribution/{project_id} and shows aggregates",
  },
  at_risk_students: {
    requiresProject: true,
    requiresStudent: false,
    backendType: "contribution",
    description: "Fetches GET /api/reports/contribution/{project_id} and filters at-risk",
  },
  ai_plagiarism: {
    requiresProject: true,
    requiresStudent: false,
    backendType: "analysis",
    description: "Uses /api/analysis/* endpoints (handled separately)",
  },
  semester_summary: {
    requiresProject: false,
    requiresStudent: false,
    backendType: "contribution",
    description: "Fetches contribution reports for all projects",
  },
};

/**
 * Generate a report based on frontend type
 */
export async function generateReport(
  type: FrontendReportType,
  options: { projectId?: string; userId?: string; projectIds?: string[] }
): Promise<ContributionReport | StudentReport | ContributionReport[] | null> {
  const config = REPORT_CONFIGS[type];

  switch (type) {
    case "individual_student":
      if (!options.userId) throw new Error("Student selection required");
      return getStudentReport(options.userId);

    case "team_comparison":
    case "class_analytics":
    case "at_risk_students":
      if (!options.projectId) throw new Error("Project selection required");
      return getContributionReport(options.projectId);

    case "semester_summary":
      // Fetch contribution reports for multiple projects
      if (!options.projectIds || options.projectIds.length === 0) {
        throw new Error("At least one project required");
      }
      const reports = await Promise.all(
        options.projectIds.map((pid) => getContributionReport(pid))
      );
      return reports;

    case "ai_plagiarism":
      // AI/Plagiarism uses analysis endpoints, handled separately
      throw new Error("AI/Plagiarism reports use analysis endpoints");

    default:
      return null;
  }
}

/**
 * Filter contribution report for at-risk students only
 */
export function filterAtRiskStudents(report: ContributionReport): ContributionReportStudent[] {
  return report.students.filter((s) => s.is_at_risk === true);
}
