 import { useState, useMemo } from "react";
 import { motion } from "framer-motion";
 import { useNavigate, Link, useLocation } from "react-router-dom";
 import {
   Plus,
   Download,
   Search,
   Filter,
   Grid3X3,
   List,
   X,
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
   MoreVertical,
   Mail,
   Calendar,
   Archive,
   FolderPlus,
   ChevronRight,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 // Sidebar navigation items for teachers
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
 const mockProjects = [
   {
     id: "proj-001",
     name: "Marketing Campaign Analysis",
     course: "Business 201",
     description: "Analyze and create a marketing strategy for a tech startup",
     deadline: "2026-02-15",
     student_count: 5,
     status: "at_risk" as const,
     risk_score: 85,
     progress: 35,
     issues_count: 3,
     flagged_students: 2,
     last_activity: "2026-02-05T10:30:00Z",
     created_at: "2026-01-15T08:00:00Z",
   },
   {
     id: "proj-002",
     name: "Machine Learning Final Project",
     course: "CS 101",
     description: "Build a neural network for image classification",
     deadline: "2026-02-20",
     student_count: 4,
     status: "needs_attention" as const,
     risk_score: 45,
     progress: 55,
     issues_count: 2,
     flagged_students: 1,
     last_activity: "2026-02-05T09:15:00Z",
     created_at: "2026-01-10T10:00:00Z",
   },
   {
     id: "proj-003",
     name: "Cell Biology Lab Report",
     course: "Biology 150",
     description: "Comprehensive lab report on cell division experiments",
     deadline: "2026-02-25",
     student_count: 3,
     status: "healthy" as const,
     risk_score: 12,
     progress: 75,
     issues_count: 0,
     flagged_students: 0,
     last_activity: "2026-02-05T11:45:00Z",
     created_at: "2026-01-08T14:00:00Z",
   },
   {
     id: "proj-004",
     name: "Shakespeare Analysis Essay",
     course: "English 102",
     description: "Comparative analysis of themes in Hamlet and Macbeth",
     deadline: "2026-02-18",
     student_count: 2,
     status: "healthy" as const,
     risk_score: 8,
     progress: 90,
     issues_count: 0,
     flagged_students: 0,
     last_activity: "2026-02-05T08:20:00Z",
     created_at: "2026-01-12T09:00:00Z",
   },
   {
     id: "proj-005",
     name: "Database Design Project",
     course: "CS 101",
     description: "Design and implement a relational database system",
     deadline: "2026-02-28",
     student_count: 6,
     status: "needs_attention" as const,
     risk_score: 38,
     progress: 40,
     issues_count: 1,
     flagged_students: 0,
     last_activity: "2026-02-04T16:30:00Z",
     created_at: "2026-01-20T11:00:00Z",
   },
   {
     id: "proj-006",
     name: "Financial Statement Analysis",
     course: "Business 201",
     description: "Analyze quarterly financial statements of Fortune 500 companies",
     deadline: "2026-03-01",
     student_count: 4,
     status: "healthy" as const,
     risk_score: 15,
     progress: 60,
     issues_count: 0,
     flagged_students: 0,
     last_activity: "2026-02-05T07:00:00Z",
     created_at: "2026-01-18T13:00:00Z",
   },
 ];
 
 const courses = ["CS 101", "Business 201", "Biology 150", "English 102"];
 
 export default function TeacherProjects() {
   const navigate = useNavigate();
   const location = useLocation();
 
   // Filter states
   const [searchQuery, setSearchQuery] = useState("");
   const [filterStatus, setFilterStatus] = useState("all");
   const [filterCourse, setFilterCourse] = useState("all");
   const [sortBy, setSortBy] = useState("deadline");
   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
 
   // Modal states
   const [showCreateProject, setShowCreateProject] = useState(false);
   const [showBulkActions, setShowBulkActions] = useState(false);
 
   // Create project wizard state
   const [currentStep, setCurrentStep] = useState(1);
   const [projectName, setProjectName] = useState("");
   const [projectCourse, setProjectCourse] = useState("");
   const [projectDescription, setProjectDescription] = useState("");
   const [projectDeadline, setProjectDeadline] = useState("");
   const [teamSize, setTeamSize] = useState("4");
   const [studentEmails, setStudentEmails] = useState("");
   const [fileUrls, setFileUrls] = useState("");
   const [importFromLMS, setImportFromLMS] = useState(false);
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate("/auth");
   };
 
   const isActive = (path: string) => location.pathname === path;
 
   // Compute stats
   const stats = useMemo(() => {
     return {
       total: mockProjects.length,
       healthy: mockProjects.filter((p) => p.status === "healthy").length,
       needs_attention: mockProjects.filter((p) => p.status === "needs_attention").length,
       at_risk: mockProjects.filter((p) => p.status === "at_risk").length,
     };
   }, []);
 
   // Filter and sort projects
   const filteredProjects = useMemo(() => {
     let result = [...mockProjects];
 
     // Search filter
     if (searchQuery) {
       const query = searchQuery.toLowerCase();
       result = result.filter(
         (p) =>
           p.name.toLowerCase().includes(query) ||
           p.course.toLowerCase().includes(query)
       );
     }
 
     // Status filter
     if (filterStatus !== "all") {
       result = result.filter((p) => p.status === filterStatus);
     }
 
     // Course filter
     if (filterCourse !== "all") {
       result = result.filter((p) => p.course === filterCourse);
     }
 
     // Sort
     result.sort((a, b) => {
       switch (sortBy) {
         case "deadline":
           return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
         case "risk":
           return b.risk_score - a.risk_score;
         case "name":
           return a.name.localeCompare(b.name);
         case "created":
           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
         case "progress":
           return b.progress - a.progress;
         default:
           return 0;
       }
     });
 
     return result;
   }, [searchQuery, filterStatus, filterCourse, sortBy]);
 
   const clearAllFilters = () => {
     setSearchQuery("");
     setFilterStatus("all");
     setFilterCourse("all");
   };
 
   const handleCreateProject = () => {
     toast.success("Project created successfully!");
     setShowCreateProject(false);
     // Reset form
     setCurrentStep(1);
     setProjectName("");
     setProjectCourse("");
     setProjectDescription("");
     setProjectDeadline("");
     setTeamSize("4");
     setStudentEmails("");
     setFileUrls("");
   };
 
   const formatDate = (dateStr: string) => {
     const date = new Date(dateStr);
     return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
   };
 
   const getDaysUntil = (dateStr: string) => {
     const now = new Date();
     const deadline = new Date(dateStr);
     const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
     return diff;
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
 
   const statusColors = {
     healthy: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", badge: "bg-green-500" },
     needs_attention: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", badge: "bg-yellow-500" },
     at_risk: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", badge: "bg-red-500" },
   };
 
   const hasActiveFilters = filterStatus !== "all" || filterCourse !== "all" || searchQuery;
 
   return (
     <div className="min-h-screen bg-slate-50 flex">
       {/* Sidebar */}
       <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
         {/* Logo */}
         <div className="p-6 border-b border-slate-200">
           <Link to="/" className="flex items-center gap-3">
             <div className="w-9 h-11">
               <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                 <path
                   d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15"
                   stroke="#3B82F6"
                   strokeWidth="3.5"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
                 <path
                   d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27"
                   stroke="#3B82F6"
                   strokeWidth="3.5"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
                 <path
                   d="M10 10 L10 42 Q10 44 8 43.5"
                   stroke="#3B82F6"
                   strokeWidth="3.5"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
               </svg>
             </div>
             <span className="text-xl font-bold">
               <span className="text-slate-900">Fair</span>
               <span className="text-blue-500">Grade</span>
             </span>
           </Link>
           <div className="mt-2">
             <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
               Teacher
             </span>
           </div>
         </div>
 
         {/* Navigation */}
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
 
         {/* Logout */}
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
 
       {/* Main Content */}
       <div className="flex-1 ml-64 p-8">
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div>
             <h1 className="text-3xl font-bold text-slate-900">All Projects</h1>
             <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-2 text-sm text-slate-600">
                 <FolderOpen className="w-4 h-4" />
                 <span>{stats.total} total projects</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-green-600">
                 <CheckCircle className="w-4 h-4" />
                 <span>{stats.healthy} healthy</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-yellow-600">
                 <AlertCircle className="w-4 h-4" />
                 <span>{stats.needs_attention} needs attention</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-red-600">
                 <AlertTriangle className="w-4 h-4" />
                 <span>{stats.at_risk} at risk</span>
               </div>
             </div>
           </div>
 
           <div className="flex gap-3">
             <Button
               onClick={() => setShowBulkActions(true)}
               variant="outline"
               className="flex items-center gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
             >
               <Filter className="w-4 h-4" />
               Bulk Actions
             </Button>
             <Button
               onClick={() => setShowCreateProject(true)}
               className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
             >
               <Plus className="w-4 h-4" />
               New Project
             </Button>
           </div>
         </div>
 
         {/* Filters & Search */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {/* Search */}
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Search Projects</label>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   placeholder="Search by name or course..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                 />
               </div>
             </div>
 
             {/* Status Filter */}
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
               <select
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
               >
                 <option value="all">All Statuses</option>
                 <option value="healthy">Healthy</option>
                 <option value="needs_attention">Needs Attention</option>
                 <option value="at_risk">At Risk</option>
               </select>
             </div>
 
             {/* Course Filter */}
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
               <select
                 value={filterCourse}
                 onChange={(e) => setFilterCourse(e.target.value)}
                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
               >
                 <option value="all">All Courses</option>
                 {courses.map((course) => (
                   <option key={course} value={course}>
                     {course}
                   </option>
                 ))}
               </select>
             </div>
 
             {/* Sort */}
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Sort By</label>
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
               >
                 <option value="deadline">Deadline (Soonest)</option>
                 <option value="risk">Risk Score (Highest)</option>
                 <option value="name">Name (A-Z)</option>
                 <option value="created">Recently Created</option>
                 <option value="progress">Progress (%)</option>
               </select>
             </div>
           </div>
 
           {/* Active Filters */}
           {hasActiveFilters && (
             <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
               <span className="text-xs text-slate-500">Active filters:</span>
               {searchQuery && (
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                   Search: "{searchQuery}"
                   <button onClick={() => setSearchQuery("")}>
                     <X className="w-3 h-3" />
                   </button>
                 </span>
               )}
               {filterStatus !== "all" && (
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                   Status: {filterStatus.replace("_", " ")}
                   <button onClick={() => setFilterStatus("all")}>
                     <X className="w-3 h-3" />
                   </button>
                 </span>
               )}
               {filterCourse !== "all" && (
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                   Course: {filterCourse}
                   <button onClick={() => setFilterCourse("all")}>
                     <X className="w-3 h-3" />
                   </button>
                 </span>
               )}
               <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline ml-2">
                 Clear all
               </button>
             </div>
           )}
         </div>
 
         {/* View Toggle & Count */}
         <div className="flex items-center justify-between mb-4">
           <p className="text-sm text-slate-600">
             Showing {filteredProjects.length} of {stats.total} projects
           </p>
           <div className="flex border border-slate-300 rounded-lg overflow-hidden">
             <button
               onClick={() => setViewMode("grid")}
               className={`px-4 py-2 text-sm font-medium transition-colors ${
                 viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
               }`}
             >
               <Grid3X3 className="w-4 h-4" />
             </button>
             <button
               onClick={() => setViewMode("list")}
               className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-300 ${
                 viewMode === "list" ? "bg-blue-500 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
               }`}
             >
               <List className="w-4 h-4" />
             </button>
           </div>
         </div>
 
         {/* Projects Grid View */}
         {viewMode === "grid" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredProjects.map((project) => {
               const colors = statusColors[project.status];
               return (
                 <motion.div
                   key={project.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}
                   onClick={() => navigate(`/project/${project.id}`)}
                 >
                   {/* Header */}
                   <div className={`${colors.bg} p-4`}>
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <h3 className="font-bold text-slate-900 text-lg leading-tight">{project.name}</h3>
                         <p className="text-sm text-slate-600 mt-1">{project.course}</p>
                       </div>
                       <span
                         className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1`}
                       >
                         {project.status === "healthy" && <CheckCircle className="w-3 h-3" />}
                         {project.status === "needs_attention" && <AlertCircle className="w-3 h-3" />}
                         {project.status === "at_risk" && <AlertTriangle className="w-3 h-3" />}
                         {project.status.replace("_", " ")}
                       </span>
                     </div>
                   </div>
 
                   {/* Metrics Grid */}
                   <div className="p-4">
                     <div className="grid grid-cols-4 gap-2 mb-4">
                       <div className="text-center">
                         <p className="text-xs text-slate-500">Students</p>
                         <p className="text-lg font-bold text-slate-900">{project.student_count}</p>
                       </div>
                       <div className="text-center">
                         <p className="text-xs text-slate-500">Progress</p>
                         <p className="text-lg font-bold text-slate-900">{project.progress}%</p>
                       </div>
                       <div className="text-center">
                         <p className="text-xs text-slate-500">Risk</p>
                         <p
                           className={`text-lg font-bold ${
                             project.risk_score > 70
                               ? "text-red-600"
                               : project.risk_score > 40
                               ? "text-yellow-600"
                               : "text-green-600"
                           }`}
                         >
                           {project.risk_score}
                         </p>
                       </div>
                       <div className="text-center">
                         <p className="text-xs text-slate-500">Issues</p>
                         <p className="text-lg font-bold text-slate-900">{project.issues_count}</p>
                       </div>
                     </div>
 
                     {/* Progress Bar */}
                     <div className="mb-4">
                       <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                         <span>Completion</span>
                         <span>{project.progress}%</span>
                       </div>
                       <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                         <div
                           className="h-full bg-blue-500 rounded-full transition-all duration-300"
                           style={{ width: `${project.progress}%` }}
                         />
                       </div>
                     </div>
 
                     {/* Footer */}
                     <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-1 text-slate-500">
                         <Clock className="w-4 h-4" />
                         <span>Due {formatDate(project.deadline)}</span>
                       </div>
                       {project.flagged_students > 0 && (
                         <div className="flex items-center gap-1 text-red-500">
                           <AlertTriangle className="w-4 h-4" />
                           <span>{project.flagged_students} flagged</span>
                         </div>
                       )}
                     </div>
                     <p className="text-xs text-slate-400 mt-2">
                       Last activity: {formatRelativeTime(project.last_activity)}
                     </p>
                   </div>
                 </motion.div>
               );
             })}
           </div>
         )}
 
         {/* Projects List View */}
         {viewMode === "list" && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             {/* Table Header */}
             <div className="grid grid-cols-8 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
               <div className="col-span-2">Project</div>
               <div>Course</div>
               <div>Students</div>
               <div>Status</div>
               <div>Progress</div>
               <div>Deadline</div>
               <div className="text-right">Actions</div>
             </div>
 
             {/* Table Rows */}
             <div className="divide-y divide-slate-200">
               {filteredProjects.map((project) => {
                 const colors = statusColors[project.status];
                 return (
                   <div
                     key={project.id}
                     className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer items-center"
                     onClick={() => navigate(`/project/${project.id}`)}
                   >
                     {/* Project Name */}
                     <div className="col-span-2">
                       <div className="flex items-center gap-3">
                         <div
                           className={`w-10 h-10 ${colors.bg} ${colors.border} border rounded-lg flex items-center justify-center`}
                         >
                           <FolderOpen className={`w-5 h-5 ${colors.text}`} />
                         </div>
                         <div>
                           <p className="font-semibold text-slate-900">{project.name}</p>
                           <p className="text-xs text-slate-500">ID: {project.id.slice(0, 8)}</p>
                         </div>
                       </div>
                     </div>
 
                     {/* Course */}
                     <div className="text-slate-700">{project.course}</div>
 
                     {/* Students */}
                     <div>
                       <div className="flex items-center gap-1 text-slate-700">
                         <Users className="w-4 h-4" />
                         {project.student_count}
                       </div>
                     </div>
 
                     {/* Status */}
                     <div>
                       <span className={`${colors.text} font-medium text-sm`}>
                         {project.status === "healthy" && "● "}
                         {project.status === "needs_attention" && "◐ "}
                         {project.status === "at_risk" && "○ "}
                         {project.status.replace("_", " ")}
                       </span>
                     </div>
 
                     {/* Progress */}
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="text-sm font-medium text-slate-700">{project.progress}%</span>
                         <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div
                             className="h-full bg-blue-500 rounded-full"
                             style={{ width: `${project.progress}%` }}
                           />
                         </div>
                       </div>
                     </div>
 
                     {/* Deadline */}
                     <div>
                       <div className="flex items-center gap-1 text-slate-700 text-sm">
                         <Calendar className="w-4 h-4" />
                         {formatDate(project.deadline)}
                       </div>
                       <p className="text-xs text-slate-500">{getDaysUntil(project.deadline)} days</p>
                     </div>
 
                     {/* Actions */}
                     <div className="text-right">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           toast.info("Menu options coming soon");
                         }}
                         className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                       >
                         <MoreVertical className="w-5 h-5 text-slate-500" />
                       </button>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}
 
         {/* Empty State */}
         {filteredProjects.length === 0 && (
           <div className="text-center py-16">
             <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
             <p className="text-slate-600 mb-4">
               {hasActiveFilters
                 ? "Try adjusting your filters"
                 : "Create your first project to get started"}
             </p>
             {hasActiveFilters ? (
               <Button onClick={clearAllFilters} variant="outline">
                 Clear Filters
               </Button>
             ) : (
               <Button onClick={() => setShowCreateProject(true)} className="bg-blue-500 hover:bg-blue-600">
                 <Plus className="w-4 h-4 mr-2" />
                 Create Project
               </Button>
             )}
           </div>
         )}
       </div>
 
       {/* Create Project Modal */}
       {showCreateProject && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           >
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-slate-200">
               <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
               <button
                 onClick={() => setShowCreateProject(false)}
                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
               >
                 <X className="w-5 h-5 text-slate-600" />
               </button>
             </div>
 
             {/* Step Indicator */}
             <div className="flex items-center justify-center gap-4 p-6 border-b border-slate-200">
               <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-blue-600" : "text-slate-400"}`}>
                 <div
                   className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                     currentStep >= 1 ? "bg-blue-500 text-white" : "bg-slate-200"
                   }`}
                 >
                   1
                 </div>
                 <span className="text-sm font-medium">Details</span>
               </div>
               <div className={`w-16 h-1 rounded ${currentStep >= 2 ? "bg-blue-500" : "bg-slate-200"}`} />
               <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-blue-600" : "text-slate-400"}`}>
                 <div
                   className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                     currentStep >= 2 ? "bg-blue-500 text-white" : "bg-slate-200"
                   }`}
                 >
                   2
                 </div>
                 <span className="text-sm font-medium">Students</span>
               </div>
               <div className={`w-16 h-1 rounded ${currentStep >= 3 ? "bg-blue-500" : "bg-slate-200"}`} />
               <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-blue-600" : "text-slate-400"}`}>
                 <div
                   className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                     currentStep >= 3 ? "bg-blue-500 text-white" : "bg-slate-200"
                   }`}
                 >
                   3
                 </div>
                 <span className="text-sm font-medium">Files</span>
               </div>
             </div>
 
             {/* Body */}
             <div className="p-6">
               {/* Step 1: Project Details */}
               {currentStep === 1 && (
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                     <input
                       type="text"
                       placeholder="e.g., Final Group Project"
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       value={projectName}
                       onChange={(e) => setProjectName(e.target.value)}
                     />
                   </div>
 
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Course *</label>
                     <select
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       value={projectCourse}
                       onChange={(e) => setProjectCourse(e.target.value)}
                     >
                       <option value="">Select a course</option>
                       {courses.map((course) => (
                         <option key={course} value={course}>
                           {course}
                         </option>
                       ))}
                     </select>
                   </div>
 
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                     <textarea
                       rows={3}
                       placeholder="Brief description of the project..."
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       value={projectDescription}
                       onChange={(e) => setProjectDescription(e.target.value)}
                     />
                   </div>
 
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Deadline *</label>
                       <input
                         type="date"
                         className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         value={projectDeadline}
                         onChange={(e) => setProjectDeadline(e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Team Size</label>
                       <select
                         className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         value={teamSize}
                         onChange={(e) => setTeamSize(e.target.value)}
                       >
                         <option value="3">3 students</option>
                         <option value="4">4 students</option>
                         <option value="5">5 students</option>
                         <option value="6">6 students</option>
                       </select>
                     </div>
                   </div>
                 </div>
               )}
 
               {/* Step 2: Add Students */}
               {currentStep === 2 && (
                 <div className="space-y-4">
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <p className="text-sm text-blue-800">
                       Add students by email. They'll receive an invitation to join the project.
                     </p>
                   </div>
 
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Student Emails (one per line)
                     </label>
                     <textarea
                       rows={8}
                       placeholder={"alice@university.edu\nbob@university.edu\ncarol@university.edu"}
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                       value={studentEmails}
                       onChange={(e) => setStudentEmails(e.target.value)}
                     />
                     <p className="text-xs text-slate-500 mt-1">
                       {studentEmails.split("\n").filter((e) => e.trim()).length} students added
                     </p>
                   </div>
 
                   <div className="flex items-center gap-2">
                     <input
                       type="checkbox"
                       id="importLMS"
                       checked={importFromLMS}
                       onChange={(e) => setImportFromLMS(e.target.checked)}
                       className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="importLMS" className="text-sm text-slate-600">
                       Import students from Canvas/Blackboard (coming soon)
                     </label>
                   </div>
                 </div>
               )}
 
               {/* Step 3: Add Files */}
               {currentStep === 3 && (
                 <div className="space-y-4">
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <p className="text-sm text-blue-800">
                       Add Google Docs, Sheets, or Slides URLs to track. FairGrade will monitor changes and
                       contributions.
                     </p>
                   </div>
 
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Google Drive File URLs (one per line)
                     </label>
                     <textarea
                       rows={6}
                       placeholder="https://docs.google.com/document/d/..."
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                       value={fileUrls}
                       onChange={(e) => setFileUrls(e.target.value)}
                     />
                     <p className="text-xs text-slate-500 mt-1">
                       {fileUrls.split("\n").filter((u) => u.trim()).length} files added
                     </p>
                   </div>
 
                   <button
                     onClick={() => toast.info("Google Picker integration coming soon")}
                     className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                   >
                     <FolderPlus className="w-4 h-4" />
                     Or select files using Google Picker
                   </button>
                 </div>
               )}
             </div>
 
             {/* Footer */}
             <div className="flex gap-3 p-6 border-t border-slate-200">
               {currentStep > 1 && (
                 <Button onClick={() => setCurrentStep(currentStep - 1)} variant="outline">
                   ← Back
                 </Button>
               )}
               <Button
                 onClick={() => setShowCreateProject(false)}
                 variant="outline"
                 className="flex-1 border-slate-300"
               >
                 Cancel
               </Button>
               {currentStep < 3 ? (
                 <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex-1 bg-blue-500 hover:bg-blue-600">
                   Next →
                 </Button>
               ) : (
                 <Button onClick={handleCreateProject} className="flex-1 bg-blue-500 hover:bg-blue-600">
                   Create Project
                 </Button>
               )}
             </div>
           </motion.div>
         </div>
       )}
 
       {/* Bulk Actions Modal */}
       {showBulkActions && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
           >
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-slate-200">
               <h2 className="text-2xl font-bold text-slate-900">Bulk Actions</h2>
               <button
                 onClick={() => setShowBulkActions(false)}
                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
               >
                 <X className="w-5 h-5 text-slate-600" />
               </button>
             </div>
 
             {/* Body */}
             <div className="p-6 space-y-4">
               <p className="text-sm text-slate-600">
                 Apply actions to multiple projects at once. Select projects first, then choose an action.
               </p>
 
               {/* Action Buttons */}
               <div className="grid grid-cols-2 gap-4">
                 <button
                   onClick={() => {
                     toast.success("Generating reports...");
                     setShowBulkActions(false);
                   }}
                   className="p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <Download className="w-5 h-5 text-blue-500" />
                     <span className="font-semibold text-slate-900">Export All Reports</span>
                   </div>
                   <p className="text-xs text-slate-600">Download PDF reports for all selected projects</p>
                 </button>
 
                 <button
                   onClick={() => {
                     toast.success("Sending reminders...");
                     setShowBulkActions(false);
                   }}
                   className="p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <Mail className="w-5 h-5 text-blue-500" />
                     <span className="font-semibold text-slate-900">Send Reminder</span>
                   </div>
                   <p className="text-xs text-slate-600">Email reminder to all students in selected projects</p>
                 </button>
 
                 <button
                   onClick={() => {
                     toast.success("Deadline extended!");
                     setShowBulkActions(false);
                   }}
                   className="p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <Calendar className="w-5 h-5 text-blue-500" />
                     <span className="font-semibold text-slate-900">Extend Deadline</span>
                   </div>
                   <p className="text-xs text-slate-600">Add extra days to selected project deadlines</p>
                 </button>
 
                 <button
                   onClick={() => {
                     toast.success("Projects archived!");
                     setShowBulkActions(false);
                   }}
                   className="p-4 border-2 border-slate-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <Archive className="w-5 h-5 text-red-500" />
                     <span className="font-semibold text-slate-900">Archive Projects</span>
                   </div>
                   <p className="text-xs text-slate-600">Move selected projects to archive</p>
                 </button>
               </div>
             </div>
 
             {/* Footer */}
             <div className="flex gap-3 p-6 border-t border-slate-200">
               <Button onClick={() => setShowBulkActions(false)} variant="outline" className="flex-1">
                 Close
               </Button>
             </div>
           </motion.div>
         </div>
       )}
     </div>
   );
 }