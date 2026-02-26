import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Loader2, BookOpen, FileText, Calendar as CalendarIcon, Eye, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClassroomCard } from "@/components/classroom/ClassroomCard";
import { CreateClassroomModal } from "@/components/classroom/CreateClassroomModal";
<<<<<<< HEAD
import { MagneticBackground } from "@/components/MagneticBackground";
=======
import { getMonitoringStatus, getMonitoringStateColor, type MonitoringStatus } from "@/lib/monitoringUtils";
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  created_at?: string;
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

export default function TeacherHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
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

  const fetchMonitoring = async () => {
    try {
      const data = await getMonitoringStatus();
      setMonitoringData(data);
    } catch { setMonitoringData([]); }
  };

  useEffect(() => {
    Promise.all([fetchClassrooms(), fetchAssignments(), fetchMonitoring()]).finally(() => setLoading(false));
  }, []);

  // Auto-refresh monitoring data every 15s when on monitoring tab
  useEffect(() => {
    if (activeTab !== 'monitoring') return;
    const interval = setInterval(fetchMonitoring, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

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
                  <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Create Classroom
                  </button>
                </div>
                {classrooms.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground dark:text-white mb-1">No classes yet</h2>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">Create your first classroom to get started</p>
                    <button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Create Classroom
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
                        onClick={() => navigate(`/teacher/classroom/${c.id}`)}
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
                  <p className="text-sm text-muted-foreground dark:text-gray-400">No assignments yet. Create assignments from within a classroom.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} onClick={() => navigate(`/teacher/classroom/${a.classroom_id}`)} className="gc-card p-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-700">
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
<<<<<<< HEAD
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground dark:text-gray-400">Student submissions across all assignments will appear here.</p>
=======
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">All Submissions</h2>
              {monitoringData.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No submissions yet. Students will submit their work from their classrooms.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {monitoringData.map((item) => (
                    <div
                      key={item.submission_id}
                      onClick={() => navigate(`/teacher/submission/${item.submission_id}`)}
                      className="gc-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-xs font-semibold">
                            {(item.student_name || item.student_email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.student_name || item.student_email}</p>
                            <p className="text-xs text-muted-foreground">{item.assignment_title}{item.classroom_name ? ` · ${item.classroom_name}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.flag_count > 0 && (
                            <span className="flex items-center gap-1 text-xs text-orange-500">
                              <AlertTriangle className="w-3.5 h-3.5" /> {item.flag_count}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.status === "submitted" ? "bg-emerald-500/15 text-emerald-400" : item.status === "in_progress" ? "bg-blue-500/15 text-blue-400" : "bg-slate-500/15 text-slate-400"}`}>
                            {item.status === "not_started" ? "Not Started" : item.status === "in_progress" ? "In Progress" : "Submitted"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
            </div>
          )}

          {activeTab === 'monitoring' && (
<<<<<<< HEAD
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground dark:text-gray-400">Live monitoring of student submissions will appear here.</p>
=======
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Live Monitoring</h2>
              {monitoringData.length === 0 ? (
                <div className="text-center py-16">
                  <Eye className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No submissions are being monitored yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Monitoring starts when students link their Google Docs to assignments.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {monitoringData.map((item) => {
                    const stateColor = getMonitoringStateColor(item.monitoring_state);
                    return (
                      <div
                        key={item.submission_id}
                        onClick={() => navigate(`/teacher/submission/${item.submission_id}`)}
                        className="gc-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-xs font-semibold">
                              {(item.student_name || item.student_email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.student_name || item.student_email}</p>
                              <p className="text-xs text-muted-foreground">{item.assignment_title}{item.classroom_name ? ` · ${item.classroom_name}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {item.flag_count > 0 && (
                              <span className="flex items-center gap-1 text-xs text-orange-500">
                                <AlertTriangle className="w-3.5 h-3.5" /> {item.flag_count}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{item.snapshot_count} snapshots</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${stateColor.bg} ${stateColor.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${stateColor.dot} ${item.monitoring_state === "active" ? "animate-pulse" : ""}`} />
                              {item.monitoring_state}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
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
      <CreateClassroomModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => fetchClassrooms()} />
    </DashboardLayout>
  );
}