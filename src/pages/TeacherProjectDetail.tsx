 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
 import {
   ChevronRight,
   Edit,
   Download,
   CheckCircle,
   AlertTriangle,
   AlertCircle,
   Clock,
   Users,
   LayoutDashboard,
   FolderOpen,
   BarChart3,
   Activity,
   FileText,
   Settings,
   LogOut,
   Mail,
   Play,
   ExternalLink,
   Plus,
   X,
   Info,
   Table,
   Presentation,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 // Sidebar navigation items
 const sidebarItems = [
   { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
   { icon: FolderOpen, label: "All Projects", path: "/teacher/projects" },
   { icon: Users, label: "Students", path: "/teacher/students" },
   { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
  { icon: Activity, label: "Live Monitor", path: "/teacher/live-monitor" },
   { icon: FileText, label: "Reports", path: "/teacher/reports" },
   { icon: Settings, label: "Settings", path: "/settings" },
 ];
 
 // Mock project data
 const mockProject = {
   id: "proj-001",
   name: "Marketing Campaign Analysis",
   course: "Business 201",
   description: "Analyze and create a marketing strategy for a tech startup. Students will work in teams to develop comprehensive marketing plans.",
   deadline: "2026-02-15",
   status: "at_risk" as "healthy" | "needs_attention" | "at_risk",
   studentCount: 5,
   progress: 35,
   riskScore: 85,
   daysRemaining: 10,
   flaggedIssues: 3,
 };
 
 const mockStudents = [
   {
     id: "s1",
     name: "Alice Johnson",
     email: "alice@university.edu",
     avatar: "A",
     avatarColor: "bg-blue-500",
     score: 92,
     wordsWritten: 2450,
     tasksCompleted: 8,
     tasksTotal: 10,
     meetingsAttended: 5,
     meetingsTotal: 5,
     peerRating: 4.8,
     isFreeRider: false,
     flags: [],
   },
   {
     id: "s2",
     name: "Bob Smith",
     email: "bob@university.edu",
     avatar: "B",
     avatarColor: "bg-green-500",
     score: 78,
     wordsWritten: 1820,
     tasksCompleted: 6,
     tasksTotal: 10,
     meetingsAttended: 4,
     meetingsTotal: 5,
     peerRating: 4.2,
     isFreeRider: false,
     flags: [{ type: "ai", message: "85% AI probability detected in recent submission" }],
   },
   {
     id: "s3",
     name: "Carol Williams",
     email: "carol@university.edu",
     avatar: "C",
     avatarColor: "bg-purple-500",
     score: 65,
     wordsWritten: 980,
     tasksCompleted: 4,
     tasksTotal: 10,
     meetingsAttended: 3,
     meetingsTotal: 5,
     peerRating: 3.5,
     isFreeRider: false,
     flags: [{ type: "plagiarism", message: "32% similarity to web sources" }],
   },
   {
     id: "s4",
     name: "Dave Wilson",
     email: "dave@university.edu",
     avatar: "D",
     avatarColor: "bg-orange-500",
     score: 12,
     wordsWritten: 120,
     tasksCompleted: 1,
     tasksTotal: 10,
     meetingsAttended: 1,
     meetingsTotal: 5,
     peerRating: 2.0,
     isFreeRider: true,
     flags: [{ type: "free_rider", message: "No contributions in last 7 days" }],
   },
   {
     id: "s5",
     name: "Eve Davis",
     email: "eve@university.edu",
     avatar: "E",
     avatarColor: "bg-pink-500",
     score: 88,
     wordsWritten: 2100,
     tasksCompleted: 7,
     tasksTotal: 10,
     meetingsAttended: 5,
     meetingsTotal: 5,
     peerRating: 4.6,
     isFreeRider: false,
     flags: [],
   },
 ];
 
 const mockFiles = [
   {
     id: "f1",
     name: "Marketing Strategy Document.docx",
     type: "google_doc",
     lastModified: "2026-02-05T10:30:00Z",
     snapshotCount: 45,
     editCount: 234,
     url: "https://docs.google.com/document/d/example1",
     activityChart: [12, 18, 25, 15, 30, 8, 22],
   },
   {
     id: "f2",
     name: "Budget Analysis.xlsx",
     type: "google_sheet",
     lastModified: "2026-02-04T16:45:00Z",
     snapshotCount: 23,
     editCount: 89,
     url: "https://docs.google.com/spreadsheets/d/example2",
     activityChart: [5, 8, 12, 6, 15, 3, 10],
   },
   {
     id: "f3",
     name: "Presentation Deck.pptx",
     type: "google_slide",
     lastModified: "2026-02-03T14:20:00Z",
     snapshotCount: 18,
     editCount: 56,
     url: "https://docs.google.com/presentation/d/example3",
     activityChart: [3, 5, 8, 4, 12, 2, 7],
   },
 ];
 
 const mockActivities = [
   { id: "a1", userName: "Alice Johnson", userAvatar: "A", userColor: "bg-blue-500", action: "added 120 words to Section 3", fileName: "Marketing Strategy Document.docx", timestamp: "2026-02-05T10:30:00Z", type: "edit", wordsAdded: 120 },
   { id: "a2", userName: "Bob Smith", userAvatar: "B", userColor: "bg-green-500", action: "left a comment on Introduction", fileName: "Marketing Strategy Document.docx", timestamp: "2026-02-05T10:15:00Z", type: "comment" },
   { id: "a3", userName: "Eve Davis", userAvatar: "E", userColor: "bg-pink-500", action: "completed task 'Review budget'", fileName: "Budget Analysis.xlsx", timestamp: "2026-02-05T09:45:00Z", type: "task" },
   { id: "a4", userName: "Carol Williams", userAvatar: "C", userColor: "bg-purple-500", action: "added 3 slides", fileName: "Presentation Deck.pptx", timestamp: "2026-02-05T09:00:00Z", type: "edit", wordsAdded: 45 },
   { id: "a5", userName: "Alice Johnson", userAvatar: "A", userColor: "bg-blue-500", action: "uploaded new version", fileName: "Marketing Strategy Document.docx", timestamp: "2026-02-04T16:30:00Z", type: "upload" },
 ];
 
 const mockAlerts = [
   { id: "al1", severity: "critical", type: "free_rider", title: "Free-rider Detected", description: "Dave Wilson has 0 contributions in the last 7 days. Team progress may be affected.", studentName: "Dave Wilson", timestamp: "2026-02-05T08:00:00Z" },
   { id: "al2", severity: "warning", type: "ai_content", title: "AI Content Detected", description: "Bob Smith's recent submission shows 85% probability of AI-generated content.", studentName: "Bob Smith", timestamp: "2026-02-04T14:30:00Z", content: "The marketing strategy should focus on digital channels to maximize reach and engagement with the target demographic...", confidence: 85 },
   { id: "al3", severity: "warning", type: "plagiarism", title: "Plagiarism Alert", description: "Carol Williams' document shows 32% similarity to external web sources.", studentName: "Carol Williams", timestamp: "2026-02-03T11:00:00Z" },
 ];
 
 export default function TeacherProjectDetail() {
   const navigate = useNavigate();
   const location = useLocation();
   const { id } = useParams();
   const [activeTab, setActiveTab] = useState("students");
   const [showAddFile, setShowAddFile] = useState(false);
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate("/auth");
   };
 
   const isActive = (path: string) => location.pathname === path;
 
   const formatDate = (dateStr: string) => {
     const date = new Date(dateStr);
     return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
   };
 
   const formatRelativeTime = (dateStr: string) => {
     const now = new Date();
     const date = new Date(dateStr);
     const diffMs = now.getTime() - date.getTime();
     const diffMins = Math.floor(diffMs / (1000 * 60));
     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
 
     if (diffMins < 60) return `${diffMins} min ago`;
     if (diffHours < 24) return `${diffHours} hours ago`;
     return `${diffDays} days ago`;
   };
 
   const project = mockProject;
 
   return (
     <div className="min-h-screen bg-slate-50 flex">
       {/* Sidebar */}
       <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
         <div className="p-6 border-b border-slate-200">
           <Link to="/" className="flex items-center gap-3">
             <div className="w-9 h-11">
               <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                 <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
             <span className="text-xl font-bold">
               <span className="text-slate-900">Fair</span>
               <span className="text-blue-500">Grade</span>
             </span>
           </Link>
           <div className="mt-2">
             <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Teacher</span>
           </div>
         </div>
         <nav className="flex-1 p-4 space-y-1">
           {sidebarItems.map((item) => (
             <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path) ? "bg-blue-50 border-r-4 border-blue-500 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
               <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-blue-600" : ""}`} />
               <span className="font-medium">{item.label}</span>
             </Link>
           ))}
         </nav>
         <div className="p-4 border-t border-slate-200">
           <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full">
             <LogOut className="h-5 w-5" />
             <span className="font-medium">Log Out</span>
           </button>
         </div>
       </aside>
 
       {/* Main Content */}
       <div className="flex-1 ml-64 p-8">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
           <Link to="/teacher/projects" className="hover:text-blue-600">All Projects</Link>
           <ChevronRight className="w-4 h-4" />
           <span className="text-slate-900 font-medium">{project.name}</span>
         </div>
 
         {/* Header Section */}
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
           <div className="flex items-start justify-between mb-4">
             <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                 <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                   project.status === "healthy" ? "bg-green-500 text-white" :
                   project.status === "needs_attention" ? "bg-yellow-500 text-white" :
                   "bg-red-500 text-white"
                 }`}>
                   {project.status === "healthy" && <CheckCircle className="w-4 h-4" />}
                   {project.status === "needs_attention" && <Clock className="w-4 h-4" />}
                   {project.status === "at_risk" && <AlertTriangle className="w-4 h-4" />}
                   {project.status.replace("_", " ")}
                 </span>
               </div>
               <p className="text-slate-600">{project.course} • Due {formatDate(project.deadline)}</p>
               <p className="text-sm text-slate-500 mt-2">{project.description}</p>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" className="border-slate-300">
                 <Edit className="w-4 h-4 mr-2" />
                 Edit Project
               </Button>
               <Button className="bg-blue-500 hover:bg-blue-600">
                 <Download className="w-4 h-4 mr-2" />
                 Export Reports
               </Button>
             </div>
           </div>
 
           {/* Quick Stats */}
           <div className="grid grid-cols-5 gap-4 pt-4 border-t border-slate-200">
             <div className="text-center">
               <p className="text-2xl font-bold text-slate-900">{project.studentCount}</p>
               <p className="text-xs text-slate-500">Students</p>
             </div>
             <div className="text-center">
               <p className="text-2xl font-bold text-slate-900">{project.progress}%</p>
               <p className="text-xs text-slate-500">Progress</p>
             </div>
             <div className="text-center">
               <p className={`text-2xl font-bold ${project.riskScore > 70 ? "text-red-600" : project.riskScore > 40 ? "text-yellow-600" : "text-green-600"}`}>
                 {project.riskScore}
               </p>
               <p className="text-xs text-slate-500">Risk Score</p>
             </div>
             <div className="text-center">
               <p className="text-2xl font-bold text-slate-900">{project.daysRemaining}</p>
               <p className="text-xs text-slate-500">Days Left</p>
             </div>
             <div className="text-center">
               <p className="text-2xl font-bold text-red-600">{project.flaggedIssues}</p>
               <p className="text-xs text-slate-500">Flagged Issues</p>
             </div>
           </div>
         </div>
 
         {/* Tabs Navigation */}
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 mb-8 inline-flex gap-2">
           {["students", "files", "activity", "alerts"].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${activeTab === tab ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
             >
               {tab === "alerts" ? `Alerts (${mockAlerts.length})` : tab === "files" ? "Tracked Files" : tab === "activity" ? "Activity Feed" : tab}
             </button>
           ))}
         </div>
 
         {/* Students Tab */}
         {activeTab === "students" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {mockStudents.map((student) => (
               <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className={`w-12 h-12 ${student.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>{student.avatar}</div>
                     <div>
                       <h3 className="font-bold text-slate-900">{student.name}</h3>
                       <p className="text-xs text-slate-500">{student.email}</p>
                     </div>
                   </div>
                   {student.isFreeRider && (
                     <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" />
                       Free-rider
                     </span>
                   )}
                 </div>
 
                 <div className="mb-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-slate-600">Contribution Score</span>
                     <span className={`text-2xl font-bold ${student.score >= 80 ? "text-green-600" : student.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>{student.score}</span>
                   </div>
                   <div className="w-full bg-slate-200 rounded-full h-2">
                     <div className={`h-2 rounded-full ${student.score >= 80 ? "bg-green-500" : student.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${student.score}%` }} />
                   </div>
                 </div>
 
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-slate-50 rounded-lg p-3">
                     <p className="text-xs text-slate-500 mb-1">Words</p>
                     <p className="text-lg font-bold text-slate-900">{student.wordsWritten.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 rounded-lg p-3">
                     <p className="text-xs text-slate-500 mb-1">Tasks</p>
                     <p className="text-lg font-bold text-slate-900">{student.tasksCompleted}/{student.tasksTotal}</p>
                   </div>
                   <div className="bg-slate-50 rounded-lg p-3">
                     <p className="text-xs text-slate-500 mb-1">Meetings</p>
                     <p className="text-lg font-bold text-slate-900">{student.meetingsAttended}/{student.meetingsTotal}</p>
                   </div>
                   <div className="bg-slate-50 rounded-lg p-3">
                     <p className="text-xs text-slate-500 mb-1">Peer Rating</p>
                     <p className="text-lg font-bold text-slate-900">{student.peerRating}/5</p>
                   </div>
                 </div>
 
                 {student.flags.length > 0 && (
                   <div className="space-y-2 mb-4">
                     {student.flags.map((flag, idx) => (
                       <div key={idx} className={`p-2 rounded-lg text-xs flex items-center gap-2 ${flag.type === "ai" ? "bg-yellow-50 text-yellow-700" : flag.type === "plagiarism" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>
                         <AlertCircle className="w-3 h-3" />
                         <span>{flag.message}</span>
                       </div>
                     ))}
                   </div>
                 )}
 
                 <div className="flex gap-2">
                   <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-sm">View Report</Button>
                   <Button variant="outline" size="icon" className="border-slate-300">
                     <Mail className="w-4 h-4" />
                   </Button>
                 </div>
               </motion.div>
             ))}
           </div>
         )}
 
         {/* Files Tab */}
         {activeTab === "files" && (
           <div className="space-y-4">
             {mockFiles.map((file) => (
               <div key={file.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4 flex-1">
                     <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                       {file.type === "google_doc" && <FileText className="w-6 h-6 text-blue-500" />}
                       {file.type === "google_sheet" && <Table className="w-6 h-6 text-green-500" />}
                       {file.type === "google_slide" && <Presentation className="w-6 h-6 text-orange-500" />}
                     </div>
                     <div className="flex-1">
                       <h3 className="font-bold text-slate-900 mb-1">{file.name}</h3>
                       <div className="flex items-center gap-4 text-sm text-slate-600">
                         <span>Last updated: {formatRelativeTime(file.lastModified)}</span>
                         <span>•</span>
                         <span>{file.snapshotCount} snapshots</span>
                         <span>•</span>
                         <span>{file.editCount} edits</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button onClick={() => navigate(`/teacher/live-replay/${file.id}`)} className="bg-blue-500 hover:bg-blue-600">
                       <Play className="w-4 h-4 mr-2" />
                       View Replay
                     </Button>
                     <Button variant="outline" onClick={() => window.open(file.url, "_blank")} className="border-slate-300">
                       <ExternalLink className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
 
                 <div className="mt-4 pt-4 border-t border-slate-200">
                   <p className="text-sm font-medium text-slate-700 mb-2">Edit Activity (Last 7 Days)</p>
                   <div className="flex items-end gap-1 h-24">
                     {file.activityChart.map((count, idx) => (
                       <div key={idx} className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer" style={{ height: `${(count / Math.max(...file.activityChart)) * 100}%` }} title={`${count} edits`} />
                     ))}
                   </div>
                   <div className="flex justify-between text-xs text-slate-500 mt-1">
                     {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                       <span key={day}>{day}</span>
                     ))}
                   </div>
                 </div>
               </div>
             ))}
 
             <button onClick={() => setShowAddFile(true)} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-slate-600 hover:text-blue-600 font-medium">
               <Plus className="w-5 h-5 inline mr-2" />
               Add More Files to Track
             </button>
           </div>
         )}
 
         {/* Activity Tab */}
         {activeTab === "activity" && (
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-slate-900">Live Activity Feed</h2>
               <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span>Live</span>
               </div>
             </div>
             <div className="space-y-3 max-h-[600px] overflow-y-auto">
               {mockActivities.map((activity) => (
                 <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                   <div className={`w-10 h-10 ${activity.userColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{activity.userAvatar}</div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-slate-900">
                       <strong>{activity.userName}</strong> {activity.action}
                     </p>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs text-slate-500">{activity.fileName}</span>
                       <span className="text-xs text-slate-400">•</span>
                       <span className="text-xs text-slate-500">{formatRelativeTime(activity.timestamp)}</span>
                     </div>
                   </div>
                   {activity.type === "edit" && activity.wordsAdded && (
                     <span className="text-xs text-green-600">+{activity.wordsAdded} words</span>
                   )}
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Alerts Tab */}
         {activeTab === "alerts" && (
           <div className="space-y-4">
             {mockAlerts.map((alert) => (
               <div key={alert.id} className={`rounded-xl p-6 border-2 ${alert.severity === "critical" ? "bg-red-50 border-red-300" : alert.severity === "warning" ? "bg-yellow-50 border-yellow-300" : "bg-blue-50 border-blue-300"}`}>
                 <div className="flex items-start justify-between mb-3">
                   <div className="flex items-start gap-3 flex-1">
                     {alert.severity === "critical" && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                     {alert.severity === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                     {alert.severity === "info" && <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                     <div className="flex-1">
                       <h3 className={`font-bold mb-1 ${alert.severity === "critical" ? "text-red-900" : alert.severity === "warning" ? "text-yellow-900" : "text-blue-900"}`}>{alert.title}</h3>
                       <p className={`text-sm mb-2 ${alert.severity === "critical" ? "text-red-800" : alert.severity === "warning" ? "text-yellow-800" : "text-blue-800"}`}>{alert.description}</p>
                       <div className="flex items-center gap-2 text-xs text-slate-600">
                         <span>{alert.studentName}</span>
                         <span>•</span>
                         <span>{formatRelativeTime(alert.timestamp)}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="bg-white border-slate-300">View Details</Button>
                     <Button variant="outline" size="icon" className="bg-white border-slate-300 h-8 w-8">
                       <X className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
                 {alert.type === "ai_content" && alert.content && (
                   <div className="bg-white rounded-lg p-3 text-sm text-slate-700 border border-slate-200">
                     <p className="font-medium mb-1">Flagged Content Preview:</p>
                     <p className="italic">"{alert.content.substring(0, 150)}..."</p>
                     <p className="text-xs text-slate-500 mt-1">Confidence: {alert.confidence}%</p>
                   </div>
                 )}
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   );
 }