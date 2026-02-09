import { api } from "@/lib/api";

// ============ Analysis & Integrity API Utilities ============
// Backend endpoints:
// - POST /api/analysis/ai-check?project_id={id} — Run AI content detection
// - POST /api/analysis/plagiarism?project_id={id} — Run plagiarism check
// - GET /api/analysis/flags/{project_id} — Get all analysis flags

export interface AnalysisFlag {
  id: string | number;
  project_id: number;
  user_id?: number;
  type: "ai" | "plagiarism" | "suspicious_paste" | "other";
  severity: "low" | "medium" | "high";
  message: string;
  details?: string;
  file_id?: string;
  file_name?: string;
  status?: "new" | "reviewed" | "dismissed" | "confirmed";
  created_at?: string;
}

// Helper to parse response that might be string or JSON
function parseAnalysisResponse<T>(response: any): T {
  if (typeof response === "string") {
    try {
      return JSON.parse(response);
    } catch {
      return response as T;
    }
  }
  return response;
}

/**
 * Run AI content detection on a project
 * POST /api/analysis/ai-check?project_id={id}
 */
export async function runAICheck(projectId: number | string): Promise<any> {
  const id = typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
  const response = await api.post(`/api/analysis/ai-check?project_id=${id}`);
  return parseAnalysisResponse(response);
}

/**
 * Run plagiarism check on a project
 * POST /api/analysis/plagiarism?project_id={id}
 */
export async function runPlagiarismCheck(projectId: number | string): Promise<any> {
  const id = typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
  const response = await api.post(`/api/analysis/plagiarism?project_id=${id}`);
  return parseAnalysisResponse(response);
}

/**
 * Get all analysis flags for a project
 * GET /api/analysis/flags/{project_id}
 */
export async function getAnalysisFlags(projectId: number | string): Promise<AnalysisFlag[]> {
  const id = typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
  const response = await api.get(`/api/analysis/flags/${id}`);
  const parsed = parseAnalysisResponse<AnalysisFlag[] | AnalysisFlag>(response);
  
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  // If single flag returned, wrap in array
  if (parsed && typeof parsed === "object" && "id" in parsed) {
    return [parsed as AnalysisFlag];
  }
  
  return [];
}

/**
 * Get integrity flags for a specific student within a project
 * Filters project flags by user_id
 */
export async function getStudentIntegrityFlags(
  projectId: number | string,
  studentId: number | string
): Promise<AnalysisFlag[]> {
  const allFlags = await getAnalysisFlags(projectId);
  const studentIdNum = typeof studentId === "string" ? parseInt(studentId, 10) : studentId;
  return allFlags.filter((f) => f.user_id === studentIdNum);
}

/**
 * Count flags by type for a project
 */
export function countFlagsByType(flags: AnalysisFlag[]): {
  ai: number;
  plagiarism: number;
  other: number;
  total: number;
} {
  const ai = flags.filter((f) => f.type === "ai").length;
  const plagiarism = flags.filter((f) => f.type === "plagiarism").length;
  const other = flags.filter((f) => f.type !== "ai" && f.type !== "plagiarism").length;
  return { ai, plagiarism, other, total: flags.length };
}

/**
 * Get flag severity color class
 */
export function getFlagSeverityColor(severity: string): string {
  switch (severity) {
    case "high":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    case "medium":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    case "low":
      return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/20";
  }
}

/**
 * Get flag type icon and label
 */
export function getFlagTypeInfo(type: string): { icon: string; label: string } {
  switch (type) {
    case "ai":
      return { icon: "🤖", label: "AI Detected" };
    case "plagiarism":
      return { icon: "📋", label: "Plagiarism" };
    case "suspicious_paste":
      return { icon: "📝", label: "Suspicious Paste" };
    default:
      return { icon: "⚠️", label: "Flag" };
  }
}

// TODO: Backend needs endpoints to manage flag status:
// PUT /api/analysis/flags/{flag_id} — Body: { status: "reviewed" | "dismissed" | "confirmed" }
// For now, flag status changes are frontend-only (saved in state, not persisted)

export async function updateFlagStatus(
  flagId: number | string,
  status: "reviewed" | "dismissed" | "confirmed"
): Promise<void> {
  // TODO: Implement when backend supports it
  // await api.put(`/api/analysis/flags/${flagId}`, { status });
  console.warn("updateFlagStatus: Backend endpoint not available yet. Status change is frontend-only.");
}
