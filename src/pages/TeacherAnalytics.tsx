 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useNavigate, Link, useLocation } from "react-router-dom";
 import {
   TrendingUp,
   Users,
   LayoutDashboard,
   FolderOpen,
   BarChart3,
   Activity,
   FileText,
   Settings,
   LogOut,
   AlertTriangle,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 
 const sidebarItems = [
   { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
   { icon: FolderOpen, label: "All Projects", path: "/teacher/projects" },
   { icon: Users, label: "Students", path: "/teacher/students" },
   { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
   { icon: Activity, label: "Live Monitoring", path: "/teacher/live-monitor" },
   { icon: FileText, label: "Reports", path: "/teacher/reports" },
   { icon: Settings, label: "Settings", path: "/settings" },
 ];
 
 const contributionData = [65, 72, 58, 80, 75, 68, 85];
 const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
 
 const courseData = [
   { course: "CS 101", projects: 8, students: 64, avgScore: 82, completionRate: 87, atRisk: 2 },
   { course: "Business 201", projects: 6, students: 48, avgScore: 74, completionRate: 78, atRisk: 3 },
   { course: "Biology 150", projects: 10, students: 74, avgScore: 79, completionRate: 92, atRisk: 0 },
 ];
 
 export default function TeacherAnalytics() {
   const navigate = useNavigate();
   const location = useLocation();
   const [timeRange, setTimeRange] = useState("7d");
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate("/auth");
   };
 
   const isActive = (path: string) => location.pathname === path;
 
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
         <h1 className="text-3xl font-bold text-slate-900 mb-8">Analytics Dashboard</h1>
 
         {/* Time Range */}
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2 mb-8 inline-flex gap-2">
           {[{ label: "Last 7 Days", value: "7d" }, { label: "Last 30 Days", value: "30d" }, { label: "This Semester", value: "semester" }, { label: "All Time", value: "all" }].map((range) => (
             <button key={range.value} onClick={() => setTimeRange(range.value)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range.value ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{range.label}</button>
           ))}
         </div>
 
         {/* Overview Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
             <p className="text-blue-100 text-sm mb-2">Total Contributions</p>
             <p className="text-4xl font-bold mb-2">24,589</p>
             <p className="text-blue-100 text-sm">+15% from last period</p>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
             <p className="text-green-100 text-sm mb-2">Active Students</p>
             <p className="text-4xl font-bold mb-2">186</p>
             <p className="text-green-100 text-sm">98% engagement rate</p>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
             <p className="text-purple-100 text-sm mb-2">Avg. Contribution Score</p>
             <p className="text-4xl font-bold mb-2">78</p>
             <p className="text-purple-100 text-sm">+3 points from last period</p>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
             <p className="text-red-100 text-sm mb-2">Free-riders Detected</p>
             <p className="text-4xl font-bold mb-2">12</p>
             <p className="text-red-100 text-sm">6% of total students</p>
           </motion.div>
         </div>
 
         {/* Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
             <h2 className="text-xl font-bold text-slate-900 mb-4">Contributions Over Time</h2>
             <div className="h-64 flex items-end gap-2">
               {contributionData.map((height, idx) => (
                 <div key={idx} className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer" style={{ height: `${height}%` }} title={`${height}%`} />
               ))}
             </div>
             <div className="flex justify-between text-xs text-slate-500 mt-2">
               {days.map((day) => (<span key={day}>{day}</span>))}
             </div>
           </div>
 
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
             <h2 className="text-xl font-bold text-slate-900 mb-4">Score Distribution</h2>
             <div className="space-y-3">
               {[{ label: "90-100 (Excellent)", value: 24, color: "bg-green-500" }, { label: "70-89 (Good)", value: 45, color: "bg-blue-500" }, { label: "50-69 (Fair)", value: 22, color: "bg-yellow-500" }, { label: "0-49 (Poor)", value: 9, color: "bg-red-500" }].map((item) => (
                 <div key={item.label}>
                   <div className="flex justify-between text-sm mb-1">
                     <span>{item.label}</span>
                     <span className="font-bold">{item.value}%</span>
                   </div>
                   <div className="w-full bg-slate-200 rounded-full h-3">
                     <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.value}%` }} />
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
 
         {/* Course Comparison */}
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
           <h2 className="text-xl font-bold text-slate-900 mb-4">Course Comparison</h2>
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="border-b border-slate-200">
                 <tr>
                   <th className="text-left p-3 text-sm font-semibold">Course</th>
                   <th className="text-center p-3 text-sm font-semibold">Projects</th>
                   <th className="text-center p-3 text-sm font-semibold">Students</th>
                   <th className="text-center p-3 text-sm font-semibold">Avg Score</th>
                   <th className="text-center p-3 text-sm font-semibold">Completion Rate</th>
                   <th className="text-center p-3 text-sm font-semibold">At-Risk Projects</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                 {courseData.map((row) => (
                   <tr key={row.course}>
                     <td className="p-3">{row.course}</td>
                     <td className="p-3 text-center">{row.projects}</td>
                     <td className="p-3 text-center">{row.students}</td>
                     <td className="p-3 text-center">
                       <span className={`font-bold ${row.avgScore >= 80 ? "text-green-600" : row.avgScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>{row.avgScore}</span>
                     </td>
                     <td className="p-3 text-center">{row.completionRate}%</td>
                     <td className="p-3 text-center">{row.atRisk}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       </div>
     </div>
   );
 }