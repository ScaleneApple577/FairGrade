import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";

// TODO: Connect to GET http://localhost:8000/api/teacher/students

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  projectCount: number;
  avgScore: number;
  totalWords: number;
  tasksCompleted: number;
  tasksTotal: number;
  meetingAttendance: number;
  flags: number;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/teacher/students
    // fetch('http://localhost:8000/api/teacher/students')
    //   .then(res => res.json())
    //   .then(data => { setStudents(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, []);

  const filteredStudents = useMemo(() => {
    let result = [...students];
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
  }, [students, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">All Students</h1>

        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/10 text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/10 text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="activity">Sort by Activity</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Projects</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Avg Score</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Words</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Tasks</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Meetings</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Flags</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${student.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>{student.avatar}</div>
                        <div>
                          <p className="font-semibold text-white">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-300">{student.projectCount}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${student.avgScore >= 80 ? "text-green-400" : student.avgScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{student.avgScore}</span>
                    </td>
                    <td className="p-4 text-center text-slate-300">{student.totalWords.toLocaleString()}</td>
                    <td className="p-4 text-center text-slate-300">{student.tasksCompleted}/{student.tasksTotal}</td>
                    <td className="p-4 text-center text-slate-300">{student.meetingAttendance}%</td>
                    <td className="p-4 text-center">
                      {student.flags > 0 ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">{student.flags}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">View Report</Button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-16 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No students found</p>
                    <p className="text-slate-500 text-sm mt-1">Students will appear here once they join your projects</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TeacherLayout>
  );
}
