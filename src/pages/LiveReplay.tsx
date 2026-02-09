import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  X, Download, Play, Pause, SkipBack, SkipForward, 
  Maximize, Clock, Circle, Plus, Minus, FileText,
  LayoutDashboard, FolderOpen, Users, BarChart3, Activity,
  Settings, LogOut, ChevronRight, Table, Presentation, Search,
  HelpCircle, FastForward, Rewind, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

// Helper component for keyboard shortcut rows
const ShortcutRow = ({ keys, description }: { keys: string[], description: string }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex gap-2">
      {keys.map(key => (
        <kbd key={key} className="px-2 py-1 bg-slate-700 text-white rounded border border-slate-600 font-mono text-xs">
          {key}
        </kbd>
      ))}
    </div>
    <span className="text-slate-300 text-sm">{description}</span>
  </div>
);
 
 interface TimelineEvent {
   id: string;
   type: "keyframe" | "diff";
   timestamp: string;
   seconds_from_start: number;
   content: string;
   word_count: number;
   changes_summary: string;
   added_words: number;
   removed_words: number;
   author?: {
     id: string;
     name: string;
     avatar: string;
     role: string;
   } | null;
 }
 
 interface Author {
   id: string;
   name: string;
   avatar: string;
 }
 
  interface Project {
    id: string;
    name: string;
    course: string;
    status: "healthy" | "needs_attention" | "at_risk";
    studentCount: number;
    fileCount: number;
    lastActivity: string;
  }

  interface TrackedFile {
    id: string;
    name: string;
    type: "google_doc" | "google_sheet" | "google_slide";
    lastModified: string;
    snapshotCount: number;
    editCount: number;
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "All Projects", path: "/teacher/projects" },
    { icon: Users, label: "Students", path: "/teacher/students" },
    { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
    { icon: Activity, label: "Live Monitor", path: "/teacher/live-monitor" },
    { icon: FileText, label: "Reports", path: "/teacher/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  // Mock projects data
  const mockProjects: Project[] = [
    { id: "p1", name: "AI Ethics Research Project", course: "CS 101", status: "healthy", studentCount: 4, fileCount: 3, lastActivity: "2 hours ago" },
    { id: "p2", name: "Marketing Strategy Analysis", course: "Business 201", status: "needs_attention", studentCount: 5, fileCount: 2, lastActivity: "1 day ago" },
    { id: "p3", name: "Ecosystem Study Report", course: "Biology 150", status: "at_risk", studentCount: 3, fileCount: 4, lastActivity: "3 hours ago" },
    { id: "p4", name: "Literary Analysis Essay", course: "English 102", status: "healthy", studentCount: 4, fileCount: 1, lastActivity: "30 mins ago" },
    { id: "p5", name: "Data Structures Implementation", course: "CS 201", status: "healthy", studentCount: 6, fileCount: 5, lastActivity: "5 hours ago" },
    { id: "p6", name: "Financial Modeling Project", course: "Finance 301", status: "needs_attention", studentCount: 4, fileCount: 2, lastActivity: "2 days ago" },
  ];

  // Mock files for each project
  const mockFilesMap: Record<string, TrackedFile[]> = {
    p1: [
      { id: "f1", name: "Main Research Document.docx", type: "google_doc", lastModified: "2 hours ago", snapshotCount: 47, editCount: 156 },
      { id: "f2", name: "Data Analysis.xlsx", type: "google_sheet", lastModified: "5 hours ago", snapshotCount: 23, editCount: 89 },
      { id: "f3", name: "Presentation Slides.pptx", type: "google_slide", lastModified: "1 day ago", snapshotCount: 12, editCount: 34 },
    ],
    p2: [
      { id: "f4", name: "Marketing Plan.docx", type: "google_doc", lastModified: "1 day ago", snapshotCount: 31, editCount: 98 },
      { id: "f5", name: "Budget Spreadsheet.xlsx", type: "google_sheet", lastModified: "2 days ago", snapshotCount: 18, editCount: 45 },
    ],
    p3: [
      { id: "f6", name: "Ecosystem Report.docx", type: "google_doc", lastModified: "3 hours ago", snapshotCount: 52, editCount: 178 },
      { id: "f7", name: "Species Data.xlsx", type: "google_sheet", lastModified: "6 hours ago", snapshotCount: 28, editCount: 67 },
      { id: "f8", name: "Field Notes.docx", type: "google_doc", lastModified: "1 day ago", snapshotCount: 15, editCount: 42 },
      { id: "f9", name: "Research Presentation.pptx", type: "google_slide", lastModified: "2 days ago", snapshotCount: 8, editCount: 21 },
    ],
    p4: [
      { id: "f10", name: "Literary Analysis.docx", type: "google_doc", lastModified: "30 mins ago", snapshotCount: 38, editCount: 124 },
    ],
    p5: [
      { id: "f11", name: "Algorithm Documentation.docx", type: "google_doc", lastModified: "5 hours ago", snapshotCount: 61, editCount: 203 },
      { id: "f12", name: "Test Cases.xlsx", type: "google_sheet", lastModified: "8 hours ago", snapshotCount: 34, editCount: 89 },
      { id: "f13", name: "Project Report.docx", type: "google_doc", lastModified: "1 day ago", snapshotCount: 29, editCount: 76 },
      { id: "f14", name: "Performance Metrics.xlsx", type: "google_sheet", lastModified: "2 days ago", snapshotCount: 19, editCount: 45 },
      { id: "f15", name: "Final Presentation.pptx", type: "google_slide", lastModified: "3 days ago", snapshotCount: 11, editCount: 28 },
    ],
    p6: [
      { id: "f16", name: "Financial Model.xlsx", type: "google_sheet", lastModified: "2 days ago", snapshotCount: 42, editCount: 134 },
      { id: "f17", name: "Analysis Report.docx", type: "google_doc", lastModified: "3 days ago", snapshotCount: 25, editCount: 67 },
    ],
  };

 // Mock data for demonstration
 const mockTimeline: TimelineEvent[] = [
   {
     id: "1",
     type: "keyframe",
     timestamp: "2026-02-01T09:00:00Z",
     seconds_from_start: 0,
     content: `<h1>AI Ethics Research Project</h1><p>This document will explore the ethical implications of artificial intelligence in modern society.</p>`,
     word_count: 15,
     changes_summary: "Document created",
     added_words: 15,
     removed_words: 0,
     author: { id: "1", name: "Alice Johnson", avatar: "AJ", role: "Team Lead" }
   },
   {
     id: "2",
     type: "diff",
     timestamp: "2026-02-01T10:30:00Z",
     seconds_from_start: 15,
     content: `<h1>AI Ethics Research Project</h1><p>This document will explore the ethical implications of artificial intelligence in modern society.</p><h2>Introduction</h2><p>Artificial intelligence has become increasingly prevalent in our daily lives, from recommendation algorithms to autonomous vehicles.</p>`,
     word_count: 42,
     changes_summary: "Added introduction section",
     added_words: 27,
     removed_words: 0,
     author: { id: "1", name: "Alice Johnson", avatar: "AJ", role: "Team Lead" }
   },
   {
     id: "3",
     type: "diff",
     timestamp: "2026-02-02T14:15:00Z",
     seconds_from_start: 30,
     content: `<h1>AI Ethics Research Project</h1><p>This document will explore the ethical implications of artificial intelligence in modern society.</p><h2>Introduction</h2><p>Artificial intelligence has become increasingly prevalent in our daily lives, from recommendation algorithms to autonomous vehicles.</p><h2>Privacy Concerns</h2><p>One of the primary ethical concerns surrounding AI is the collection and use of personal data. Machine learning models require vast amounts of data to train effectively.</p>`,
     word_count: 78,
     changes_summary: "Added privacy concerns section",
     added_words: 36,
     removed_words: 0,
     author: { id: "2", name: "Bob Smith", avatar: "BS", role: "Researcher" }
   },
   {
     id: "4",
     type: "keyframe",
     timestamp: "2026-02-03T11:00:00Z",
     seconds_from_start: 45,
     content: `<h1>AI Ethics Research Project</h1><p>This document explores the ethical implications of artificial intelligence in modern society.</p><h2>Introduction</h2><p>Artificial intelligence has become increasingly prevalent in our daily lives, from recommendation algorithms to autonomous vehicles. As these systems become more sophisticated, we must carefully consider their impact.</p><h2>Privacy Concerns</h2><p>One of the primary ethical concerns surrounding AI is the collection and use of personal data. Machine learning models require vast amounts of data to train effectively, raising questions about consent and data ownership.</p>`,
     word_count: 95,
     changes_summary: "Expanded introduction and privacy sections",
     added_words: 22,
     removed_words: 5,
     author: { id: "3", name: "Carol Davis", avatar: "CD", role: "Editor" }
   },
   {
     id: "5",
     type: "diff",
     timestamp: "2026-02-04T09:30:00Z",
     seconds_from_start: 60,
     content: `<h1>AI Ethics Research Project</h1><p>This document explores the ethical implications of artificial intelligence in modern society.</p><h2>Introduction</h2><p>Artificial intelligence has become increasingly prevalent in our daily lives, from recommendation algorithms to autonomous vehicles. As these systems become more sophisticated, we must carefully consider their impact.</p><h2>Privacy Concerns</h2><p>One of the primary ethical concerns surrounding AI is the collection and use of personal data. Machine learning models require vast amounts of data to train effectively, raising questions about consent and data ownership.</p><h2>Algorithmic Bias</h2><p>AI systems can perpetuate and amplify existing biases present in training data. This has led to documented cases of discrimination in hiring, lending, and criminal justice applications.</p>`,
     word_count: 128,
     changes_summary: "Added algorithmic bias section",
     added_words: 33,
     removed_words: 0,
     author: { id: "2", name: "Bob Smith", avatar: "BS", role: "Researcher" }
   },
   {
     id: "6",
     type: "diff",
     timestamp: "2026-02-04T15:45:00Z",
     seconds_from_start: 75,
     content: `<h1>AI Ethics Research Project</h1><p>This document explores the ethical implications of artificial intelligence in modern society.</p><h2>Introduction</h2><p>Artificial intelligence has become increasingly prevalent in our daily lives, from recommendation algorithms to autonomous vehicles. As these systems become more sophisticated, we must carefully consider their impact on individuals and society as a whole.</p><h2>Privacy Concerns</h2><p>One of the primary ethical concerns surrounding AI is the collection and use of personal data. Machine learning models require vast amounts of data to train effectively, raising questions about consent, data ownership, and the right to be forgotten.</p><h2>Algorithmic Bias</h2><p>AI systems can perpetuate and amplify existing biases present in training data. This has led to documented cases of discrimination in hiring, lending, and criminal justice applications. Addressing bias requires diverse development teams and rigorous testing.</p>`,
     word_count: 152,
     changes_summary: "Refined content and added details",
     added_words: 28,
     removed_words: 4,
     author: { id: "1", name: "Alice Johnson", avatar: "AJ", role: "Team Lead" }
   },
   {
     id: "7",
     type: "keyframe",
     timestamp: "2026-02-05T10:00:00Z",
     seconds_from_start: 90,
     content: `<h1>AI Ethics Research Project</h1><p>This document explores the ethical implications of artificial intelligence in modern society.</p><h2>Introduction</h2><p>Artificial intelligence has become increasingly prevalent in our daily lives, from recommendation algorithms to autonomous vehicles. As these systems become more sophisticated, we must carefully consider their impact on individuals and society as a whole.</p><h2>Privacy Concerns</h2><p>One of the primary ethical concerns surrounding AI is the collection and use of personal data. Machine learning models require vast amounts of data to train effectively, raising questions about consent, data ownership, and the right to be forgotten.</p><h2>Algorithmic Bias</h2><p>AI systems can perpetuate and amplify existing biases present in training data. This has led to documented cases of discrimination in hiring, lending, and criminal justice applications. Addressing bias requires diverse development teams and rigorous testing.</p><h2>Conclusion</h2><p>As AI continues to evolve, establishing ethical guidelines and regulatory frameworks will be essential to ensure these technologies benefit humanity while minimizing potential harms.</p>`,
     word_count: 185,
     changes_summary: "Added conclusion section",
     added_words: 33,
     removed_words: 0,
     author: { id: "3", name: "Carol Davis", avatar: "CD", role: "Editor" }
   }
 ];
 
 const mockAuthors: Author[] = [
   { id: "1", name: "Alice Johnson", avatar: "AJ" },
   { id: "2", name: "Bob Smith", avatar: "BS" },
   { id: "3", name: "Carol Davis", avatar: "CD" }
 ];
 
 export default function LiveReplay() {
   const { fileId } = useParams();
   const navigate = useNavigate();
    const location = useLocation();
   
    // View state: "projects" -> "files" -> "replay"
    const [currentView, setCurrentView] = useState<"projects" | "files" | "replay">("projects");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectFiles, setProjectFiles] = useState<TrackedFile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

   const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
   const [authors, setAuthors] = useState<Author[]>([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isPlaying, setIsPlaying] = useState(false);
   const [playbackSpeed, setPlaybackSpeed] = useState(1);
   const [currentContent, setCurrentContent] = useState("");
   const [currentSeconds, setCurrentSeconds] = useState(0);
   const [totalDuration, setTotalDuration] = useState(0);
   const [fileName, setFileName] = useState("");
   const [projectName, setProjectName] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Keyboard shortcuts state
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [speedOverlay, setSpeedOverlay] = useState<string | null>(null);
  const [skipOverlay, setSkipOverlay] = useState<{ direction: 'forward' | 'backward', amount: number } | null>(null);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith("/teacher/live");

    const handleLogout = async () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      sessionStorage.clear();
      navigate("/auth");
    };

    // Initialize view based on fileId
   useEffect(() => {
      if (fileId) {
        // Direct file access - go straight to replay
        setCurrentView("replay");
        loadTimelineData();
      } else {
        setCurrentView("projects");
        setIsLoading(false);
      }
    }, [fileId]);

    const loadTimelineData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTimeline(mockTimeline);
        setAuthors(mockAuthors);
        setFileName("AI Ethics Research Project.docx");
        setProjectName("CS 101 Final Project");
        setTotalDuration(mockTimeline[mockTimeline.length - 1]?.seconds_from_start || 0);
        
        if (mockTimeline.length > 0) {
          setCurrentContent(mockTimeline[0].content);
          setCurrentSeconds(mockTimeline[0].seconds_from_start);
        }
      } catch (err) {
        setError("Failed to load timeline data");
      } finally {
        setIsLoading(false);
      }
    };

    const handleSelectProject = (project: Project) => {
      setSelectedProject(project);
      setProjectFiles(mockFilesMap[project.id] || []);
      setCurrentView("files");
    };

    const handleSelectFile = (file: TrackedFile) => {
      setFileName(file.name);
      setProjectName(selectedProject?.name || "");
      setCurrentView("replay");
      loadTimelineData();
    };

    const handleBackToProjects = () => {
      setSelectedProject(null);
      setProjectFiles([]);
      setCurrentView("projects");
    };

    const handleBackToFiles = () => {
      setCurrentView("files");
    };

    const filteredProjects = mockProjects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (type: string) => {
      switch (type) {
        case "google_doc":
          return <FileText className="w-6 h-6 text-blue-500" />;
        case "google_sheet":
          return <Table className="w-6 h-6 text-green-500" />;
        case "google_slide":
          return <Presentation className="w-6 h-6 text-orange-500" />;
        default:
          return <FileText className="w-6 h-6 text-slate-500" />;
      }
    };

    const getStatusColors = (status: string) => {
      switch (status) {
        case "healthy":
          return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" };
        case "needs_attention":
          return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" };
        case "at_risk":
          return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
        default:
          return { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };
      }
    };

    // Fetch timeline data
    useEffect(() => {
      if (currentView === "replay" && timeline.length === 0) {
        const fetchTimeline = async () => {
          setIsLoading(true);
          setError(null);
          
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setTimeline(mockTimeline);
            setAuthors(mockAuthors);
            if (!fileName) setFileName("AI Ethics Research Project.docx");
            if (!projectName) setProjectName("CS 101 Final Project");
            setTotalDuration(mockTimeline[mockTimeline.length - 1]?.seconds_from_start || 0);
            
            if (mockTimeline.length > 0) {
              setCurrentContent(mockTimeline[0].content);
              setCurrentSeconds(mockTimeline[0].seconds_from_start);
            }
          } catch (err) {
            setError("Failed to load timeline data");
          } finally {
            setIsLoading(false);
         }
        };
 
        fetchTimeline();
      }
    }, [currentView]);
 
   // Auto-advance through timeline when playing
   useEffect(() => {
     if (isPlaying && currentIndex < timeline.length - 1) {
       const interval = setInterval(() => {
         setCurrentIndex(prev => prev + 1);
       }, 1000 / playbackSpeed);
       
       return () => clearInterval(interval);
     } else if (currentIndex >= timeline.length - 1) {
       setIsPlaying(false);
     }
   }, [isPlaying, currentIndex, playbackSpeed, timeline.length]);
 
   // Update content when index changes
   useEffect(() => {
     if (timeline[currentIndex]) {
       const event = timeline[currentIndex];
       setCurrentContent(event.content);
       setCurrentSeconds(event.seconds_from_start);
     }
   }, [currentIndex, timeline]);
 
   // Filter timeline by author
   const filteredTimeline = selectedAuthor === "all" 
     ? timeline 
     : timeline.filter(e => e.author?.id === selectedAuthor);
 
  const handleSeek = (seconds: number) => {
    const index = timeline.findIndex(e => e.seconds_from_start >= seconds);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const handleRewind = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setSkipOverlay({ direction: 'backward', amount: 1 });
    setTimeout(() => setSkipOverlay(null), 800);
  }, []);

  const handleFastForward = useCallback(() => {
    setCurrentIndex(prev => Math.min(timeline.length - 1, prev + 1));
    setSkipOverlay({ direction: 'forward', amount: 1 });
    setTimeout(() => setSkipOverlay(null), 800);
  }, [timeline.length]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const jumpToEvent = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const goBack = () => {
    navigate(-1);
  };

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  // Skip forward/backward by N events
  const skipForward = useCallback((events: number) => {
    setCurrentIndex(prev => Math.min(timeline.length - 1, prev + events));
    setSkipOverlay({ direction: 'forward', amount: events });
    setTimeout(() => setSkipOverlay(null), 800);
  }, [timeline.length]);

  const skipBackward = useCallback((events: number) => {
    setCurrentIndex(prev => Math.max(0, prev - events));
    setSkipOverlay({ direction: 'backward', amount: events });
    setTimeout(() => setSkipOverlay(null), 800);
  }, []);

  // Speed controls
  const increaseSpeed = useCallback(() => {
    setPlaybackSpeed(prev => {
      const newSpeed = prev === 0.5 ? 1 : prev === 1 ? 2 : 2;
      setSpeedOverlay(`${newSpeed}x`);
      setTimeout(() => setSpeedOverlay(null), 800);
      return newSpeed;
    });
  }, []);

  const decreaseSpeed = useCallback(() => {
    setPlaybackSpeed(prev => {
      const newSpeed = prev === 2 ? 1 : prev === 1 ? 0.5 : 0.5;
      setSpeedOverlay(`${newSpeed}x`);
      setTimeout(() => setSpeedOverlay(null), 800);
      return newSpeed;
    });
  }, []);

  // Jump to start/end
  const jumpToStart = useCallback(() => {
    setCurrentIndex(0);
    toast("Jumped to beginning");
  }, []);

  const jumpToEnd = useCallback(() => {
    setCurrentIndex(timeline.length - 1);
    toast("Jumped to end");
  }, [timeline.length]);

  // Frame-by-frame navigation
  const previousFrame = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const nextFrame = useCallback(() => {
    setCurrentIndex(prev => Math.min(timeline.length - 1, prev + 1));
  }, [timeline.length]);

  // Jump to percentage
  const jumpToPercentage = useCallback((percentage: number) => {
    const targetIndex = Math.floor((timeline.length - 1) * (percentage / 100));
    setCurrentIndex(targetIndex);
    toast(`Jumped to ${percentage}%`);
  }, [timeline.length]);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (currentView !== "replay") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
      
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;

        case 'arrowright':
          e.preventDefault();
          skipForward(1);
          break;

        case 'arrowleft':
          e.preventDefault();
          skipBackward(1);
          break;

        case 'j':
          e.preventDefault();
          skipBackward(3);
          break;

        case 'l':
          e.preventDefault();
          skipForward(3);
          break;

        case 'arrowup':
          e.preventDefault();
          increaseSpeed();
          break;

        case 'arrowdown':
          e.preventDefault();
          decreaseSpeed();
          break;

        case 'c':
          e.preventDefault();
          setShowCaptions(prev => !prev);
          toast(showCaptions ? "Captions hidden" : "Captions shown");
          break;

        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'home':
          e.preventDefault();
          jumpToStart();
          break;

        case 'end':
          e.preventDefault();
          jumpToEnd();
          break;

        case ',':
          if (!isPlaying) {
            e.preventDefault();
            previousFrame();
          }
          break;

        case '.':
          if (!isPlaying) {
            e.preventDefault();
            nextFrame();
          }
          break;

        case '?':
          e.preventDefault();
          setShowKeyboardHelp(true);
          break;

        case 'escape':
          e.preventDefault();
          setShowKeyboardHelp(false);
          break;

        // Number keys (0-9) for percentage jumps
        case '0': e.preventDefault(); jumpToPercentage(0); break;
        case '1': e.preventDefault(); jumpToPercentage(10); break;
        case '2': e.preventDefault(); jumpToPercentage(20); break;
        case '3': e.preventDefault(); jumpToPercentage(30); break;
        case '4': e.preventDefault(); jumpToPercentage(40); break;
        case '5': e.preventDefault(); jumpToPercentage(50); break;
        case '6': e.preventDefault(); jumpToPercentage(60); break;
        case '7': e.preventDefault(); jumpToPercentage(70); break;
        case '8': e.preventDefault(); jumpToPercentage(80); break;
        case '9': e.preventDefault(); jumpToPercentage(90); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView, isPlaying, showCaptions, handlePlayPause, skipForward, skipBackward, 
      increaseSpeed, decreaseSpeed, toggleFullscreen, jumpToStart, jumpToEnd, 
      previousFrame, nextFrame, jumpToPercentage]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
 
   const currentEvent = timeline[currentIndex];
   const currentAuthor = currentEvent?.author;
 
    // Sidebar component
    const Sidebar = () => (
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm z-40">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold"><span className="text-slate-900">Fair</span><span className="text-blue-500">Grade</span></span>
          </Link>
          <div className="mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Teacher</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-blue-50 border-r-4 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-blue-600" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    );

    // Projects browser view
    if (currentView === "projects") {
     return (
        <div className="min-h-screen bg-slate-50 flex">
          <Sidebar />
          <div className="flex-1 ml-64 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Live Monitor</h1>
              <p className="text-slate-600">Select a project to view live document replays</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by name or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const statusColors = getStatusColors(project.status);
                return (
                  <div
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-slate-500">{project.course}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                        {project.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Students</p>
                        <p className="text-lg font-bold text-slate-900">{project.studentCount}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Files</p>
                        <p className="text-lg font-bold text-slate-900">{project.fileCount}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Last activity: {project.lastActivity}</span>
                      <ChevronRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No projects found matching your search.</p>
              </div>
            )}
          </div>
       </div>
     );
   }
 
    // Files browser view
    if (currentView === "files") {
     return (
        <div className="min-h-screen bg-slate-50 flex">
          <Sidebar />
          <div className="flex-1 ml-64 p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
              <button onClick={handleBackToProjects} className="hover:text-blue-600">
                All Projects
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">{selectedProject?.name}</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedProject?.name}</h1>
              <p className="text-slate-600">{selectedProject?.course} • Select a file to view its replay</p>
            </div>

            {/* Files List */}
            <div className="space-y-4">
              {projectFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{file.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>Last updated: {file.lastModified}</span>
                          <span>•</span>
                          <span>{file.snapshotCount} snapshots</span>
                          <span>•</span>
                          <span>{file.editCount} edits</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        View Replay
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projectFiles.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No tracked files in this project.</p>
              </div>
            )}
          </div>
       </div>
     );
   }
 
    // Replay player view
    if (isLoading) {
      return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading timeline...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Button onClick={goBack} variant="outline" className="text-white border-white hover:bg-slate-800">
              Go Back
            </Button>
          </div>
        </div>
      );
    }

   return (
     <div className="fixed inset-0 bg-slate-900 z-50">
       {/* Top Header Bar */}
       <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <button 
              onClick={selectedProject ? handleBackToFiles : goBack} 
             className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
           >
             <X className="w-5 h-5 text-white" />
           </button>
           
           <div>
             <h1 className="text-xl font-bold text-white">{fileName}</h1>
             <p className="text-sm text-slate-400">
               {projectName} • Tracked from Feb 1, 2026 to Feb 5, 2026
             </p>
           </div>
         </div>
 
         <Button className="bg-blue-500 hover:bg-blue-600 text-white">
           <Download className="w-4 h-4 mr-2" />
           Export Timeline
         </Button>
       </div>
 
       {/* Main Content Area */}
       <div className="flex h-[calc(100vh-80px-140px)]">
         
         {/* LEFT: Document Preview */}
         <div className="flex-1 bg-white p-8 overflow-y-auto">
           <div className="max-w-4xl mx-auto">
             <div 
               className="prose prose-slate max-w-none"
               dangerouslySetInnerHTML={{ __html: currentContent }}
             />
           </div>
         </div>
 
         {/* RIGHT: Timeline Info Sidebar */}
         <div className="w-96 bg-slate-800 p-6 overflow-y-auto">
           
           {/* Current Timestamp Info */}
           <div className="bg-slate-700 rounded-lg p-4 mb-6">
             <p className="text-xs text-slate-400 mb-1">Current Time</p>
             <p className="text-2xl font-bold text-white">
               {formatTime(currentSeconds)}
             </p>
             {currentEvent && (
               <p className="text-sm text-slate-300 mt-2">
                 {formatDate(currentEvent.timestamp)}
               </p>
             )}
           </div>
 
          {/* Current Author - Only show if captions enabled */}
          {showCaptions && currentAuthor && (
            <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-300 mb-2">Currently Editing</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentAuthor.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{currentAuthor.name}</p>
                  <p className="text-xs text-slate-300">{currentAuthor.role}</p>
                </div>
              </div>
            </div>
          )}
 
           {/* Change Summary */}
           {currentEvent && (
             <div className="bg-slate-700 rounded-lg p-4 mb-6">
               <p className="text-xs text-slate-400 mb-2">This Change</p>
               <p className="text-sm text-white">
                 {currentEvent.changes_summary}
               </p>
               {currentEvent.added_words > 0 && (
                 <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                   <Plus className="w-3 h-3" />
                   <span>+{currentEvent.added_words} words</span>
                 </div>
               )}
               {currentEvent.removed_words > 0 && (
                 <div className="flex items-center gap-2 mt-1 text-red-400 text-xs">
                   <Minus className="w-3 h-3" />
                   <span>-{currentEvent.removed_words} words</span>
                 </div>
               )}
             </div>
           )}
 
           {/* Timeline Events List */}
           <div>
             <h3 className="font-bold text-white mb-3 flex items-center gap-2">
               <Clock className="w-4 h-4" />
               Timeline Events
             </h3>
             <div className="space-y-2">
               {timeline.map((event, index) => (
                 <button
                   key={event.id}
                   onClick={() => jumpToEvent(index)}
                   className={`w-full text-left p-3 rounded-lg transition-colors ${
                     index === currentIndex
                       ? "bg-blue-600 text-white"
                       : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                   }`}
                 >
                   <div className="flex items-center gap-2 mb-1">
                     {event.type === "keyframe" ? (
                       <Circle className="w-3 h-3 text-blue-400 fill-blue-400" />
                     ) : (
                       <Circle className="w-2 h-2 text-slate-400" />
                     )}
                     <span className="text-xs font-mono">
                       {formatTime(event.seconds_from_start)}
                     </span>
                     {event.author && (
                       <span className="text-xs text-slate-400">
                         • {event.author.name}
                       </span>
                     )}
                   </div>
                   <p className="text-xs truncate">{event.changes_summary}</p>
                 </button>
               ))}
             </div>
           </div>
         </div>
       </div>
 
       {/* Bottom: Video Controls Bar */}
       <div className="bg-slate-800 px-6 py-4 absolute bottom-0 left-0 right-0">
         
         {/* Timeline Scrubber */}
         <div className="mb-4">
           <input
             type="range"
             min="0"
             max={totalDuration}
             value={currentSeconds}
             onChange={(e) => handleSeek(Number(e.target.value))}
             className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-blue-500
                        [&::-webkit-slider-thumb]:cursor-pointer"
           />
           <div className="flex justify-between text-xs text-slate-400 mt-1">
             <span>{formatTime(currentSeconds)}</span>
             <span>{formatTime(totalDuration)}</span>
           </div>
         </div>
 
         {/* Playback Controls */}
         <div className="flex items-center justify-between">
           
           {/* Left: Play/Pause + Skip Buttons */}
           <div className="flex items-center gap-2">
             <button 
               onClick={handleRewind}
               className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
               title="Rewind 5 events"
             >
               <SkipBack className="w-5 h-5 text-white" />
             </button>
 
             <button 
               onClick={handlePlayPause}
               className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
             >
               {isPlaying ? (
                 <Pause className="w-6 h-6 text-white" />
               ) : (
                 <Play className="w-6 h-6 text-white" />
               )}
             </button>
 
             <button 
               onClick={handleFastForward}
               className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
               title="Forward 5 events"
             >
               <SkipForward className="w-5 h-5 text-white" />
             </button>
           </div>
 
           {/* Center: Speed Controls */}
           <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
             {[0.5, 1, 2].map((speed) => (
               <button
                 key={speed}
                 onClick={() => setPlaybackSpeed(speed)}
                 className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                   playbackSpeed === speed
                     ? "bg-blue-500 text-white"
                     : "text-slate-300 hover:text-white"
                 }`}
               >
                 {speed}x
               </button>
             ))}
           </div>
 
          {/* Right: Additional Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCaptions(!showCaptions)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title={showCaptions ? "Hide author names (C)" : "Show author names (C)"}
            >
              {showCaptions ? (
                <Eye className="w-5 h-5 text-white" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-400" />
              )}
            </button>

            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Toggle fullscreen (F)"
            >
              <Maximize className="w-5 h-5 text-white" />
            </button>

            <button 
              onClick={() => setShowKeyboardHelp(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="w-5 h-5 text-white" />
            </button>

            <select 
              className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm border border-slate-600"
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              <option value="all">All Authors</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Speed Change Overlay */}
      {speedOverlay && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-8 py-4 rounded-lg text-2xl font-bold z-[60] pointer-events-none">
          {speedOverlay}
        </div>
      )}

      {/* Skip Overlay */}
      {skipOverlay && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-8 py-4 rounded-lg text-xl font-bold z-[60] flex items-center gap-2 pointer-events-none">
          {skipOverlay.direction === 'forward' ? (
            <>
              <FastForward className="w-6 h-6" />
              +{skipOverlay.amount} events
            </>
          ) : (
            <>
              <Rewind className="w-6 h-6" />
              -{skipOverlay.amount} events
            </>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Playback Controls */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Playback Controls</h3>
                <div className="space-y-2">
                  <ShortcutRow keys={['Space', 'K']} description="Play/Pause" />
                  <ShortcutRow keys={['→']} description="Skip forward 1 event" />
                  <ShortcutRow keys={['←']} description="Skip backward 1 event" />
                  <ShortcutRow keys={['J']} description="Rewind 3 events" />
                  <ShortcutRow keys={['L']} description="Fast forward 3 events" />
                  <ShortcutRow keys={['↑']} description="Increase speed" />
                  <ShortcutRow keys={['↓']} description="Decrease speed" />
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Navigation</h3>
                <div className="space-y-2">
                  <ShortcutRow keys={['0-9']} description="Jump to 0%-90% of timeline" />
                  <ShortcutRow keys={['Home']} description="Jump to beginning" />
                  <ShortcutRow keys={['End']} description="Jump to end" />
                  <ShortcutRow keys={[',']} description="Previous frame (when paused)" />
                  <ShortcutRow keys={['.']} description="Next frame (when paused)" />
                </div>
              </div>

              {/* Display */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Display</h3>
                <div className="space-y-2">
                  <ShortcutRow keys={['C']} description="Toggle author names" />
                  <ShortcutRow keys={['F']} description="Toggle fullscreen" />
                  <ShortcutRow keys={['?']} description="Show this help" />
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm text-center">
                Press <kbd className="px-2 py-1 bg-slate-700 rounded text-white text-xs">Esc</kbd> or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}