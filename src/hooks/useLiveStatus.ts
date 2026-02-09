import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

// Event from backend
export interface ApiEvent {
  id: string;
  event_type: string; // 'edit', 'create', 'delete', 'comment'
  file_id?: string;
  file_name?: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  // Added by aggregation
  project_id?: string;
  project_name?: string;
}

export interface LiveEdit {
  fileId: string;
  fileName: string;
  fileType: "google_doc" | "google_sheet" | "google_slides";
  projectId: string;
  projectName: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  lastEditAt: string;
  wordsAddedSession: number;
}

interface UseLiveStatusOptions {
  projectId?: string;
  enabled?: boolean;
  pollingInterval?: number; // in ms, default 5000
}

/**
 * Hook to derive live editing status from recent events.
 * A student is "live" if they have an edit event within the last 5 minutes.
 * Polls every 5 seconds by default. Pauses when tab is hidden.
 * 
 * API Endpoints:
 * - GET /api/events/project/{project_id} — returns events for a specific project
 * - GET /api/projects/projects — returns all projects (used to aggregate events)
 */
export function useLiveStatus(options: UseLiveStatusOptions = {}) {
  const { projectId, enabled = true, pollingInterval = 5000 } = options;

  const [liveEdits, setLiveEdits] = useState<LiveEdit[]>([]);
  const [allEvents, setAllEvents] = useState<ApiEvent[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLiveStatus = useCallback(async () => {
    if (!enabled || !isVisible) return;

    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      let events: ApiEvent[] = [];

      if (projectId) {
        // Fetch events for a specific project
        const data = await api.get(`/api/events/project/${projectId}`);
        const arr = Array.isArray(data) 
          ? data 
          : (typeof data === 'string' ? JSON.parse(data) : []);
        events = arr.map((e: any) => ({ ...e, project_id: projectId }));
      } else {
        // Fetch projects and then events for each (limit to 10 projects for performance)
        try {
          const projects = await api.get<Array<{ id: string; name: string }>>('/api/projects/projects');
          const projectList = Array.isArray(projects) ? projects.slice(0, 10) : [];
          
          for (const project of projectList) {
            try {
              const data = await api.get(`/api/events/project/${project.id}`);
              const arr = Array.isArray(data) 
                ? data 
                : (typeof data === 'string' ? JSON.parse(data) : []);
              events.push(...arr.map((e: any) => ({ 
                ...e, 
                project_id: project.id,
                project_name: project.name 
              })));
            } catch {
              // Continue with other projects
            }
          }
        } catch {
          events = [];
        }
      }

      // Store all events for consumers that need full list
      setAllEvents(events);

      // Filter for live edits (edit events within last 5 minutes)
      const recentEditEvents = events.filter(
        (e) => e.event_type === 'edit' && new Date(e.created_at) > fiveMinAgo
      );

      // Convert to LiveEdit format, grouping by student + file
      const liveEditsMap = new Map<string, LiveEdit>();
      
      for (const event of recentEditEvents) {
        const key = `${event.user_id}-${event.file_id}`;
        const existing = liveEditsMap.get(key);
        
        if (!existing || new Date(event.created_at) > new Date(existing.lastEditAt)) {
          liveEditsMap.set(key, {
            fileId: event.file_id || '',
            fileName: event.file_name || 'Unknown File',
            fileType: 'google_doc', // Default, could be derived from file extension or mime type
            projectId: event.project_id || '',
            projectName: event.project_name || '',
            studentId: event.user_id || '',
            studentName: event.user_name || 'Unknown',
            startedAt: existing?.startedAt || event.created_at,
            lastEditAt: event.created_at,
            wordsAddedSession: 0, // Would need to be calculated from event metadata
          });
        }
      }

      const edits = Array.from(liveEditsMap.values());
      setLiveEdits(edits);
      setTotalActive(edits.length);
      setError(null);
    } catch (err) {
      // Don't clear existing data on error — keep showing last known state
      setError('Failed to fetch live status');
    }
    setLoading(false);
  }, [projectId, enabled, isVisible]);

  // Handle visibility changes — pause polling when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      // Fetch immediately when tab becomes visible again
      if (visible && enabled) {
        fetchLiveStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchLiveStatus, enabled]);

  // Main polling effect
  useEffect(() => {
    if (!enabled) {
      setLiveEdits([]);
      setTotalActive(0);
      setLoading(false);
      return;
    }

    // Fetch immediately on mount
    fetchLiveStatus();

    // Poll every 5 seconds (only when tab is visible)
    intervalRef.current = setInterval(() => {
      if (isVisible) {
        fetchLiveStatus();
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLiveStatus, pollingInterval, enabled, isVisible]);

  // Helper functions for consumers
  const isFileLive = useCallback(
    (fileId: string) => liveEdits.some((edit) => edit.fileId === fileId),
    [liveEdits]
  );

  const getFileEditors = useCallback(
    (fileId: string) =>
      liveEdits
        .filter((edit) => edit.fileId === fileId)
        .map((edit) => edit.studentName),
    [liveEdits]
  );

  const isStudentLive = useCallback(
    (studentId: string) =>
      liveEdits.some((edit) => edit.studentId === studentId),
    [liveEdits]
  );

  const getStudentActiveFile = useCallback(
    (studentId: string) => liveEdits.find((edit) => edit.studentId === studentId),
    [liveEdits]
  );

  const isProjectLive = useCallback(
    (projectIdToCheck: string) =>
      liveEdits.some((edit) => edit.projectId === projectIdToCheck),
    [liveEdits]
  );

  const getProjectLiveCount = useCallback(
    (projectIdToCheck: string) =>
      liveEdits.filter((edit) => edit.projectId === projectIdToCheck).length,
    [liveEdits]
  );

  return {
    liveEdits,
    allEvents,
    totalActive,
    loading,
    error,
    isFileLive,
    getFileEditors,
    isStudentLive,
    getStudentActiveFile,
    isProjectLive,
    getProjectLiveCount,
    refresh: fetchLiveStatus,
  };
}

// ============ Activity Display Helpers ============

/**
 * Get human-readable activity text from an event
 */
export function getActivityText(event: ApiEvent): string {
  switch (event.event_type) {
    case 'edit': return `edited ${event.file_name || 'a file'}`;
    case 'create': return `created ${event.file_name || 'a file'}`;
    case 'delete': return `deleted ${event.file_name || 'a file'}`;
    case 'comment': return `commented on ${event.file_name || 'a file'}`;
    case 'submit': 
    case 'submitted': return `submitted ${event.file_name || 'a file'}`;
    case 'upload':
    case 'uploaded': return `uploaded ${event.file_name || 'a file'}`;
    default: return `updated ${event.file_name || 'a file'}`;
  }
}

/**
 * Format relative time for display
 */
export function formatEventTime(timestamp: string): string {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffMs = now.getTime() - eventTime.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}
