import { api } from "@/lib/api";

// ==================== TYPES ====================

export interface MonitoringStatus {
  submission_id: string;
  student_name: string | null;
  student_email: string | null;
  assignment_title: string;
  classroom_name: string | null;
  monitoring_state: "active" | "idle" | "stopped" | "expired";
  last_activity: string | null;
  snapshot_count: number;
  flag_count: number;
  drive_file_url: string | null;
  status: string;
}

export interface Keyframe {
  submission_id: string;
  sequence_number: number;
  content: string;
  content_hash: string;
  captured_at: string;
  size_bytes: number;
  content_type?: "text" | "docs_json";
  doc_json?: any;
}

export interface Diff {
  submission_id: string;
  keyframe_sequence: number;
  sequence_number: number;
  delta: string;
  content_hash: string;
  captured_at: string;
  content_type?: "text" | "docs_json";
  doc_json?: any;
}

export interface ReconstructedContent {
  text: string;
  docJson?: any;
  contentType: "text" | "docs_json";
}

export interface ReplayData {
  keyframes: Keyframe[];
  diffs: Diff[];
}

export interface Flag {
  _id: string;
  submission_id: string;
  flag_type: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  evidence: Record<string, any>;
  teacher_status: "unreviewed" | "false_positive" | "needs_followup";
}

export interface Report {
  submission_id: string;
  summary_status: string;
  ai_detection_score?: number;
  ai_detection_provider?: string | null;
  plagiarism_score?: number;
  plagiarism_provider?: string | null;
  activity_overview: {
    total_snapshots: number;
    keyframe_count: number;
    diff_count: number;
    first_activity: string | null;
    last_activity: string | null;
  };
  flags_summary: {
    total_flags: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
  };
  generated_at: string;
}

export interface HighlightRange {
  start: number;
  end: number;
  color: string;
  label?: string;
}

export interface MonitoringDetail {
  submission_id: string;
  student_name: string | null;
  student_email: string | null;
  assignment_title: string;
  classroom_name: string;
  monitoring_state: string;
  snapshot_count: number;
  flag_count: number;
  drive_file_id: string | null;
  drive_file_url: string | null;
  status: string;
  due_at: string | null;
  monitoring_ends_at: string | null;
}

// ==================== API CALLS ====================

export async function getMonitoringStatus(): Promise<MonitoringStatus[]> {
  const data = await api.get("/api/monitoring/status");
  return Array.isArray(data) ? data : [];
}

export async function getMonitoringDetail(submissionId: string): Promise<MonitoringDetail> {
  return api.get(`/api/monitoring/submission/${submissionId}`);
}

export async function getReplayData(submissionId: string): Promise<ReplayData> {
  return api.get(`/api/submissions/${submissionId}/replay`);
}

export async function getFlags(submissionId: string): Promise<Flag[]> {
  const data = await api.get(`/api/submissions/${submissionId}/flags`);
  return Array.isArray(data) ? data : [];
}

export async function updateFlag(
  submissionId: string,
  flagId: string,
  teacherStatus: string
): Promise<void> {
  await api.put(`/api/submissions/${submissionId}/flags/${flagId}`, {
    teacher_status: teacherStatus,
  });
}

export async function getReport(submissionId: string): Promise<Report> {
  return api.get(`/api/submissions/${submissionId}/report`);
}

export async function pauseMonitoring(submissionId: string): Promise<void> {
  await api.post(`/api/monitoring/submission/${submissionId}/pause`);
}

export async function resumeMonitoring(submissionId: string): Promise<void> {
  await api.post(`/api/monitoring/submission/${submissionId}/resume`);
}

export async function forcePoll(submissionId: string): Promise<{ detail: string; sequence?: number }> {
  return api.post(`/api/monitoring/submission/${submissionId}/poll`);
}

export async function triggerAnalysis(submissionId: string): Promise<any> {
  return api.post(`/api/monitoring/submission/${submissionId}/analyze`);
}

// ==================== HELPERS ====================

