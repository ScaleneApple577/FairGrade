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
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// TODO: Connect to GET /api/files/{file_id}/timeline
// TODO: Connect to GET /api/files/{file_id}/snapshot/{event_id}

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

// Mock authors with distinct colors
const mockAuthors: Author[] = [
  {
    id: "alice",
    name: "Alice Johnson",
    color: "text-blue-600",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/5",
    bgColorLight: "bg-blue-50",
    dotColor: "bg-blue-500",
    cursorColor: "#3b82f6",
  },
  {
    id: "bob",
    name: "Bob Smith",
    color: "text-emerald-600",
    borderColor: "border-l-emerald-500",
    bgColor: "bg-emerald-500/5",
    bgColorLight: "bg-emerald-50",
    dotColor: "bg-emerald-500",
    cursorColor: "#10b981",
  },
  {
    id: "carol",
    name: "Carol Williams",
    color: "text-purple-600",
    borderColor: "border-l-purple-500",
    bgColor: "bg-purple-500/5",
    bgColorLight: "bg-purple-50",
    dotColor: "bg-purple-500",
    cursorColor: "#a855f7",
  },
  {
    id: "dave",
    name: "Dave Wilson",
    color: "text-orange-600",
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-500/5",
    bgColorLight: "bg-orange-50",
    dotColor: "bg-orange-500",
    cursorColor: "#f97316",
  },
];

// Generate 230 mock events
const generateMockEvents = (): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  const baseDate = new Date("2026-01-15T09:00:00Z");

  const authorDistribution = [
    ...Array(80).fill("alice"),
    ...Array(60).fill("bob"),
    ...Array(55).fill("carol"),
    ...Array(35).fill("dave"),
  ];

  for (let i = authorDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [authorDistribution[i], authorDistribution[j]] = [authorDistribution[j], authorDistribution[i]];
  }

  const actionTypes: TimelineEvent["actionType"][] = ["added", "added", "added", "edited", "deleted", "formatted", "comment"];
  const contentPreviews = [
    "The implications of this research...",
    "AI systems have shown remarkable...",
    "Privacy concerns are paramount...",
    "Data protection regulations...",
    "Machine learning algorithms...",
    "Ethical considerations include...",
    "The study demonstrates that...",
    "Further analysis reveals...",
    "In conclusion, we find...",
    "This evidence suggests...",
  ];

  for (let i = 0; i < 230; i++) {
    const timestamp = new Date(baseDate.getTime() + Math.random() * 21 * 24 * 60 * 60 * 1000);
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];

    let wordCountDelta = 0;
    let contentPreview = "";

    switch (actionType) {
      case "added":
        wordCountDelta = Math.floor(Math.random() * 50) + 5;
        contentPreview = contentPreviews[Math.floor(Math.random() * contentPreviews.length)];
        break;
      case "deleted":
        wordCountDelta = -(Math.floor(Math.random() * 20) + 1);
        contentPreview = "Removed redundant text";
        break;
      case "edited":
        wordCountDelta = Math.floor(Math.random() * 10) - 5;
        contentPreview = "Revised paragraph structure";
        break;
      case "formatted":
        contentPreview = "Applied heading style";
        break;
      case "comment":
        contentPreview = "Added review comment";
        break;
    }

    events.push({
      id: i + 1,
      timestamp: timestamp.toISOString(),
      authorId: authorDistribution[i],
      actionType,
      contentPreview,
      wordCountDelta,
    });
  }

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  events.forEach((e, idx) => (e.id = idx + 1));

  return events;
};

