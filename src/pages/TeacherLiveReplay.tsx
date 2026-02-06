import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";

// TODO: Connect to GET /api/files/{file_id}/timeline — returns timeline events with snapshots
// TODO: Connect to GET /api/files/{file_id}/snapshots/{event_id} — returns document state at specific event
// Response format: { events: [{id, timestamp, author, action, content_delta}], keyframes: [{id, timestamp, full_content}] }

interface Author {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

interface TimelineEvent {
  id: number;
  timestamp: string;
  authorId: string;
  action: "typed" | "deleted" | "formatted" | "comment";
  description: string;
  wordsDelta: number;
}

interface DocumentSection {
  id: string;
  authorId: string;
  content: string;
}

// Mock authors
const mockAuthors: Author[] = [
  { id: "alice", name: "Alice Johnson", color: "text-blue-400", bgColor: "bg-blue-500/10 border-l-2 border-blue-500" },
  { id: "bob", name: "Bob Smith", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-l-2 border-emerald-500" },
  { id: "carol", name: "Carol Williams", color: "text-purple-400", bgColor: "bg-purple-500/10 border-l-2 border-purple-500" },
  { id: "dave", name: "Dave Wilson", color: "text-orange-400", bgColor: "bg-orange-500/10 border-l-2 border-orange-500" },
];

// Generate 230 mock events
const generateMockEvents = (): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  const actions: TimelineEvent["action"][] = ["typed", "typed", "typed", "deleted", "formatted", "comment"];
  const baseDate = new Date("2026-02-01T09:00:00Z");

  for (let i = 0; i < 230; i++) {
    const authorIndex = Math.floor(Math.random() * mockAuthors.length);
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timestamp = new Date(baseDate.getTime() + i * 60000); // 1 minute apart

    let description = "";
    let wordsDelta = 0;

    switch (action) {
      case "typed":
        wordsDelta = Math.floor(Math.random() * 20) + 1;
        description = `Added ${wordsDelta} words`;
        break;
      case "deleted":
        wordsDelta = -(Math.floor(Math.random() * 10) + 1);
        description = `Deleted ${Math.abs(wordsDelta)} words`;
        break;
      case "formatted":
        description = "Applied formatting";
        break;
      case "comment":
        description = "Added a comment";
        break;
    }

    events.push({
      id: i + 1,
      timestamp: timestamp.toISOString(),
      authorId: mockAuthors[authorIndex].id,
      action,
      description,
      wordsDelta,
    });
  }

  return events;
};

// Mock document content sections
const mockDocumentSections: DocumentSection[] = [
  {
    id: "1",
    authorId: "alice",
    content: `<h1>AI Ethics Research Project</h1>
<p>This comprehensive research document explores the multifaceted ethical implications of artificial intelligence in contemporary society. As AI systems become increasingly integrated into our daily lives, from recommendation algorithms to autonomous vehicles, it becomes imperative to examine the moral and societal considerations that accompany this technological revolution.</p>`,
  },
  {
    id: "2",
    authorId: "bob",
    content: `<h2>1. Introduction</h2>
<p>Artificial intelligence has evolved from a theoretical concept to a practical reality that influences decisions in healthcare, finance, criminal justice, and countless other domains. The rapid advancement of machine learning and deep learning techniques has enabled systems that can outperform humans in specific tasks, raising profound questions about the future of work, privacy, and human autonomy.</p>
<p>This paper aims to provide a thorough analysis of the key ethical challenges posed by AI, drawing on philosophical frameworks, case studies, and emerging regulatory approaches.</p>`,
  },
  {
    id: "3",
    authorId: "carol",
    content: `<h2>2. Privacy and Data Rights</h2>
<p>One of the most pressing ethical concerns surrounding AI is the collection, storage, and utilization of personal data. Modern AI systems require vast datasets to train effectively, often harvesting information from users without their explicit understanding of how that data will be used. This raises fundamental questions about consent, data ownership, and the right to privacy in the digital age.</p>
<p>The European Union's General Data Protection Regulation (GDPR) represents one attempt to address these concerns, establishing principles such as the right to explanation and the right to be forgotten.</p>`,
  },
  {
    id: "4",
    authorId: "dave",
    content: `<h2>3. Algorithmic Bias</h2>
<p>AI systems can perpetuate and even amplify existing societal biases present in their training data. Documented cases include facial recognition systems that perform poorly on individuals with darker skin tones, hiring algorithms that discriminate against women, and predictive policing tools that disproportionately target minority communities.</p>
<p>Addressing algorithmic bias requires a multi-pronged approach: diverse development teams, rigorous testing across demographic groups, and ongoing monitoring of deployed systems.</p>`,
  },
  {
    id: "5",
    authorId: "alice",
    content: `<h2>4. Accountability and Transparency</h2>
<p>As AI systems make increasingly consequential decisions, questions of accountability become paramount. When an autonomous vehicle causes an accident, who bears responsibility—the manufacturer, the software developer, or the vehicle owner? The "black box" nature of many machine learning models makes it difficult to explain why specific decisions were made.</p>`,
  },
  {
    id: "6",
    authorId: "bob",
    content: `<h2>5. Conclusion</h2>
<p>The ethical challenges posed by artificial intelligence are complex and multifaceted, requiring ongoing dialogue between technologists, ethicists, policymakers, and the public. As AI continues to evolve, establishing robust ethical guidelines and regulatory frameworks will be essential to ensure these powerful technologies benefit humanity while minimizing potential harms.</p>`,
  },
];

const mockEvents = generateMockEvents();

export default function TeacherLiveReplay() {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [currentEvent, setCurrentEvent] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalEvents = mockEvents.length;
  const currentEventData = mockEvents[currentEvent - 1];
  const currentAuthor = mockAuthors.find((a) => a.id === currentEventData?.authorId);

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentEvent((prev) => {
          if (prev >= totalEvents) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500 / playbackSpeed);
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
  }, [isPlaying, playbackSpeed, totalEvents]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "arrowleft":
          e.preventDefault();
          setCurrentEvent((prev) => Math.max(1, prev - 5));
          break;
        case "arrowright":
          e.preventDefault();
          setCurrentEvent((prev) => Math.min(totalEvents, prev + 5));
          break;
        case "j":
          e.preventDefault();
          setCurrentEvent((prev) => Math.max(1, prev - 10));
          break;
        case "l":
          e.preventDefault();
          setCurrentEvent((prev) => Math.min(totalEvents, prev + 10));
          break;
        case "c":
          e.preventDefault();
          setShowCaptions((prev) => !prev);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "arrowup":
          e.preventDefault();
          setPlaybackSpeed((prev) => Math.min(4, prev * 2));
          break;
        case "arrowdown":
          e.preventDefault();
          setPlaybackSpeed((prev) => Math.max(0.5, prev / 2));
          break;
        case ",":
          e.preventDefault();
          if (!isPlaying) setCurrentEvent((prev) => Math.max(1, prev - 1));
          break;
        case ".":
          e.preventDefault();
          if (!isPlaying) setCurrentEvent((prev) => Math.min(totalEvents, prev + 1));
          break;
        case "?":
          e.preventDefault();
          setShowKeyboardHelp((prev) => !prev);
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const percent = parseInt(e.key) * 10;
            setCurrentEvent(Math.max(1, Math.floor((percent / 100) * totalEvents)));
          }
          break;
      }
    },
    [totalEvents, isPlaying]
  );

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
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentEvent(Math.max(1, Math.round(percent * totalEvents)));
  };

  const progressPercent = (currentEvent / totalEvents) * 100;

  // Calculate visible sections based on current event
  const visibleSectionCount = Math.min(
    mockDocumentSections.length,
    Math.ceil((currentEvent / totalEvents) * mockDocumentSections.length) + 1
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0a0a] flex flex-col"
    >
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 h-14 px-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/teacher/live-monitor")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Live Monitor</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white font-medium">Report.docx</span>
          <span className="bg-white/10 text-slate-400 text-xs px-2 py-0.5 rounded-full">
            CS 101 Final Project
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Document Viewer */}
      <div className="flex-1 bg-[#1a1a1a] overflow-auto pt-14 pb-32 px-8">
        {/* Author Legend */}
        <div className="max-w-4xl mx-auto mt-6 mb-4 flex items-center gap-4 justify-end">
          {mockAuthors.map((author) => (
            <div key={author.id} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${author.bgColor.split(" ")[0].replace("/10", "")}`}
              />
              <span className="text-slate-400 text-xs">{author.name}</span>
            </div>
          ))}
        </div>

        {/* Document Content */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl max-w-4xl mx-auto min-h-[600px] p-8 relative">
          {mockDocumentSections.slice(0, visibleSectionCount).map((section) => {
            const author = mockAuthors.find((a) => a.id === section.authorId);
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg ${author?.bgColor}`}
              >
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </motion.div>
            );
          })}

          {/* Author Captions Overlay */}
          <AnimatePresence>
            {showCaptions && currentAuthor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 bg-black/80 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <div
                  className={`w-2 h-2 rounded-full ${currentAuthor.bgColor.split(" ")[0].replace("/10", "")}`}
                />
                <span className={currentAuthor.color}>{currentAuthor.name}</span>
                <span className="text-slate-400">—</span>
                <span className="text-slate-300">{currentEventData?.description}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timeline Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 p-4">
        {/* Timeline Scrubber */}
        <div
          className="relative h-2 bg-white/10 rounded-full cursor-pointer group mb-4"
          onClick={handleScrubberClick}
        >
          {/* Event markers */}
          {mockEvents.filter((_, i) => i % 10 === 0).map((event) => {
            const author = mockAuthors.find((a) => a.id === event.authorId);
            const position = (event.id / totalEvents) * 100;
            return (
              <div
                key={event.id}
                className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${author?.bgColor.split(" ")[0].replace("/10", "")} opacity-50`}
                style={{ left: `${position}%` }}
              />
            );
          })}

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scrubber handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <div className="relative">
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-lg appearance-none cursor-pointer hover:bg-white/15 transition-colors pr-6"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>

            <button
              onClick={() => setCurrentEvent((prev) => Math.max(1, prev - 10))}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Skip back 10 events (J)"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentEvent((prev) => Math.min(totalEvents, prev + 10))}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Skip forward 10 events (L)"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Center - Current Position */}
          <div className="text-slate-400 text-sm">
            Event {currentEvent} of {totalEvents}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCaptions((prev) => !prev)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                showCaptions
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-white/10 text-slate-400 hover:text-white"
              }`}
              title="Toggle captions (C)"
            >
              CC
            </button>

            <button
              onClick={() => !isPlaying && setCurrentEvent((prev) => Math.max(1, prev - 1))}
              disabled={isPlaying}
              className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous frame (,)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => !isPlaying && setCurrentEvent((prev) => Math.min(totalEvents, prev + 1))}
              disabled={isPlaying}
              className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next frame (.)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                <ShortcutRow keys={["Space", "K"]} label="Play / Pause" />
                <ShortcutRow keys={["←", "→"]} label="Skip 5 events" />
                <ShortcutRow keys={["J", "L"]} label="Skip 10 events" />
                <ShortcutRow keys={["0-9"]} label="Jump to 0-90%" />
                <ShortcutRow keys={["↑", "↓"]} label="Change speed" />
                <ShortcutRow keys={[",", "."]} label="Frame by frame" />
                <ShortcutRow keys={["C"]} label="Toggle captions" />
                <ShortcutRow keys={["F"]} label="Fullscreen" />
                <ShortcutRow keys={["?"]} label="Show shortcuts" />
              </div>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="mt-6 w-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="px-2 py-1 bg-white/10 text-slate-300 rounded border border-white/10 font-mono text-xs"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-slate-400 text-sm">{label}</span>
    </div>
  );
}
