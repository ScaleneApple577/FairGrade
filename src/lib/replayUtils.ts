import pako from 'pako';

// ============ Replay Data Utilities ============
// Backend endpoints:
// - GET /api/projects/{project_id}/replay/{file_id} — Get replay with compressed snapshots
// - GET /api/projects/{project_id}/files/{file_id}/sessions — List work sessions

/**
 * Decompress base64-encoded gzip content from the backend
 */
export function decompressContent(compressedBase64: string): string {
  try {
    // 1. Decode base64 to binary
    const binaryString = atob(compressedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 2. Decompress gzip using pako
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return decompressed;
  } catch (error) {
    console.error('Failed to decompress snapshot:', error);
    return '';
  }
}

// ============ Types ============

export interface ReplayFlag {
  flag_id: number;
  flag_type: number; // 0 = AI, 1 = Plagiarism
  confidence: number;
  start_pos: number;
  end_pos: number;
  flagged_text: string;
}

export interface ReplaySnapshot {
  snapshot_id: number;
  timestamp: string;
  is_keyframe: boolean;
  content: string; // Decompressed full content
  original_size: number;
  compressed_size: number;
  flags: ReplayFlag[];
}

export interface RawSnapshot {
  snapshot_id: number;
  timestamp: string;
  is_keyframe: boolean;
  compressed_content: string; // Base64 gzip
  original_size: number;
  compressed_size: number;
  flags?: ReplayFlag[];
}

export interface ReplayResponse {
  file_id: number;
  file_name: string;
  project_id: number;
  snapshot_count: number;
  keyframe_count: number;
  snapshots: RawSnapshot[];
}

export interface ReplaySession {
  id: string;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  [key: string]: any;
}

// ============ Processing Functions ============

/**
 * Process raw snapshots from API into usable format with decompressed content
 */
export function processSnapshots(rawSnapshots: RawSnapshot[]): ReplaySnapshot[] {
  return rawSnapshots.map(snap => ({
    snapshot_id: snap.snapshot_id,
    timestamp: snap.timestamp,
    is_keyframe: snap.is_keyframe,
    content: decompressContent(snap.compressed_content),
    original_size: snap.original_size,
    compressed_size: snap.compressed_size,
    flags: snap.flags || [],
  }));
}

/**
 * Calculate diff between two snapshots (for highlighting changes)
 */
export function calculateDiff(prevContent: string, currentContent: string): {
  added: { start: number; end: number; text: string }[];
  removed: { start: number; end: number; text: string }[];
} {
  const added: { start: number; end: number; text: string }[] = [];
  const removed: { start: number; end: number; text: string }[] = [];
  
  if (prevContent === currentContent) return { added, removed };
  
  // Find common prefix
  let prefixLen = 0;
  while (prefixLen < prevContent.length && prefixLen < currentContent.length && 
         prevContent[prefixLen] === currentContent[prefixLen]) {
    prefixLen++;
  }
  
  // Find common suffix
  let prevSuffix = prevContent.length;
  let currSuffix = currentContent.length;
  while (prevSuffix > prefixLen && currSuffix > prefixLen &&
         prevContent[prevSuffix - 1] === currentContent[currSuffix - 1]) {
    prevSuffix--;
    currSuffix--;
  }
  
  if (currSuffix > prefixLen) {
    added.push({
      start: prefixLen,
      end: currSuffix,
      text: currentContent.slice(prefixLen, currSuffix)
    });
  }
  
  if (prevSuffix > prefixLen) {
    removed.push({
      start: prefixLen,
      end: prevSuffix,
      text: prevContent.slice(prefixLen, prevSuffix)
    });
  }
  
  return { added, removed };
}

// ============ Flag Display Helpers ============

/**
 * Get human-readable label for flag type
 */
export function getFlagTypeLabel(flagType: number): string {
  switch (flagType) {
    case 0: return 'AI Generated';
    case 1: return 'Plagiarism';
    default: return 'Flagged';
  }
}

/**
 * Get color classes for flag type (for dark UI controls)
 */
export function getFlagTypeColor(flagType: number): string {
  switch (flagType) {
    case 0: return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'; // AI
    case 1: return 'bg-red-500/20 border-red-500/30 text-red-400'; // Plagiarism
    default: return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
  }
}

/**
 * Get highlight color classes for flag type (for white document area)
 */
export function getFlagHighlightColor(flagType: number): string {
  switch (flagType) {
    case 0: return 'bg-yellow-100 border-b-2 border-yellow-400'; // AI
    case 1: return 'bg-red-100 border-b-2 border-red-400'; // Plagiarism
    default: return 'bg-orange-100 border-b-2 border-orange-400';
  }
}

/**
 * Get dot/marker color for timeline
 */
export function getFlagDotColor(flagType: number): string {
  switch (flagType) {
    case 0: return 'bg-yellow-500'; // AI
    case 1: return 'bg-red-500'; // Plagiarism
    default: return 'bg-orange-500';
  }
}

// ============ Timestamp Helpers ============

/**
 * Format timestamp for display
 */
export function formatSnapshotTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Calculate time difference between two timestamps
 */
export function getTimeDiff(timestamp1: string, timestamp2: string): number {
  return new Date(timestamp2).getTime() - new Date(timestamp1).getTime();
}

// ============ Word Count Helpers ============

/**
 * Count words in content
 */
export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate word count change between snapshots
 */
export function getWordCountDelta(prevContent: string, currentContent: string): number {
  return countWords(currentContent) - countWords(prevContent);
}

// ============ Timeline Marker Generation ============

export interface TimelineMarker {
  index: number;
  timestamp: string;
  isKeyframe: boolean;
  hasFlags: boolean;
  flagTypes: number[];
  position: number; // 0-100 percentage
}

/**
 * Generate timeline markers from snapshots
 */
export function generateTimelineMarkers(snapshots: ReplaySnapshot[]): TimelineMarker[] {
  if (snapshots.length === 0) return [];
  
  return snapshots.map((snap, index) => ({
    index,
    timestamp: snap.timestamp,
    isKeyframe: snap.is_keyframe,
    hasFlags: snap.flags.length > 0,
    flagTypes: [...new Set(snap.flags.map(f => f.flag_type))],
    position: (index / Math.max(1, snapshots.length - 1)) * 100,
  }));
}