const mockDocumentSections: DocumentSection[] = [
  { id: "title", authorId: "alice", type: "title", content: "AI Ethics Research Project", appearsAtEvent: 1 },
  { id: "intro-heading", authorId: "bob", type: "heading", content: "1. Introduction", appearsAtEvent: 15 },
  { id: "intro-p1", authorId: "bob", type: "paragraph", content: "Artificial intelligence has evolved from a theoretical concept to a practical reality that influences decisions in healthcare, finance, criminal justice, and countless other domains. The rapid advancement of machine learning and deep learning techniques has enabled systems that can outperform humans in specific tasks, raising profound questions about the future of work, privacy, and human autonomy.", appearsAtEvent: 25 },
  { id: "intro-p2", authorId: "bob", type: "paragraph", content: "This paper aims to provide a thorough analysis of the key ethical challenges posed by AI, drawing on philosophical frameworks, case studies, and emerging regulatory approaches. We examine both the promises and perils of artificial intelligence in modern society.", appearsAtEvent: 40 },
  { id: "privacy-heading", authorId: "carol", type: "heading", content: "2. Privacy and Data Rights", appearsAtEvent: 55 },
  { id: "privacy-p1", authorId: "carol", type: "paragraph", content: "One of the most pressing ethical concerns surrounding AI is the collection, storage, and utilization of personal data. Modern AI systems require vast datasets to train effectively, often harvesting information from users without their explicit understanding of how that data will be used. This raises fundamental questions about consent, data ownership, and the right to privacy in the digital age.", appearsAtEvent: 70 },
  { id: "privacy-p2", authorId: "carol", type: "paragraph", content: "The European Union's General Data Protection Regulation (GDPR) represents one attempt to address these concerns, establishing principles such as the right to explanation and the right to be forgotten. However, enforcement remains challenging in our globally connected world.", appearsAtEvent: 90 },
  { id: "bias-heading", authorId: "alice", type: "heading", content: "3. Algorithmic Bias", appearsAtEvent: 110 },
  { id: "bias-p1", authorId: "alice", type: "paragraph", content: "AI systems can perpetuate and even amplify existing societal biases present in their training data. Documented cases include facial recognition systems that perform poorly on individuals with darker skin tones, hiring algorithms that discriminate against women, and predictive policing tools that disproportionately target minority communities.", appearsAtEvent: 125 },
  { id: "bias-p2", authorId: "alice", type: "paragraph", content: "Addressing algorithmic bias requires a multi-pronged approach: diverse development teams, rigorous testing across demographic groups, and ongoing monitoring of deployed systems. Transparency in AI decision-making is essential for accountability.", appearsAtEvent: 145 },
  { id: "autonomous-heading", authorId: "dave", type: "heading", content: "4. Autonomous Systems", appearsAtEvent: 160 },
  { id: "autonomous-p1", authorId: "dave", type: "paragraph", content: "As AI systems gain the ability to make autonomous decisions—from self-driving cars to automated weapons systems—questions of accountability become increasingly complex. When an autonomous vehicle causes an accident, who bears responsibility: the manufacturer, the software developer, or the vehicle owner? These questions challenge our existing legal and ethical frameworks.", appearsAtEvent: 175 },
  { id: "regulatory-heading", authorId: "carol", type: "heading", content: "5. Regulatory Frameworks", appearsAtEvent: 190 },
  { id: "regulatory-p1", authorId: "carol", type: "paragraph", content: "Governments worldwide are grappling with how to regulate AI development and deployment. The EU's AI Act represents the most comprehensive attempt to date, classifying AI systems by risk level and imposing corresponding requirements. The United States has taken a more sector-specific approach, while China has focused on algorithmic transparency.", appearsAtEvent: 205 },
  { id: "conclusion-heading", authorId: "bob", type: "heading", content: "6. Conclusion", appearsAtEvent: 215 },
  { id: "conclusion-p1", authorId: "bob", type: "paragraph", content: "The ethical challenges posed by artificial intelligence are complex and multifaceted, requiring ongoing dialogue between technologists, ethicists, policymakers, and the public. As AI continues to evolve, establishing robust ethical guidelines and regulatory frameworks will be essential to ensure these powerful technologies benefit humanity while minimizing potential harms.", appearsAtEvent: 225 },
];

const mockEvents = generateMockEvents();

