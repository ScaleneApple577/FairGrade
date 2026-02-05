 import { useState, useEffect } from "react";
 import { useParams, useNavigate } from "react-router-dom";
 import { 
   X, Download, Play, Pause, SkipBack, SkipForward, 
   Maximize, Clock, Circle, Plus, Minus, FileText
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 
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
 
   // Fetch timeline data
   useEffect(() => {
     const fetchTimeline = async () => {
       setIsLoading(true);
       setError(null);
       
       try {
         // Simulate API call - replace with actual API when backend is ready
         await new Promise(resolve => setTimeout(resolve, 500));
         
         // Mock data
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
 
     fetchTimeline();
   }, [fileId]);
 
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
 
   const handleRewind = () => {
     setCurrentIndex(prev => Math.max(0, prev - 5));
   };
 
   const handleFastForward = () => {
     setCurrentIndex(prev => Math.min(timeline.length - 1, prev + 5));
   };
 
   const handlePlayPause = () => {
     setIsPlaying(!isPlaying);
   };
 
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
 
   const toggleFullscreen = () => {
     if (document.fullscreenElement) {
       document.exitFullscreen();
     } else {
       document.documentElement.requestFullscreen();
     }
   };
 
   const currentEvent = timeline[currentIndex];
   const currentAuthor = currentEvent?.author;
 
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
             onClick={goBack} 
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
 
           {/* Current Author */}
           {currentAuthor && (
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
               onClick={toggleFullscreen}
               className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
               title="Toggle fullscreen"
             >
               <Maximize className="w-5 h-5 text-white" />
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
     </div>
   );
 }