 import { useState, useMemo } from "react";
 import { motion } from "framer-motion";
 import { useNavigate, Link, useLocation } from "react-router-dom";
 import {
   Search,
   Users,
   LayoutDashboard,
   FolderOpen,
   BarChart3,
   Activity,
   FileText,
   Settings,
   LogOut,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 
 const sidebarItems = [
   { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
   { icon: FolderOpen, label: "All Projects", path: "/teacher/projects" },
   { icon: Users, label: "Students", path: "/teacher/students" },
   { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
  { icon: Activity, label: "Live Monitor", path: "/teacher/live-monitor" },
   { icon: FileText, label: "Reports", path: "/teacher/reports" },
   { icon: Settings, label: "Settings", path: "/settings" },
 ];
 
 const mockStudents = [
   { id: "s1", name: "Alice Johnson", email: "alice@university.edu", avatar: "A", avatarColor: "bg-blue-500", projectCount: 3, avgScore: 92, totalWords: 8450, tasksCompleted: 24, tasksTotal: 28, meetingAttendance: 95, flags: 0 },
   { id: "s2", name: "Bob Smith", email: "bob@university.edu", avatar: "B", avatarColor: "bg-green-500", projectCount: 2, avgScore: 78, totalWords: 5820, tasksCompleted: 18, tasksTotal: 24, meetingAttendance: 85, flags: 1 },
   { id: "s3", name: "Carol Williams", email: "carol@university.edu", avatar: "C", avatarColor: "bg-purple-500", projectCount: 3, avgScore: 65, totalWords: 3980, tasksCompleted: 15, tasksTotal: 28, meetingAttendance: 70, flags: 2 },
   { id: "s4", name: "Dave Wilson", email: "dave@university.edu", avatar: "D", avatarColor: "bg-orange-500", projectCount: 2, avgScore: 22, totalWords: 520, tasksCompleted: 3, tasksTotal: 24, meetingAttendance: 40, flags: 3 },
   { id: "s5", name: "Eve Davis", email: "eve@university.edu", avatar: "E", avatarColor: "bg-pink-500", projectCount: 4, avgScore: 88, totalWords: 9100, tasksCompleted: 32, tasksTotal: 36, meetingAttendance: 92, flags: 0 },
   { id: "s6", name: "Frank Chen", email: "frank@university.edu", avatar: "F", avatarColor: "bg-cyan-500", projectCount: 2, avgScore: 45, totalWords: 2100, tasksCompleted: 8, tasksTotal: 20, meetingAttendance: 55, flags: 1 },
   { id: "s7", name: "Grace Lee", email: "grace@university.edu", avatar: "G", avatarColor: "bg-indigo-500", projectCount: 3, avgScore: 95, totalWords: 11200, tasksCompleted: 28, tasksTotal: 28, meetingAttendance: 100, flags: 0 },
   { id: "s8", name: "Henry Brown", email: "henry@university.edu", avatar: "H", avatarColor: "bg-red-500", projectCount: 2, avgScore: 72, totalWords: 4500, tasksCompleted: 16, tasksTotal: 22, meetingAttendance: 78, flags: 0 },
 ];
 
 export default function TeacherStudents() {
   const navigate = useNavigate();
   const location = useLocation();
   const [searchQuery, setSearchQuery] = useState("");
   const [filterProject, setFilterProject] = useState("all");
   const [sortBy, setSortBy] = useState("score");
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate("/auth");
   };
 
   const isActive = (path: string) => location.pathname === path;
 
   const filteredStudents = useMemo(() => {
     let result = [...mockStudents];
     if (searchQuery) {
       const query = searchQuery.toLowerCase();
       result = result.filter((s) => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
     }
     result.sort((a, b) => {
       switch (sortBy) {
         case "score": return b.avgScore - a.avgScore;
         case "name": return a.name.localeCompare(b.name);
         case "activity": return b.totalWords - a.totalWords;
         default: return 0;
       }
     });
     return result;
   }, [searchQuery, sortBy]);
 
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
         <h1 className="text-3xl font-bold text-slate-900 mb-8">All Students</h1>
 
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-2 relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
             </div>
             <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
               <option value="all">All Projects</option>
               <option value="cs101">CS 101</option>
               <option value="business201">Business 201</option>
             </select>
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
               <option value="score">Sort by Score</option>
               <option value="name">Sort by Name</option>
               <option value="activity">Sort by Activity</option>
             </select>
           </div>
         </div>
 
         <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
           <table className="w-full">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="text-left p-4 text-sm font-semibold text-slate-700">Student</th>
                 <th className="text-center p-4 text-sm font-semibold text-slate-700">Projects</th>
                 <th className="text-center p-4 text-sm font-semibold text-slate-700">Avg Score</th>
                 <th className="text-center p-4 text-sm font-semibold text-slate-700">Total Words</th>
                 <th className="text-center p-4 text-sm font-semibold text-slate-700">Tasks</th>
                 <th className="text-center p-4 text-sm font-semibold text-slate-700">Meetings</th>
                 <th className="text-center p-4 text-sm font-semibold text-slate-700">Flags</th>
                 <th className="text-right p-4 text-sm font-semibold text-slate-700">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
               {filteredStudents.map((student) => (
                 <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50">
                   <td className="p-4">
                     <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 ${student.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>{student.avatar}</div>
                       <div>
                         <p className="font-semibold text-slate-900">{student.name}</p>
                         <p className="text-xs text-slate-500">{student.email}</p>
                       </div>
                     </div>
                   </td>
                   <td className="p-4 text-center">{student.projectCount}</td>
                   <td className="p-4 text-center">
                     <span className={`font-bold ${student.avgScore >= 80 ? "text-green-600" : student.avgScore >= 60 ? "text-yellow-600" : "text-red-600"}`}>{student.avgScore}</span>
                   </td>
                   <td className="p-4 text-center">{student.totalWords.toLocaleString()}</td>
                   <td className="p-4 text-center">{student.tasksCompleted}/{student.tasksTotal}</td>
                   <td className="p-4 text-center">{student.meetingAttendance}%</td>
                   <td className="p-4 text-center">
                     {student.flags > 0 ? (
                       <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{student.flags}</span>
                     ) : (
                       <span className="text-slate-400">—</span>
                     )}
                   </td>
                   <td className="p-4 text-right">
                     <Button size="sm" className="bg-blue-500 hover:bg-blue-600">View Report</Button>
                   </td>
                 </motion.tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   );
 }