export default function TeacherLiveReplay() {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [currentEvent, setCurrentEvent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const [activeAuthors, setActiveAuthors] = useState<string[]>(mockAuthors.map((a) => a.id));
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showCursor, setShowCursor] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const totalEvents = mockEvents.length;
  const currentEventData = mockEvents[currentEvent];
  const currentAuthor = mockAuthors.find((a) => a.id === currentEventData?.authorId);

  // Cursor blink effect
  useEffect(() => {
    if (isPlaying) {
      const blinkInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(blinkInterval);
    } else {
      setShowCursor(true);
    }
  }, [isPlaying]);

  // Calculate cumulative word counts
  const wordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAuthors.forEach((a) => (counts[a.id] = 0));

    for (let i = 0; i <= currentEvent && i < mockEvents.length; i++) {
      const event = mockEvents[i];
      if (event.wordCountDelta > 0) {
        counts[event.authorId] = (counts[event.authorId] || 0) + event.wordCountDelta;
      }
    }

    return counts;
  }, [currentEvent]);

  // Get visible sections
  const visibleSections = useMemo(() => {
    return mockDocumentSections.filter((s) => s.appearsAtEvent <= currentEvent + 1);
  }, [currentEvent]);

  // Track active section
  useEffect(() => {
    const latestSection = [...mockDocumentSections]
      .filter((s) => s.appearsAtEvent <= currentEvent + 1)
      .sort((a, b) => b.appearsAtEvent - a.appearsAtEvent)[0];

    if (latestSection && latestSection.appearsAtEvent === currentEvent + 1) {
      setActiveSection(latestSection.id);
      setTimeout(() => {
        const element = document.getElementById(`section-${latestSection.id}`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (latestSection?.appearsAtEvent !== currentEvent + 1) {
      setActiveSection(null);
    }
  }, [currentEvent]);

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
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
        case "arrowup":
          e.preventDefault();
          cycleSpeed(1);
          break;
        case "arrowdown":
          e.preventDefault();
          cycleSpeed(-1);
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
    [totalEvents, isPlaying]
  );

  const cycleSpeed = (direction: 1 | -1) => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const newIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + direction));
    setPlaybackSpeed(speeds[newIndex]);
  };

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
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentEvent(Math.floor(percent * (totalEvents - 1)));
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const eventIndex = Math.floor(percent * (totalEvents - 1));
    setHoveredEvent(mockEvents[eventIndex]);
    setHoverPosition(e.clientX - rect.left);
  };

  const progressPercent = ((currentEvent + 1) / totalEvents) * 100;

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

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 h-14 px-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">Research_Report.docx</span>
          <span className="bg-white/10 text-slate-400 text-xs px-2.5 py-1 rounded-full">
            CS 101 Final Project
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 text-slate-500 hover:text-white transition-colors"
            title="Keyboard shortcuts (?)"
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

      {/* Main Document Viewer - Google Docs Style */}
      <div ref={documentRef} className="flex-1 bg-[#f0f0f0] overflow-y-auto pt-14 pb-36">
        {/* Page Ruler */}
        <div className="bg-white border-b border-gray-200 h-6 flex items-center justify-center sticky top-0 z-30">
          <div className="w-full max-w-[816px] px-[72px] flex items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((inch) => (
              <div key={inch} className="flex-1 flex items-center">
                <span className="text-[9px] text-gray-400">{inch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Google Docs Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center gap-1 sticky top-6 z-30">
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
            B
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 italic text-sm">
            I
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 underline text-sm">
            U
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button className="bg-transparent border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-50">
            Arial ▾
          </button>
          <button className="bg-transparent border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-50 ml-1">
            11 ▾
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 text-sm underline decoration-2">
            A
          </button>
          <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <Highlighter className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
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
        <div className="flex justify-center py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-sm w-full max-w-[816px] min-h-[1056px] px-[72px] py-[96px] relative"
            style={{ fontFamily: "'Arial', sans-serif" }}
          >
            {/* Author Legend - Floating Pill */}
            <div className="absolute top-4 right-4 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-4 z-20">
              {mockAuthors.map((author) => (
                <div key={author.id} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${author.dotColor}`} />
                  <span className="text-gray-600 text-xs">{author.name.split(" ")[0]}</span>
                  <span className="text-gray-400 text-xs">({wordCounts[author.id] || 0})</span>
                </div>
              ))}
            </div>

            {visibleSections.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                <p className="text-center">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 mx-1 text-sm">Space</kbd> to start playback
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleSections.map((section) => {
                  const author = mockAuthors.find((a) => a.id === section.authorId);
                  const isActive = activeSection === section.id;

                  return (
                    <motion.div
                      key={section.id}
                      id={`section-${section.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`pl-3 border-l-[3px] ${author?.borderColor} transition-all duration-500 relative ${
                        isActive ? author?.bgColorLight : ""
                      }`}
                    >
                      {section.type === "title" && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{section.content}</h1>
                      )}
                      {section.type === "heading" && (
                        <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">{section.content}</h2>
                      )}
                      {section.type === "paragraph" && (
                        <p className="text-gray-800 text-[11pt] leading-relaxed">{section.content}</p>
                      )}

                      {/* Cursor simulation for active section */}
                      {isActive && isPlaying && showCursor && author && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <div
                            className="w-0.5 h-5 rounded-full animate-pulse"
                            style={{ backgroundColor: author.cursorColor }}
                          />
                          <span
                            className="text-white text-xs px-2 py-0.5 rounded whitespace-nowrap"
                            style={{ backgroundColor: author.cursorColor }}
                          >
                            {author.name.split(" ")[0]}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Author Captions Overlay */}
            <AnimatePresence>
              {showCaptions && currentEventData && currentAuthor && visibleSections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed bottom-40 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg flex items-center gap-3 max-w-md text-center z-40"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${currentAuthor.dotColor} flex-shrink-0`} />
                  <span className={`font-medium ${currentAuthor.color}`}>{currentAuthor.name}</span>
                  <span className="text-slate-300">
                    {currentEventData.actionType === "added" && `typed: "${currentEventData.contentPreview}"`}
                    {currentEventData.actionType === "deleted" && "deleted text"}
                    {currentEventData.actionType === "edited" && "revised text"}
                    {currentEventData.actionType === "formatted" && "applied formatting"}
                    {currentEventData.actionType === "comment" && "added a comment"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Timeline Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
        {/* Progress Scrubber */}
        <div className="h-10 px-6 flex items-center relative">
          <div
            ref={scrubberRef}
            className="h-1.5 bg-white/10 rounded-full w-full relative cursor-pointer group"
            onClick={handleScrubberClick}
            onMouseMove={handleScrubberHover}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            {/* Event markers */}
            {mockEvents
              .filter((_, i) => i % 5 === 0)
              .map((event) => {
                const author = mockAuthors.find((a) => a.id === event.authorId);
                const position = ((event.id - 1) / (totalEvents - 1)) * 100;
                return (
                  <div
                    key={event.id}
                    className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${author?.dotColor} opacity-40`}
                    style={{ left: `${position}%` }}
                  />
                );
              })}

            {/* Progress fill */}
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full shadow-sm shadow-blue-500/50 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Playhead */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>

          {/* Hover Preview */}
          <AnimatePresence>
            {hoveredEvent && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-10 bg-[#1e1e22] border border-white/10 rounded-lg p-2.5 shadow-xl pointer-events-none"
                style={{ left: Math.max(80, Math.min(hoverPosition, window.innerWidth - 200)) }}
              >
                <p className="text-slate-400 text-xs mb-1">{formatTimestamp(hoveredEvent.timestamp)}</p>
                <p className="text-white text-sm font-medium">
                  {mockAuthors.find((a) => a.id === hoveredEvent.authorId)?.name}
                </p>
                <p className="text-slate-500 text-xs capitalize">
                  {hoveredEvent.actionType} {hoveredEvent.wordCountDelta > 0 ? `${hoveredEvent.wordCountDelta} words` : ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Row */}
        <div className="h-14 px-6 flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>

            <button
              onClick={() => setCurrentEvent((prev) => Math.max(0, prev - 10))}
              className="p-2 text-slate-500 hover:text-white transition-colors"
              title="Skip back 10 events (J)"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 10))}
              className="p-2 text-slate-500 hover:text-white transition-colors"
              title="Skip forward 10 events (L)"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleSpeedCycle}
              className="bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors font-medium min-w-[48px]"
            >
              {playbackSpeed}x
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <span className="text-slate-400 text-sm font-mono">
              Event {currentEvent + 1} / {totalEvents}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Author Filter */}
            <div className="relative">
              <button
                onClick={() => setShowAuthorFilter((prev) => !prev)}
                className={`flex items-center gap-2 bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors ${
                  showAuthorFilter ? "bg-white/15" : ""
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Authors</span>
              </button>

              <AnimatePresence>
                {showAuthorFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full mb-2 right-0 bg-[#1e1e22] border border-white/10 rounded-xl p-3 shadow-xl min-w-[200px]"
                  >
                    <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">Highlight Authors</p>
                    {mockAuthors.map((author) => (
                      <label
                        key={author.id}
                        className="flex items-center gap-3 py-2 px-2 hover:bg-white/5 rounded-lg cursor-pointer"
                      >
                        <Checkbox
                          checked={activeAuthors.includes(author.id)}
                          onCheckedChange={() => toggleAuthor(author.id)}
                        />
                        <div className={`w-2.5 h-2.5 rounded-full ${author.dotColor}`} />
                        <span className="text-slate-300 text-sm">{author.name}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Captions Toggle */}
            <button
              onClick={() => setShowCaptions((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showCaptions
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/10 text-slate-400 hover:text-white"
              }`}
              title="Toggle captions (C)"
            >
              CC
            </button>

            {/* Frame Step Buttons */}
            {!isPlaying && (
              <>
                <button
                  onClick={() => setCurrentEvent((prev) => Math.max(0, prev - 1))}
                  className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  title="Previous frame (,)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentEvent((prev) => Math.min(totalEvents - 1, prev + 1))}
                  className="bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  title="Next frame (.)"
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl font-bold">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="p-1 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
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
                className="mt-6 w-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
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
    <div className="flex items-center justify-between py-1.5">
      <div className="flex gap-1.5">
        {keys.map((key) => (
          <kbd
            key={key}
            className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-md border border-white/10 font-mono text-xs min-w-[28px] text-center"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-slate-400 text-sm">{label}</span>
    </div>
  );
}
