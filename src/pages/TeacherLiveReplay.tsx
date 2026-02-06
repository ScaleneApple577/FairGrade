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
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  FileText,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// TODO: Connect to GET http://localhost:8000/api/files/{file_id}/timeline
// TODO: Connect to GET http://localhost:8000/api/files/{file_id}/snapshot/{event_id}

interface Author {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
  bgColorLight: string;
  dotColor: string;
  cursorColor: string;
}

interface TimelineEvent {
  id: number;
  timestamp: string;
  authorId: string;
  actionType: "added" | "deleted" | "edited" | "formatted" | "comment";
  contentPreview: string;
  wordCountDelta: number;
}

interface DocumentSection {
  id: string;
  authorId: string;
  type: "title" | "heading" | "paragraph";
  content: string;
  appearsAtEvent: number;
}

interface ReplayData {
  fileName: string;
  projectName: string;
  authors: Author[];
  events: TimelineEvent[];
  sections: DocumentSection[];
}

export default function TeacherLiveReplay() {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [replayData, setReplayData] = useState<ReplayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const [activeAuthors, setActiveAuthors] = useState<string[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showCursor, setShowCursor] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/files/{file_id}/timeline
    // fetch(`http://localhost:8000/api/files/${fileId}/timeline`)
    //   .then(res => res.json())
    //   .then(data => { setReplayData(data); setActiveAuthors(data.authors.map(a => a.id)); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, [fileId]);

  const totalEvents = replayData?.events?.length || 0;
  const currentEventData = replayData?.events?.[currentEvent];
  const currentAuthor = replayData?.authors?.find((a) => a.id === currentEventData?.authorId);

  // Cursor blink effect
  useEffect(() => {
    if (isPlaying && replayData) {
      const blinkInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(blinkInterval);
    } else {
      setShowCursor(true);
    }
  }, [isPlaying, replayData]);

  // Calculate cumulative word counts
  const wordCounts = useMemo(() => {
    if (!replayData) return {};
    const counts: Record<string, number> = {};
    replayData.authors.forEach((a) => (counts[a.id] = 0));

    for (let i = 0; i <= currentEvent && i < (replayData.events?.length || 0); i++) {
      const event = replayData.events[i];
      if (event.wordCountDelta > 0) {
        counts[event.authorId] = (counts[event.authorId] || 0) + event.wordCountDelta;
      }
    }

    return counts;
  }, [currentEvent, replayData]);

  // Get visible sections
  const visibleSections = useMemo(() => {
    if (!replayData) return [];
    return replayData.sections.filter((s) => s.appearsAtEvent <= currentEvent + 1);
  }, [currentEvent, replayData]);

  // Playback logic
  useEffect(() => {
    if (isPlaying && replayData) {
      playIntervalRef.current = setInterval(() => {
        setCurrentEvent((prev) => {
          if (prev >= totalEvents - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400 / playbackSpeed);
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
  }, [isPlaying, playbackSpeed, totalEvents, replayData]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || !replayData) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "arrowleft":
          e.preventDefault();
          setCurrentEvent((prev) => Math.max(0, prev - 5));
          break;
        case "arrowright":
          e.preventDefault();
          setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 5));
          break;
        case "j":
          e.preventDefault();
          setCurrentEvent((prev) => Math.max(0, prev - 10));
          break;
        case "l":
          e.preventDefault();
          setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 10));
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
          if (!isPlaying) setCurrentEvent((prev) => Math.max(0, prev - 1));
          break;
        case ".":
          e.preventDefault();
          if (!isPlaying) setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 1));
          break;
        case "?":
          e.preventDefault();
          setShowKeyboardHelp((prev) => !prev);
          break;
        case "escape":
          e.preventDefault();
          setShowKeyboardHelp(false);
          setShowAuthorFilter(false);
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const percent = parseInt(e.key) * 10;
            setCurrentEvent(Math.floor((percent / 100) * (totalEvents - 1)));
          }
          break;
      }
    },
    [totalEvents, isPlaying, replayData]
  );

  const toggleSpeedCycle = () => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
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
    if (!replayData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentEvent(Math.floor(percent * (totalEvents - 1)));
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!replayData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const eventIndex = Math.floor(percent * (totalEvents - 1));
    setHoveredEvent(replayData.events[eventIndex]);
    setHoverPosition(e.clientX - rect.left);
  };

  const progressPercent = replayData ? ((currentEvent + 1) / totalEvents) * 100 : 0;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toggleAuthor = (authorId: string) => {
    setActiveAuthors((prev) =>
      prev.includes(authorId) ? prev.filter((id) => id !== authorId) : [...prev, authorId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
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
          <span className="text-white font-semibold">{replayData?.fileName || "No file loaded"}</span>
          {replayData?.projectName && (
            <span className="bg-white/10 text-slate-400 text-xs px-2.5 py-1 rounded-full">
              {replayData.projectName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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

      {/* Author Legend Bar - Now floating */}
      {replayData && replayData.authors.length > 0 && (
        <div className="fixed top-20 right-6 z-40 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-4">
          {replayData.authors.map((author) => (
            <div key={author.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${author.dotColor}`} />
              <span className="text-gray-600 text-xs">{author.name}</span>
              <span className="text-gray-400 text-xs">({wordCounts[author.id] || 0} words)</span>
            </div>
          ))}
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
            {replayData && visibleSections.length > 0 ? (
              <div className="space-y-4">
                {visibleSections.map((section) => {
                  const author = replayData.authors.find((a) => a.id === section.authorId);
                  const isActive = activeSection === section.id;

                  if (section.type === "title") {
                    return (
                      <div
                        key={section.id}
                        id={`section-${section.id}`}
                        className={`border-l-[3px] pl-4 -ml-4 transition-all duration-500 ${author?.borderColor || "border-l-gray-300"} ${isActive ? author?.bgColorLight : ""}`}
                      >
                        <h1 className="text-2xl font-bold text-gray-900 leading-relaxed relative">
                          {section.content}
                          {isActive && isPlaying && author && (
                            <span className="absolute right-0 top-0 flex items-center gap-1">
                              {showCursor && <span className="w-0.5 h-6" style={{ backgroundColor: author.cursorColor }} />}
                              <span className="text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: author.cursorColor }}>
                                {author.name.split(" ")[0]}
                              </span>
                            </span>
                          )}
                        </h1>
                      </div>
                    );
                  }

                  if (section.type === "heading") {
                    return (
                      <div
                        key={section.id}
                        id={`section-${section.id}`}
                        className={`border-l-[3px] pl-4 -ml-4 mt-8 transition-all duration-500 ${author?.borderColor || "border-l-gray-300"} ${isActive ? author?.bgColorLight : ""}`}
                      >
                        <h2 className="text-lg font-bold text-gray-900 relative">
                          {section.content}
                          {isActive && isPlaying && author && (
                            <span className="absolute right-0 top-0 flex items-center gap-1">
                              {showCursor && <span className="w-0.5 h-5" style={{ backgroundColor: author.cursorColor }} />}
                              <span className="text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: author.cursorColor }}>
                                {author.name.split(" ")[0]}
                              </span>
                            </span>
                          )}
                        </h2>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      className={`border-l-[3px] pl-4 -ml-4 transition-all duration-500 ${author?.borderColor || "border-l-gray-300"} ${isActive ? author?.bgColorLight : ""}`}
                    >
                      <p className="text-[11pt] text-gray-800 leading-relaxed relative">
                        {section.content}
                        {isActive && isPlaying && author && (
                          <span className="absolute right-0 bottom-0 flex items-center gap-1">
                            {showCursor && <span className="w-0.5 h-4" style={{ backgroundColor: author.cursorColor }} />}
                            <span className="text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: author.cursorColor }}>
                              {author.name.split(" ")[0]}
                            </span>
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}

                {/* Captions */}
                {showCaptions && currentEventData && currentAuthor && (
                  <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg max-w-md text-center">
                    {currentAuthor.name} {currentEventData.actionType}: "{currentEventData.contentPreview}"
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[800px]">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No replay data loaded</p>
                  <p className="text-gray-500 text-sm mt-1">Select a file to view its edit history</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
        {/* Progress Scrubber */}
        <div className="h-10 px-6 flex items-center">
          <div
            ref={scrubberRef}
            className="h-1.5 bg-white/10 rounded-full w-full relative cursor-pointer group"
            onClick={handleScrubberClick}
            onMouseMove={handleScrubberHover}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <div
              className="h-1.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
            />

            {/* Event Markers */}
            {replayData?.events?.slice(0, 50).map((event, idx) => {
              const author = replayData.authors.find((a) => a.id === event.authorId);
              const position = ((idx + 1) / totalEvents) * 100;
              return (
                <div
                  key={event.id}
                  className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${author?.dotColor || "bg-white/50"}`}
                  style={{ left: `${position}%` }}
                />
              );
            })}

            {/* Hover Preview */}
            {hoveredEvent && (
              <div
                className="absolute bottom-6 bg-[#1e1e22] border border-white/10 rounded-lg p-2 shadow-xl text-xs transform -translate-x-1/2 whitespace-nowrap"
                style={{ left: hoverPosition }}
              >
                <p className="text-white">{formatTimestamp(hoveredEvent.timestamp)}</p>
                <p className="text-slate-400">
                  {replayData?.authors?.find((a) => a.id === hoveredEvent.authorId)?.name} — {hoveredEvent.actionType}
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
              disabled={!replayData}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setCurrentEvent((prev) => Math.max(0, prev - 10))}
              disabled={!replayData}
              className="text-slate-500 hover:text-white disabled:opacity-50 transition-colors p-2"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 10))}
              disabled={!replayData}
              className="text-slate-500 hover:text-white disabled:opacity-50 transition-colors p-2"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSpeedCycle}
              disabled={!replayData}
              className="bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              {playbackSpeed}x
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <span className="text-slate-400 text-sm font-mono">
              Event {currentEvent + 1} / {totalEvents || 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuthorFilter(!showAuthorFilter)}
              disabled={!replayData}
              className="bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:bg-white/15 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Authors
            </button>

            <button
              onClick={() => setShowCaptions(!showCaptions)}
              disabled={!replayData}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                showCaptions
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/10 text-slate-400 hover:bg-white/15"
              } disabled:opacity-50`}
            >
              CC
            </button>

            {!isPlaying && replayData && (
              <>
                <button
                  onClick={() => setCurrentEvent((prev) => Math.max(0, prev - 1))}
                  className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 1))}
                  className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Author Filter Dropdown */}
      <AnimatePresence>
        {showAuthorFilter && replayData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 right-6 bg-[#1e1e22] border border-white/10 rounded-lg p-4 shadow-xl z-50"
          >
            <p className="text-white text-sm font-semibold mb-3">Filter by Author</p>
            {replayData.authors.map((author) => (
              <label key={author.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/5 px-2 rounded">
                <Checkbox
                  checked={activeAuthors.includes(author.id)}
                  onCheckedChange={() => toggleAuthor(author.id)}
                />
                <div className={`w-3 h-3 rounded-full ${author.dotColor}`} />
                <span className="text-slate-300 text-sm">{author.name}</span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
                  { key: "← / →", desc: "Skip 5 events" },
                  { key: "J / L", desc: "Skip 10 events" },
                  { key: "0-9", desc: "Jump to 0-90%" },
                  { key: "C", desc: "Toggle captions" },
                  { key: "F", desc: "Toggle fullscreen" },
                  { key: "↑ / ↓", desc: "Change speed" },
                  { key: ", / .", desc: "Step frame (when paused)" },
                  { key: "?", desc: "Show this help" },
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
