import { useState, useEffect, useCallback, useRef } from "react";
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
  pollingInterval?: number; // in ms, default 5000
}

/**
 * Hook to poll for live editing status across teacher's projects.
 * Polls every 5 seconds by default. Pauses when tab is hidden.
 * 
 * API Endpoints:
 * - GET /api/teacher/live-status — returns all active edits across all projects
 * - GET /api/projects/{project_id}/live-status — returns active edits for a specific project
 */
export function useLiveStatus(options: UseLiveStatusOptions = {}) {
  const { projectId, enabled = true, pollingInterval = 5000 } = options;

  const [liveEdits, setLiveEdits] = useState<LiveEdit[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLiveStatus = useCallback(async () => {
    if (!enabled || !isVisible) return;

    try {
      const endpoint = projectId
        ? `/api/projects/${projectId}/live-status`
        : "/api/teacher/live-status";

      const data = await api.get<LiveStatusResponse>(endpoint);
      setLiveEdits(data?.activeEdits || []);
      setTotalActive(data?.totalActive || 0);
      setError(null);
    } catch (err) {
      // Don't clear existing data on error — keep showing last known state
      console.warn("Live status poll failed:", err);
      setError("Failed to fetch live status");
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
