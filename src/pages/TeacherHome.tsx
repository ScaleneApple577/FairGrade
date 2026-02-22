import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, BookOpen, FileText, Monitor, User, Clock, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";
import { SidebarDashboardLayout, SidebarNavItem } from "@/components/layout/SidebarDashboardLayout";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";
import { ClassroomCard } from "@/components/classroom/ClassroomCard";
import { CreateClassroomModal } from "@/components/classroom/CreateClassroomModal";
import { AssignmentCard } from "@/components/classroom/AssignmentCard";
import { Card, CardContent } from "@/components/ui/card";

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  created_at?: string;
  projects?: any[];
}

interface SubmissionFile {
  id: string;
  name: string;
  student_name?: string;
  student_email?: string;
  submitted_at?: string;
  drive_file_id?: string;
  projectName: string;
  projectId: string;
  classroomName: string;
}

const NAV_ITEMS: SidebarNavItem[] = [
  { key: 'classroom', label: 'Classroom', icon: LayoutGrid },
  { key: 'assignments', label: 'Assignments', icon: BookOpen },
  { key: 'submissions', label: 'Submissions', icon: FileText },
  { key: 'monitoring', label: 'Monitoring', icon: Monitor },
];

export default function TeacherHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom');
  const [submissions, setSubmissions] = useState<SubmissionFile[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
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

  const fetchMonitoringData = async () => {
    setMonitoringLoading(true);
    try {
      const cls = await api.get<Classroom[]>("/api/classrooms");
      const classroomList = Array.isArray(cls) ? cls : [];
      const projects = await api.get<any[]>("/api/projects");
      const projectList = Array.isArray(projects) ? projects : [];

      const allSubs: SubmissionFile[] = [];
      for (const project of projectList) {
        try {
          const files = await api.get<any[]>(`/api/projects/${project.id}/files`);
          const fileList = Array.isArray(files) ? files : [];
          const classroom = classroomList.find((c: any) => c.id === project.classroom_id);
          for (const file of fileList) {
            allSubs.push({
              id: file.id,
              name: file.name,
              student_name: file.student_name || file.student_email || 'Unknown',
              student_email: file.student_email,
              submitted_at: file.submitted_at || file.created_at,
              drive_file_id: file.drive_file_id,
              projectName: project.name,
              projectId: project.id,
              classroomName: classroom?.name || 'Unknown',
            });
          }
        } catch {
          // skip projects with no files
        }
      }
      setSubmissions(allSubs);
    } catch {
      setSubmissions([]);
    } finally {
      setMonitoringLoading(false);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  useEffect(() => {
    if (activeTab === 'monitoring') {
      fetchMonitoringData();
    }
  }, [activeTab]);

  const allAssignments = classrooms.flatMap(c =>
    (c.projects || []).map((p: any) => ({ ...p, classroomName: c.name }))
  );

  return (
    <SidebarDashboardLayout navItems={NAV_ITEMS} activeItem={activeTab} onItemChange={setActiveTab}>
      <WelcomeBanner />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
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

          {activeTab === 'submissions' && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Student submissions across all assignments will appear here.</p>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground">Student Activity Monitoring</h2>
              </div>
              {monitoringLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-16">
                  <Monitor className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No submissions to monitor yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submissions.map((sub) => (
                    <Card key={sub.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{sub.student_name}</p>
                            {sub.student_email && (
                              <p className="text-xs text-muted-foreground truncate">{sub.student_email}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{sub.projectName}</span> · {sub.classroomName}
                          </p>
                          {sub.submitted_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(sub.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/teacher/classroom/${sub.projectId}`)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        >
                          View Replay
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <CreateClassroomModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => fetchClassrooms()}
      />
    </SidebarDashboardLayout>
  );
}
