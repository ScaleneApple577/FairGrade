import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Loader2, BookOpen, Calendar as CalendarIcon, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClassroomCard } from "@/components/classroom/ClassroomCard";
import { JoinClassroomModal } from "@/components/classroom/JoinClassroomModal";
import { MagneticBackground } from "@/components/MagneticBackground";

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  instructor_name?: string;
}

interface Assignment {
  id: string;
  classroom_id: string;
  classroom_name?: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
}

export default function StudentHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'classroom');
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const assignmentCountsByClassroom = useMemo(() => {
    const counts: Record<string, number> = {};
    assignments.forEach((a) => {
      if (!a.classroom_id) return;
      const id = String(a.classroom_id);
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [assignments]);

  const fetchClassrooms = async () => {
    try {
      const data = await api.get<Classroom[]>("/api/classrooms");
      setClassrooms(Array.isArray(data) ? data : []);
    } catch { setClassrooms([]); }
  };

  const fetchAssignments = async () => {
    try {
      const data = await api.get<Assignment[]>("/api/assignments/mine");
      setAssignments(Array.isArray(data) ? data : []);
    } catch { setAssignments([]); }
  };

  useEffect(() => {
    Promise.all([fetchClassrooms(), fetchAssignments()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleCardHoverStart = (cardRect: DOMRect) => {
    if (!containerRect) return;
    setHoverTarget({
      x: cardRect.left - containerRect.left,
      y: cardRect.top - containerRect.top,
      width: cardRect.width,
      height: cardRect.height,
    });
  };

  const handleCardHoverEnd = () => {
    setHoverTarget(null);
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {activeTab === 'classroom' && (
            <div ref={containerRef} className="relative w-full min-h-[400px]">
              <MagneticBackground
                particleCount={40}
                containerRect={containerRect}
                targetRect={hoverTarget}
              />
              <div className="relative z-10 w-full text-left">
                <div className="flex items-center justify-between mb-4 w-full">
                  <h2 className="text-lg font-medium text-foreground dark:text-white">My Classes</h2>
                  <button onClick={() => setJoinOpen(true)} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Join Classroom
                  </button>
                </div>
                {classrooms.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground dark:text-white mb-1">Join your first classroom</h2>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">Ask your teacher for the classroom code</p>
                    <button onClick={() => setJoinOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Join Classroom
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-start">
                    {classrooms.map((c, index) => (
                      <ClassroomCard
                        key={c.id}
                        classroom={c}
                        assignmentCount={assignmentCountsByClassroom[String(c.id)] || 0}
                        index={index}
                        onHoverStart={handleCardHoverStart}
                        onHoverEnd={handleCardHoverEnd}
                        onClick={() => navigate(`/student/classroom/${c.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground dark:text-gray-400 mb-3">All Assignments</h2>
              {assignments.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground dark:text-gray-400">No assignments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} onClick={() => navigate(`/student/classroom/${a.classroom_id}`)} className="gc-card p-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground dark:text-white">{a.title}</h3>
                          {a.classroom_name && <p className="text-sm text-muted-foreground dark:text-gray-400">{a.classroom_name}</p>}
                          {a.description && <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">{a.description}</p>}
                        </div>
                        {a.due_date && <p className="text-xs text-muted-foreground dark:text-gray-500 whitespace-nowrap ml-4">Due {new Date(a.due_date).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground dark:text-gray-400">Your submissions will appear here.</p>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="text-center py-16">
              <CalendarIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground dark:text-gray-400">Upcoming deadlines and events will appear here.</p>
            </div>
          )}
        </>
      )}
      <JoinClassroomModal open={joinOpen} onOpenChange={setJoinOpen} onSuccess={fetchClassrooms} />
    </DashboardLayout>
  );
}