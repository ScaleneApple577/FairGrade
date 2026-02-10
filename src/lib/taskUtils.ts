import { api } from '@/lib/api';

// ============ Backend Task Types ============
// Backend task object: { id, title, description, project_id, assigned_to, status, created_at, updated_at }

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  project_id: number;
  assigned_to: number | null;
  status: 'open' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}

// Frontend display format (extended with local-only fields)
export interface Task {
  id: number;
  title: string;
  description: string | null;
  projectId: number;
  assignedTo: number | null;
  status: 'open' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
  // Frontend-only fields (not supported by backend yet)
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
}

// ============ Status Display Mapping ============
// Backend uses: "open", "in_progress", "done"
// Frontend displays: "To Do", "In Progress", "Completed"

export const statusDisplay: Record<string, { label: string; color: string }> = {
  'open': { label: 'To Do', color: 'bg-slate-500/15 text-slate-400' },
  'in_progress': { label: 'In Progress', color: 'bg-blue-500/15 text-blue-400' },
  'done': { label: 'Completed', color: 'bg-emerald-500/15 text-emerald-400' },
};

export function getStatusDisplay(status: string): { label: string; color: string } {
  return statusDisplay[status] || { label: status, color: 'bg-white/10 text-slate-300' };
}

// ============ Task Mapping ============
// Convert backend task to frontend format

export function mapApiTaskToTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    projectId: apiTask.project_id,
    assignedTo: apiTask.assigned_to,
    status: apiTask.status,
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
    // These don't exist in backend — show defaults
    dueDate: null,
    priority: null,
  };
}

// Convert array of API tasks
export function mapApiTasksToTasks(apiTasks: ApiTask[]): Task[] {
  return apiTasks.map(mapApiTaskToTask);
}

// ============ Task API Functions ============

// Create a new task
// POST /api/tasks — Body: { title, description, project_id, assigned_to, status }
export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId: number | string;
  assignedTo?: number | null;
  status?: 'open' | 'in_progress' | 'done';
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post<ApiTask>('/api/tasks', {
    title: payload.title,
    description: payload.description || '',
    project_id: payload.projectId,
    assigned_to: payload.assignedTo ?? null,
    status: payload.status || 'open',
  });
  return mapApiTaskToTask(response);
}

// Update an existing task
// PUT /api/tasks/{id} — Body: { title, description, assigned_to, status }
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: number | null;
  status?: 'open' | 'in_progress' | 'done';
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const response = await api.put<ApiTask>(`/api/tasks/${taskId}`, {
    title: payload.title,
    description: payload.description,
    assigned_to: payload.assignedTo,
    status: payload.status,
  });
  return mapApiTaskToTask(response);
}

// Delete a task
// DELETE /api/tasks/{id}
export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/api/tasks/${taskId}`);
}

// Toggle task status (open <-> done)
export async function toggleTaskStatus(task: Task): Promise<Task> {
  const newStatus = task.status === 'done' ? 'open' : 'done';
  return updateTask(task.id, {
    title: task.title,
    description: task.description || '',
    assignedTo: task.assignedTo,
    status: newStatus,
  });
}

// Reassign a task to another user
export async function reassignTask(task: Task, newAssigneeId: number | null): Promise<Task> {
  return updateTask(task.id, {
    title: task.title,
    description: task.description || '',
    assignedTo: newAssigneeId,
    status: task.status,
  });
}

// ============ Fetch Tasks ============
// TODO: Backend needs a list tasks endpoint, either:
// GET /api/tasks?project_id=X — list tasks for a project
// OR GET /api/projects/{project_id}/tasks
// For now, tasks may come from the project detail response if the backend includes them there

export async function fetchTasksForProject(projectId: string): Promise<Task[]> {
  try {
    // Try fetching from project detail first
    const project = await api.get<{ id: string; tasks?: ApiTask[] }>(`/api/projects/projects/${projectId}`);
    if (project.tasks && Array.isArray(project.tasks)) {
      return mapApiTasksToTasks(project.tasks);
    }
    
    // TODO: Need dedicated tasks list endpoint
    // Try: api.get(`/api/tasks?project_id=${projectId}`)
    console.warn('TODO: Backend needs a list tasks endpoint for project filtering');
    return [];
  } catch (error) {
    console.warn('Failed to fetch tasks:', error);
    return [];
  }
}

// TODO: Need an endpoint to get all tasks assigned to the current user
// e.g., GET /api/tasks/mine or GET /api/tasks?assigned_to=me
export async function fetchMyTasks(): Promise<Task[]> {
  try {
    // TODO: Need GET /api/tasks/mine or similar endpoint
    console.warn('TODO: Backend needs GET /api/tasks/mine endpoint to fetch user tasks');
    return [];
  } catch (error) {
    console.warn('Failed to fetch my tasks:', error);
    return [];
  }
}
