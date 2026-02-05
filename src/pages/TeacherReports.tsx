 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useNavigate, Link, useLocation } from "react-router-dom";
 import {
   Download,
   Eye,
   Users,
   LayoutDashboard,
   FolderOpen,
   BarChart3,
   Activity,
   FileText,
   Settings,
   LogOut,
   AlertTriangle,
   FileCheck,
   Calendar,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 const sidebarItems = [
   { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
   { icon: FolderOpen, label: "All Projects", path: "/teacher/projects" },
   { icon: Users, label: "Students", path: "/teacher/students" },
   { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
   { icon: Activity, label: "Live Monitor", path: "/teacher/live-monitor" },
   { icon: FileText, label: "Reports", path: "/teacher/reports" },
   { icon: Settings, label: "Settings", path: "/settings" },
 ];
 
 const reportTemplates = [
   { id: 1, icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500", title: "Individual Student Report", description: "Detailed contribution report for a single student with timeline and grade recommendation." },
   { id: 2, icon: Users, color: "text-green-500", bgColor: "bg-green-500", title: "Team Comparison Report", description: "Compare all team members' contributions side-by-side for a specific project." },
   { id: 3, icon: BarChart3, color: "text-purple-500", bgColor: "bg-purple-500", title: "Class Analytics Report", description: "Overview of all projects in a course with aggregate statistics and trends." },
   { id: 4, icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500", title: "At-Risk Students Report", description: "List of students with low contributions, flagged issues, or poor attendance." },
   { id: 5, icon: FileCheck, color: "text-yellow-500", bgColor: "bg-yellow-500", title: "AI/Plagiarism Report", description: "All flagged AI-generated content and plagiarism instances across projects." },
   { id: 6, icon: Calendar, color: "text-indigo-500", bgColor: "bg-indigo-500", title: "Semester Summary", description: "Complete overview of all activity for the entire semester with export option." },
 ];
 
 const recentReports = [
   { id: "r1", name: "CS 101 - Team Comparison Report", createdAt: "2026-02-05T10:30:00Z" },
   { id: "r2", name: "Alice Johnson - Individual Report", createdAt: "2026-02-04T15:45:00Z" },
   { id: "r3", name: "Business 201 - At-Risk Students", createdAt: "2026-02-03T09:20:00Z" },
   { id: "r4", name: "Biology 150 - Class Analytics", createdAt: "2026-02-02T14:10:00Z" },
 ];
 
 export default function TeacherReports() {
   const navigate = useNavigate();
   const location = useLocation();
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate("/auth");
   };
 
   const isActive = (path: string) => location.pathname === path;
 
   const formatRelativeTime = (dateStr: string) => {
     const now = new Date();
     const date = new Date(dateStr);
     const diffMs = now.getTime() - date.getTime();
     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
     if (diffHours < 24) return `${diffHours} hours ago`;
     return `${diffDays} days ago`;
   };
 
   const handleGenerateReport = (title: string) => {
     toast.success(`Generating ${title}...`);
   };
 
   return (
     <div className="min-h-screen bg-slate-50 flex">
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
             <span className="text-xl font-bold"><span className="text-slate-900">Fair</span><span className="text-blue-500">Grade</span></span>
           </Link>
           <div className="mt-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Teacher</span></div>
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
             <LogOut className="h-5 w-5" /><span className="font-medium">Log Out</span>
           </button>
         </div>
       </aside>
 
       <div className="flex-1 ml-64 p-8">
         <h1 className="text-3xl font-bold text-slate-900 mb-8">Reports</h1>
 
         {/* Report Templates */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           {reportTemplates.map((template) => (
             <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 cursor-pointer transition-shadow hover:shadow-xl">
               <template.icon className={`w-12 h-12 ${template.color} mb-4`} />
               <h3 className="font-bold text-slate-900 mb-2">{template.title}</h3>
               <p className="text-sm text-slate-600 mb-4">{template.description}</p>
               <Button onClick={() => handleGenerateReport(template.title)} className={`w-full ${template.bgColor} hover:opacity-90`}>Generate Report</Button>
             </motion.div>
           ))}
         </div>
 
         {/* Recent Reports */}
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
           <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Reports</h2>
           <div className="space-y-3">
             {recentReports.map((report) => (
               <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                 <div className="flex items-center gap-3">
                   <FileText className="w-5 h-5 text-blue-500" />
                   <div>
                     <p className="font-semibold text-slate-900">{report.name}</p>
                     <p className="text-xs text-slate-500">Generated {formatRelativeTime(report.createdAt)}</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="border-slate-300">
                     <Eye className="w-4 h-4 mr-1" />View
                   </Button>
                   <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                     <Download className="w-4 h-4 mr-1" />Download
                   </Button>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );
 }