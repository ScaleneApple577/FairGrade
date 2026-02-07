import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

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

export interface LiveStatusResponse {
  activeEdits: LiveEdit[];
  totalActive: number;
}

interface UseLiveStatusOptions {
  projectId?: string;
  enabled?: boolean;
  pollingInterval?: number; // in ms, default 30000
}

/**
 * Hook to poll for live editing status across teacher's projects.
 * 
 * API Endpoints:
 * - GET /api/teacher/live-status — returns all active edits across all projects
 * - GET /api/projects/{project_id}/live-status — returns active edits for a specific project
 * 
 * Response format:
 * {
 *   activeEdits: [
 *     { fileId, fileName, fileType, projectId, projectName, studentId, studentName, startedAt, lastEditAt, wordsAddedSession }
 *   ],
 *   totalActive: number
 * }
 */
export function useLiveStatus(options: UseLiveStatusOptions = {}) {
  const { projectId, enabled = true, pollingInterval = 30000 } = options;

  const [liveEdits, setLiveEdits] = useState<LiveEdit[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveStatus = useCallback(async () => {
    if (!enabled) return;

    try {
      // TODO: GET /api/teacher/live-status or GET /api/projects/{project_id}/live-status
      const endpoint = projectId
        ? `/api/projects/${projectId}/live-status`
        : "/api/teacher/live-status";

      const data = await api.get<LiveStatusResponse>(endpoint);
      setLiveEdits(data?.activeEdits || []);
      setTotalActive(data?.totalActive || 0);
      setError(null);
    } catch (err) {
      console.warn("Live status check failed:", err);
      // Don't clear existing data on error to avoid flickering
      setError("Failed to fetch live status");
    }
    setLoading(false);
  }, [projectId, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLiveEdits([]);
      setTotalActive(0);
      setLoading(false);
      return;
    }

    // Fetch immediately
    fetchLiveStatus();

    // Then poll at the specified interval
    const interval = setInterval(fetchLiveStatus, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchLiveStatus, pollingInterval, enabled]);

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
