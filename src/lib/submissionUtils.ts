import { api } from "@/lib/api";

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  drive_file_id?: string;
  drive_file_url?: string;
  status: "not_started" | "in_progress" | "submitted";
  submitted_at?: string;
}

export interface CreateSubmissionPayload {
  assignment_id: string;
  drive_file_id?: string;
  drive_file_url?: string;
}

export interface UpdateSubmissionPayload {
  drive_file_id?: string;
  drive_file_url?: string;
  status?: "not_started" | "in_progress" | "submitted";
}

export async function createSubmission(payload: CreateSubmissionPayload): Promise<Submission> {
  return api.post("/api/submissions", payload);
}

export async function createGoogleDoc(assignmentId: string): Promise<Submission> {
  return api.post("/api/submissions/create-doc", { assignment_id: assignmentId });
}

export async function getMySubmissions(): Promise<Submission[]> {
  const data = await api.get("/api/submissions/mine");
  return Array.isArray(data) ? data : [];
}

export async function getAssignmentSubmissions(assignmentId: string): Promise<Submission[]> {
  const data = await api.get(`/api/submissions/assignment/${assignmentId}`);
  return Array.isArray(data) ? data : [];
}

export async function getSubmission(submissionId: string): Promise<Submission> {
  return api.get(`/api/submissions/${submissionId}`);
}

export async function updateSubmission(submissionId: string, payload: UpdateSubmissionPayload): Promise<Submission> {
  return api.put(`/api/submissions/${submissionId}`, payload);
}

export async function deleteSubmission(submissionId: string): Promise<void> {
  await api.delete(`/api/submissions/${submissionId}`);
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "not_started": return "Not Started";
    case "in_progress": return "In Progress";
    case "submitted": return "Submitted";
    default: return status;
  }
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "submitted": return { bg: "bg-emerald-500/15", text: "text-emerald-400" };
    case "in_progress": return { bg: "bg-primary/15", text: "text-primary" };
    default: return { bg: "bg-slate-500/15", text: "text-slate-400" };
  }
}
