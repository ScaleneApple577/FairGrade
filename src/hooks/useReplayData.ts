import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { 
  processSnapshots, 
  ReplaySnapshot, 
  ReplaySession, 
  ReplayResponse 
} from '@/lib/replayUtils';

interface UseReplayDataOptions {
  sessionId?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

interface UseReplayDataReturn {
  snapshots: ReplaySnapshot[];
  sessions: ReplaySession[];
  fileName: string;
  fileId: number | null;
  projectId: number | null;
  loading: boolean;
  error: string | null;
  totalSnapshots: number;
  totalKeyframes: number;
  fetchReplay: (options?: UseReplayDataOptions) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

/**
 * Hook to fetch and manage replay data from the backend
 * 
 * Backend endpoints:
 * - GET /api/projects/{project_id}/replay/{file_id} — Get replay with compressed snapshots
 * - GET /api/projects/{project_id}/files/{file_id}/sessions — List work sessions
 */
export function useReplayData(
  projectId: string | undefined, 
  fileId: string | undefined
): UseReplayDataReturn {
  const [snapshots, setSnapshots] = useState<ReplaySnapshot[]>([]);
  const [sessions, setSessions] = useState<ReplaySession[]>([]);
  const [fileName, setFileName] = useState('');
  const [parsedFileId, setParsedFileId] = useState<number | null>(null);
  const [parsedProjectId, setParsedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSnapshots, setTotalSnapshots] = useState(0);
  const [totalKeyframes, setTotalKeyframes] = useState(0);

  // Fetch available sessions for the file
  const fetchSessions = useCallback(async () => {
    if (!projectId || !fileId) return;
    
    try {
      const data = await api.get<ReplaySession[]>(
        `/api/projects/${projectId}/files/${fileId}/sessions`
      );
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
      setSessions([]);
    }
  }, [projectId, fileId]);

  // Fetch replay data with optional filters
  const fetchReplay = useCallback(async (options?: UseReplayDataOptions) => {
    if (!projectId || !fileId) {
      setError('Missing projectId or fileId');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Build URL with query params
      let url = `/api/projects/${projectId}/replay/${fileId}`;
      const params: string[] = [];
      
      if (options?.sessionId) params.push(`session_id=${options.sessionId}`);
      if (options?.startTime) params.push(`start_time=${options.startTime}`);
      if (options?.endTime) params.push(`end_time=${options.endTime}`);
      if (options?.limit) params.push(`limit=${options.limit}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const data = await api.get<ReplayResponse>(url);
      
      // Parse response - handle string or object
      let parsed: ReplayResponse;
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data);
        } catch {
          throw new Error('Invalid replay data format');
        }
      } else {
        parsed = data;
      }
      
      // Update state with metadata
      setFileName(parsed.file_name || '');
      setParsedFileId(parsed.file_id || null);
      setParsedProjectId(parsed.project_id || null);
      setTotalSnapshots(parsed.snapshot_count || 0);
      setTotalKeyframes(parsed.keyframe_count || 0);
      
      // Decompress all snapshots (this is the heavy operation)
      const rawSnapshots = parsed.snapshots || [];
      const processed = processSnapshots(rawSnapshots);
      setSnapshots(processed);
      
    } catch (err: any) {
      console.error('Failed to fetch replay:', err);
      setError(err.message || 'Failed to load replay data');
      setSnapshots([]);
    }
    
    setLoading(false);
  }, [projectId, fileId]);

  // Initial load when projectId/fileId change
  useEffect(() => {
    if (projectId && fileId) {
      fetchSessions();
      fetchReplay();
    }
  }, [projectId, fileId, fetchSessions, fetchReplay]);

  return {
    snapshots,
    sessions,
    fileName,
    fileId: parsedFileId,
    projectId: parsedProjectId,
    loading,
    error,
    totalSnapshots,
    totalKeyframes,
    fetchReplay,
    refreshSessions: fetchSessions,
  };
}
