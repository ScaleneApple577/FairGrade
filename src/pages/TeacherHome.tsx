import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, BookOpen, Calendar as CalendarIcon, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";
import { DashboardTabs } from "@/components/layout/DashboardTabs";
import { ClassroomCard } from "@/components/classroom/ClassroomCard";
import { CreateClassroomModal } from "@/components/classroom/CreateClassroomModal";
import { AssignmentCard } from "@/components/classroom/AssignmentCard";

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  created_at?: string;
  projects?: any[];
}

const TABS = [
  { key: 'classroom', label: 'Classroom' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'submissions', label: 'Submissions' },
  { key: 'calendar', label: 'Calendar' },
];

export default function TeacherHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom');
  const navigate = useNavigate();

  const fetchClassrooms = async () => {
    try {
      const data = await api.get<Classroom[]>("/api/classrooms");
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  // Collect all assignments across classrooms
  const allAssignments = classrooms.flatMap(c =>
    (c.projects || []).map((p: any) => ({ ...p, classroomName: c.name }))
  );

  return (
    <DashboardLayout>
      <WelcomeBanner />
      <DashboardTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Classroom Tab */}
          {activeTab === 'classroom' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground">My Classes</h2>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Classroom
                </button>
              </div>
              {classrooms.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-medium text-foreground mb-1">No classes yet</h2>
                  <p className="text-sm text-muted-foreground mb-4">Create your first classroom to get started</p>
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Classroom
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.map((c) => (
                    <ClassroomCard
                      key={c.id}
                      classroom={c}
                      onClick={() => navigate(`/teacher/classroom/${c.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground">All Assignments</h2>
              </div>
              {allAssignments.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No assignments yet. Create assignments from within a classroom.</p>
                </div>
              ) : (
                <div className="gc-card divide-y divide-border">
                  {allAssignments.map((p: any) => (
                    <AssignmentCard key={p.id} project={p} onClick={() => navigate(`/teacher/classroom/${p.classroom_id || ''}`)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Student submissions across all assignments will appear here.</p>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="text-center py-16">
              <CalendarIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Upcoming deadlines and events will appear here.</p>
            </div>
          )}
        </>
      )}

      <CreateClassroomModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => fetchClassrooms()}
      />
    </DashboardLayout>
  );
}
