import { api } from "@/lib/api";

// ============ Assignment API Utilities ============
// Backend endpoints:
// - POST /api/assignments — Create assignment
// - GET /api/assignments/mine — Get all assignments for current user
// - GET /api/assignments/classroom/{classroom_id} — List assignments for a classroom
// - GET /api/assignments/{assignment_id} — Get single assignment
// - PUT /api/assignments/{assignment_id} — Update assignment
// - DELETE /api/assignments/{assignment_id} — Delete assignment

export interface Assignment {
  id: string | number;
  classroom_id: number;
  classroom_name?: string;
  title: string;
  description?: string;
  due_date: string; // ISO string
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssignmentPayload {
  classroom_id: number | string;
  title: string;
  description?: string;
  due_date: string; // ISO string, e.g., "2026-02-15T23:59:00Z"
}

export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  due_date?: string;
}

// Helper to parse response that might be string or JSON
function parseResponse<T>(response: any): T {
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
 * Get all assignments for the current user (student or teacher)
 * GET /api/assignments/mine
 * Supports optional date filters
 */
export async function getMyAssignments(
  startDate?: string,
  endDate?: string
): Promise<Assignment[]> {
  const params: string[] = [];
  if (startDate) params.push(`start_date=${startDate}`);
  if (endDate) params.push(`end_date=${endDate}`);
  
  const url = params.length > 0
    ? `/api/assignments/mine?${params.join("&")}`
    : "/api/assignments/mine";
  
  const response = await api.get(url);
  const data = parseResponse<Assignment[] | Assignment>(response);
  
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && "id" in data) {
    return [data as Assignment];
  }
  return [];
}

/**
 * Get assignments for a specific classroom
 * GET /api/assignments/classroom/{classroom_id}
 */
export async function getClassroomAssignments(classroomId: number | string): Promise<Assignment[]> {
  const id = typeof classroomId === "string" ? parseInt(classroomId, 10) : classroomId;
  const response = await api.get(`/api/assignments/classroom/${id}`);
  const data = parseResponse<Assignment[]>(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Get a single assignment by ID
 * GET /api/assignments/{assignment_id}
 */
export async function getAssignment(assignmentId: number | string): Promise<Assignment | null> {
  const id = typeof assignmentId === "string" ? parseInt(assignmentId, 10) : assignmentId;
  try {
    const response = await api.get(`/api/assignments/${id}`);
    return parseResponse<Assignment>(response);
  } catch {
    return null;
  }
}

/**
 * Create a new assignment
 * POST /api/assignments
 */
export async function createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
  const body = {
    classroom_id: typeof payload.classroom_id === "string" 
      ? parseInt(payload.classroom_id, 10) 
      : payload.classroom_id,
    title: payload.title,
    description: payload.description || "",
    due_date: payload.due_date,
  };
  const response = await api.post("/api/assignments", body);
  return parseResponse<Assignment>(response);
}

/**
 * Update an existing assignment
 * PUT /api/assignments/{assignment_id}
 */
export async function updateAssignment(
  assignmentId: number | string,
  payload: UpdateAssignmentPayload
): Promise<Assignment> {
  const id = typeof assignmentId === "string" ? parseInt(assignmentId, 10) : assignmentId;
  const response = await api.put(`/api/assignments/${id}`, payload);
  return parseResponse<Assignment>(response);
}

/**
 * Delete an assignment
 * DELETE /api/assignments/{assignment_id}
 */
export async function deleteAssignment(assignmentId: number | string): Promise<void> {
  const id = typeof assignmentId === "string" ? parseInt(assignmentId, 10) : assignmentId;
  await api.delete(`/api/assignments/${id}`);
}

// ============ Helper Functions ============

/**
 * Get upcoming assignments (next N days)
 */
export async function getUpcomingAssignments(days: number = 7): Promise<Assignment[]> {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  const startDate = today.toISOString().split("T")[0];
  const endDate = futureDate.toISOString().split("T")[0];
  
  return getMyAssignments(startDate, endDate);
}

/**
 * Get overdue assignments
 */
export async function getOverdueAssignments(): Promise<Assignment[]> {
  const assignments = await getMyAssignments();
  const now = new Date();
  return assignments.filter((a) => new Date(a.due_date) < now);
}

/**
 * Check if an assignment is overdue
 */
export function isOverdue(assignment: Assignment): boolean {
  return new Date(assignment.due_date) < new Date();
}

/**
 * Check if an assignment is due today
 */
export function isDueToday(assignment: Assignment): boolean {
  const today = new Date();
  const dueDate = new Date(assignment.due_date);
  return (
    dueDate.getFullYear() === today.getFullYear() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getDate() === today.getDate()
  );
}

/**
 * Check if an assignment is due soon (within N days)
 */
export function isDueSoon(assignment: Assignment, days: number = 3): boolean {
  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Get assignment urgency for styling
 */
export function getAssignmentUrgency(assignment: Assignment): "overdue" | "today" | "soon" | "normal" {
  if (isOverdue(assignment)) return "overdue";
  if (isDueToday(assignment)) return "today";
  if (isDueSoon(assignment, 3)) return "soon";
  return "normal";
}

/**
 * Get urgency color classes for styling
 */
export function getUrgencyStyles(urgency: "overdue" | "today" | "soon" | "normal"): {
  border: string;
  text: string;
  bg: string;
} {
  switch (urgency) {
    case "overdue":
      return { border: "border-red-500", text: "text-red-400", bg: "bg-red-500/10" };
    case "today":
      return { border: "border-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500/10" };
    case "soon":
      return { border: "border-orange-500", text: "text-orange-400", bg: "bg-orange-500/10" };
    default:
      return { border: "border-blue-500", text: "text-blue-400", bg: "bg-blue-500/10" };
  }
}

/**
 * Format due date for display
 */
export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  
  if (diffDays < 0) {
    return `Overdue (was ${dateStr})`;
  } else if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${timeStr}`;
  } else if (diffDays <= 7) {
    return `${dateStr} at ${timeStr}`;
  } else {
    return `${dateStr} at ${timeStr}`;
  }
}

/**
 * Map assignment to calendar event format
 */
export function mapAssignmentToCalendarEvent(assignment: Assignment): {
  id: string;
  title: string;
  description?: string;
  date: Date;
  classroomName?: string;
  type: "assignment";
  color: string;
} {
  return {
    id: String(assignment.id),
    title: assignment.title,
    description: assignment.description,
    date: new Date(assignment.due_date),
    classroomName: assignment.classroom_name,
    type: "assignment",
    color: "blue",
  };
}
