import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  X,
  Users,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  FileText,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useReplayData } from "@/hooks/useReplayData";
import {
  getFlagTypeLabel,
  getFlagHighlightColor,
  getFlagDotColor,
  formatSnapshotTimestamp,
  countWords,
  generateTimelineMarkers,
  type ReplaySnapshot,
  type ReplayFlag,
} from "@/lib/replayUtils";

export default function TeacherLiveReplay() {
  // Route now includes projectId: /teacher/live-replay/:projectId/:fileId
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();

  // Use the new hook that fetches from backend
  const {
    snapshots,
    sessions,
    fileName,
    loading: isLoading,
    error,
    totalSnapshots,
    fetchReplay,
  } = useReplayData(projectId, fileId);

  // Playback state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSessionFilter, setShowSessionFilter] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<ReplayFlag | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  // Current snapshot
  const currentSnapshot = snapshots[currentIndex] || null;
  const totalEvents = snapshots.length;

  // Word count for current snapshot
  const currentWordCount = useMemo(() => {
    if (!currentSnapshot) return 0;
    return countWords(currentSnapshot.content);
  }, [currentSnapshot]);

  // Timeline markers
  const timelineMarkers = useMemo(() => {
    return generateTimelineMarkers(snapshots);
  }, [snapshots]);

  // Cursor blink effect
  useEffect(() => {
    if (isPlaying && snapshots.length > 0) {
      const blinkInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(blinkInterval);
    } else {
      setShowCursor(true);
    }
  }, [isPlaying, snapshots.length]);

  // Playback logic - advance through snapshots
  useEffect(() => {
    if (isPlaying && snapshots.length > 0) {
      // Calculate delay based on playback speed
      const baseDelay = 300; // Base milliseconds per snapshot
      const delay = baseDelay / playbackSpeed;

      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= totalEvents - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalEvents, snapshots.length]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || snapshots.length === 0) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "arrowleft":
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(0, prev - 1));
          break;
        case "arrowright":
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(totalEvents - 1, prev + 1));
          break;
        case "j":
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(0, prev - 3));
          break;
        case "l":
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(totalEvents - 1, prev + 3));
          break;
        case "c":
          e.preventDefault();
          setShowCaptions((prev) => !prev);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case ",":
          e.preventDefault();
          if (!isPlaying) setCurrentIndex((prev) => Math.max(0, prev - 1));
          break;
        case ".":
          e.preventDefault();
          if (!isPlaying) setCurrentIndex((prev) => Math.min(totalEvents - 1, prev + 1));
          break;
        case "?":
          e.preventDefault();
          setShowKeyboardHelp((prev) => !prev);
          break;
        case "escape":
          e.preventDefault();
          setShowKeyboardHelp(false);
          setShowSessionFilter(false);
          setSelectedFlag(null);
          break;
        case "arrowup":
          e.preventDefault();
          cycleSpeed(1);
          break;
        case "arrowdown":
          e.preventDefault();
          cycleSpeed(-1);
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const percent = parseInt(e.key) * 10;
            setCurrentIndex(Math.floor((percent / 100) * Math.max(0, totalEvents - 1)));
          }
          break;
      }
    },
    [totalEvents, isPlaying, snapshots.length]
  );

  const cycleSpeed = (direction: number) => {
    const speeds = [0.5, 1, 2, 4];
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextIdx = Math.max(0, Math.min(speeds.length - 1, currentIdx + direction));
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const toggleSpeedCycle = () => {
    const speeds = [0.5, 1, 2, 4];
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (snapshots.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentIndex(Math.floor(percent * Math.max(0, totalEvents - 1)));
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (snapshots.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const eventIdx = Math.floor(percent * Math.max(0, totalEvents - 1));
    setHoveredIndex(eventIdx);
    setHoverPosition(e.clientX - rect.left);
  };

  const progressPercent = totalEvents > 0 ? ((currentIndex + 1) / totalEvents) * 100 : 0;

  // Handle session selection
  const handleSessionSelect = (sessionId: string | null) => {
    setSelectedSessionId(sessionId);
    setCurrentIndex(0);
    setIsPlaying(false);
    if (sessionId) {
      fetchReplay({ sessionId });
    } else {
      fetchReplay();
    }
  };

  // Render document content with flag highlighting
  const renderDocumentContent = (snapshot: ReplaySnapshot) => {
    const content = snapshot.content;
    const flags = snapshot.flags;

    if (flags.length === 0) {
      // No flags, just render plain content
      return (
        <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
          {content}
        </div>
      );
    }

    // Sort flags by position
    const sortedFlags = [...flags].sort((a, b) => a.start_pos - b.start_pos);

    // Build segments with flag highlighting
    const segments: JSX.Element[] = [];
    let lastEnd = 0;

    sortedFlags.forEach((flag, idx) => {
      // Add text before this flag
      if (flag.start_pos > lastEnd) {
        segments.push(
          <span key={`text-${idx}`}>
            {content.slice(lastEnd, flag.start_pos)}
          </span>
        );
      }

      // Add flagged text with highlight
      const highlightClass = getFlagHighlightColor(flag.flag_type);
      segments.push(
        <span
          key={`flag-${flag.flag_id}`}
          className={`${highlightClass} cursor-pointer relative`}
          onClick={() => setSelectedFlag(flag)}
          title={`${getFlagTypeLabel(flag.flag_type)} - ${Math.round(flag.confidence * 100)}% confidence`}
        >
          {content.slice(flag.start_pos, flag.end_pos)}
        </span>
      );

      lastEnd = flag.end_pos;
    });

    // Add remaining text
    if (lastEnd < content.length) {
      segments.push(
        <span key="text-end">{content.slice(lastEnd)}</span>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
        {segments}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading replay data...</p>
          <p className="text-slate-500 text-xs mt-1">Decompressing snapshots...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Failed to load replay data</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchReplay()}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 h-14 px-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">{fileName || "No file loaded"}</span>
          <span className="bg-white/10 text-slate-400 text-xs px-2.5 py-1 rounded-full">
            {totalSnapshots} snapshots
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Session Filter */}
          {sessions.length > 0 && (
            <select
              value={selectedSessionId || ""}
              onChange={(e) => handleSessionSelect(e.target.value || null)}
              className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5"
            >
              <option value="">All Sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  Session: {session.id}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 text-slate-500 hover:text-white transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Info Bar - Floating */}
      {currentSnapshot && (
        <div className="fixed top-20 right-6 z-40 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs">Words:</span>
            <span className="text-gray-900 text-sm font-medium">{currentWordCount}</span>
          </div>
          {currentSnapshot.flags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-xs">Flags:</span>
              <span className="text-red-900 text-sm font-medium">{currentSnapshot.flags.length}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">
              {formatSnapshotTimestamp(currentSnapshot.timestamp)}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area - Google Docs Style */}
      <div className="flex-1 mt-14 mb-24 bg-[#f0f0f0] overflow-y-auto">
        {/* Ruler */}
        <div className="bg-white border-b border-gray-200 h-6 flex items-center px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((inch) => (
            <div key={inch} className="flex-1 border-r border-gray-300 text-gray-400 text-[9px] text-center">
              {inch}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center gap-1 sticky top-0 z-10">
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
            B
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 italic">
            I
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 underline">
            U
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button className="bg-transparent border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700">
            Arial ▾
          </button>
          <button className="bg-transparent border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700">
            11 ▾
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            A̲
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <Highlighter className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Document Page */}
        <div className="max-w-[816px] mx-auto my-6">
          <div
            ref={documentRef}
            className="bg-white shadow-md rounded-sm px-[72px] py-[96px] min-h-[1056px]"
            style={{ fontFamily: "'Arial', sans-serif" }}
          >
            {currentSnapshot ? (
              <div>
                {renderDocumentContent(currentSnapshot)}

                {/* Captions */}
                {showCaptions && currentSnapshot.is_keyframe && (
                  <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg max-w-md text-center">
                    Keyframe snapshot — {formatSnapshotTimestamp(currentSnapshot.timestamp)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[800px]">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No replay data available</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Replay data is recorded when students edit the document
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flag Popover */}
      <AnimatePresence>
        {selectedFlag && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedFlag.flag_type === 0 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {getFlagTypeLabel(selectedFlag.flag_type)}
              </span>
              <button
                onClick={() => setSelectedFlag(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-700 text-sm mb-2">
              <strong>Confidence:</strong> {Math.round(selectedFlag.confidence * 100)}%
            </p>
            <p className="text-gray-600 text-sm border-l-2 border-gray-200 pl-3 italic">
              "{selectedFlag.flagged_text.slice(0, 100)}{selectedFlag.flagged_text.length > 100 ? '...' : ''}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Timeline Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
        {/* Progress Scrubber */}
        <div className="h-10 px-6 flex items-center">
          <div
            ref={scrubberRef}
            className="h-1.5 bg-white/10 rounded-full w-full relative cursor-pointer group"
            onClick={handleScrubberClick}
            onMouseMove={handleScrubberHover}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="h-1.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
            />

            {/* Timeline Markers - Show keyframes and flags */}
            {timelineMarkers.slice(0, 100).map((marker) => (
              <div
                key={marker.index}
                className={`absolute top-1/2 -translate-y-1/2 rounded-full ${
                  marker.hasFlags
                    ? `w-2 h-2 ${getFlagDotColor(marker.flagTypes[0] ?? 0)}`
                    : marker.isKeyframe
                    ? "w-1.5 h-1.5 bg-blue-400"
                    : "w-1 h-1 bg-white/30"
                }`}
                style={{ left: `${marker.position}%` }}
              />
            ))}

            {/* Hover Preview */}
            {hoveredIndex !== null && snapshots[hoveredIndex] && (
              <div
                className="absolute bottom-6 bg-[#1e1e22] border border-white/10 rounded-lg p-2 shadow-xl text-xs transform -translate-x-1/2 whitespace-nowrap"
                style={{ left: hoverPosition }}
              >
                <p className="text-white">{formatSnapshotTimestamp(snapshots[hoveredIndex].timestamp)}</p>
                <p className="text-slate-400">
                  {snapshots[hoveredIndex].is_keyframe ? "Keyframe" : "Diff"} — 
                  {snapshots[hoveredIndex].flags.length} flags
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="h-14 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={snapshots.length === 0}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 10))}
              disabled={snapshots.length === 0}
              className="text-slate-500 hover:text-white disabled:opacity-50 transition-colors p-2"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalEvents - 1, prev + 10))}
              disabled={snapshots.length === 0}
              className="text-slate-500 hover:text-white disabled:opacity-50 transition-colors p-2"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSpeedCycle}
              disabled={snapshots.length === 0}
              className="bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              {playbackSpeed}x
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <span className="text-slate-400 text-sm font-mono">
              Snapshot {currentIndex + 1} / {totalEvents || 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              disabled={snapshots.length === 0}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                showCaptions
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/10 text-slate-400 hover:bg-white/15"
              } disabled:opacity-50`}
            >
              CC
            </button>

            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            >
              ?
            </button>

            {!isPlaying && snapshots.length > 0 && (
              <>
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalEvents - 1, prev + 1))}
                  className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl font-bold">Keyboard Shortcuts</h3>
                <button onClick={() => setShowKeyboardHelp(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { key: "Space / K", desc: "Play / Pause" },
                  { key: "← / →", desc: "Previous / Next snapshot" },
                  { key: "J / L", desc: "Skip 3 snapshots" },
                  { key: "0-9", desc: "Jump to 0-90%" },
                  { key: "C", desc: "Toggle captions" },
                  { key: "F", desc: "Toggle fullscreen" },
                  { key: "↑ / ↓", desc: "Change speed" },
                  { key: ", / .", desc: "Step frame (when paused)" },
                  { key: "?", desc: "Show this help" },
                  { key: "Esc", desc: "Close dialogs" },
                ].map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center gap-4">
                    <kbd className="bg-white/10 text-white text-xs font-mono px-2 py-1 rounded min-w-[80px] text-center">
                      {shortcut.key}
                    </kbd>
                    <span className="text-slate-400 text-sm">{shortcut.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