export function getMonitoringStateColor(state: string): { bg: string; text: string; dot: string } {
  switch (state) {
    case "active":
      return { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" };
    case "idle":
      return { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" };
    case "backoff":
      return { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-400" };
    case "stopped":
      return { bg: "bg-slate-500/15", text: "text-slate-400", dot: "bg-slate-400" };
    case "expired":
      return { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" };
    default:
      return { bg: "bg-slate-500/15", text: "text-slate-400", dot: "bg-slate-400" };
  }
}

export function getSeverityColor(severity: string): { bg: string; text: string } {
  switch (severity) {
    case "high":
      return { bg: "bg-red-500/15", text: "text-red-400" };
    case "medium":
      return { bg: "bg-orange-500/15", text: "text-orange-400" };
    case "low":
      return { bg: "bg-yellow-500/15", text: "text-yellow-400" };
    default:
      return { bg: "bg-slate-500/15", text: "text-slate-400" };
  }
}

/**
 * Extract highlight ranges from a flag's evidence for document rendering.
 */
export function getHighlightRangesFromFlag(flag: Flag): HighlightRange[] {
  const ranges = flag.evidence?.highlighted_ranges;
  if (!ranges?.length) return [];

  if (flag.flag_type === "ai_detected") {
    return ranges.map((r: any) => ({
      start: r.start,
      end: r.end,
      color: "#7c3aed33", // violet/purple with transparency
      label: `AI confidence: ${Math.round((r.score ?? 0) * 100)}%`,
    }));
  }
  if (flag.flag_type === "plagiarism") {
    return ranges.map((r: any) => ({
      start: r.start,
      end: r.end,
      color: r.match_type === "identical" ? "#ef444433" : "#f9731633", // red or orange
      label: `${r.match_type}: ${r.source_title || r.source_url || "unknown source"}`,
    }));
  }
  return [];
}

/**
 * Extract plain text from Google Docs API JSON.
 * Mirrors backend extract_text_from_doc() for word/char counts.
 */
export function extractTextFromDocJson(docJson: any): string {
  const parts: string[] = [];

  function walk(elements: any[]) {
    for (const el of elements) {
      if (el.paragraph) {
        for (const pe of el.paragraph.elements || []) {
          if (pe.textRun?.content) parts.push(pe.textRun.content);
        }
      } else if (el.table) {
        for (const row of el.table.tableRows || []) {
          for (const cell of row.tableCells || []) {
            walk(cell.content || []);
          }
        }
      }
    }
  }

  walk(docJson?.body?.content || []);
  return parts.join("");
}

/**
 * Reconstruct document content at a given snapshot position.
 * Finds the nearest keyframe <= position and applies diffs up to position.
 * Returns a ReconstructedContent with text, optional docJson, and contentType.
 */
export function reconstructAtPosition(
  replay: ReplayData,
  targetSequence: number
): ReconstructedContent {
  // Find the nearest keyframe at or before target
  let keyframe: Keyframe | null = null;
  for (const kf of replay.keyframes) {
    if (kf.sequence_number <= targetSequence) {
      keyframe = kf;
    } else {
      break;
    }
  }

  if (!keyframe) {
    return { text: "", contentType: "text" };
  }

  // Check if the target snapshot itself is a diff with docs_json
  const targetDiff = replay.diffs.find((d) => d.sequence_number === targetSequence);

  // If target is exactly a keyframe
  if (keyframe.sequence_number === targetSequence) {
    if (keyframe.content_type === "docs_json" && keyframe.doc_json) {
      return {
        text: extractTextFromDocJson(keyframe.doc_json),
        docJson: keyframe.doc_json,
        contentType: "docs_json",
      };
    }
    return { text: keyframe.content, contentType: "text" };
  }

  // If target is a diff with docs_json, return its JSON directly
  if (targetDiff?.content_type === "docs_json" && targetDiff.doc_json) {
    return {
      text: extractTextFromDocJson(targetDiff.doc_json),
      docJson: targetDiff.doc_json,
      contentType: "docs_json",
    };
  }

  // Fall back to text diff reconstruction for old-style snapshots
  let content = keyframe.content;
  const applicableDiffs = replay.diffs.filter(
    (d) =>
      d.keyframe_sequence === keyframe!.sequence_number &&
      d.sequence_number <= targetSequence &&
      d.sequence_number > keyframe!.sequence_number
  );

  for (const diff of applicableDiffs) {
    content = applyUnifiedDiff(content, diff.delta);
  }

  return { text: content, contentType: "text" };
}

/**
 * Apply a unified diff to source text (best-effort).
 * For display purposes — not a full patch engine.
 */
function applyUnifiedDiff(source: string, delta: string): string {
  if (!delta.trim()) return source;

  const sourceLines = source.split("\n");
  const diffLines = delta.split("\n");
  const result: string[] = [];
  let sourceIdx = 0;

  for (const line of diffLines) {
    if (line.startsWith("---") || line.startsWith("+++")) continue;
    if (line.startsWith("@@")) {
      // Parse hunk header: @@ -start,count +start,count @@
      const match = line.match(/@@ -(\d+)/);
      if (match) {
        const hunkStart = parseInt(match[1], 10) - 1;
        // Copy lines before hunk
        while (sourceIdx < hunkStart && sourceIdx < sourceLines.length) {
          result.push(sourceLines[sourceIdx]);
          sourceIdx++;
        }
      }
      continue;
    }
    if (line.startsWith("-")) {
      // Removed line — skip in source
      sourceIdx++;
    } else if (line.startsWith("+")) {
      // Added line
      result.push(line.slice(1));
    } else if (line.startsWith(" ")) {
      // Context line
      result.push(sourceLines[sourceIdx] || line.slice(1));
      sourceIdx++;
    }
  }

  // Copy remaining source lines
  while (sourceIdx < sourceLines.length) {
    result.push(sourceLines[sourceIdx]);
    sourceIdx++;
  }

  return result.join("\n");
}
