import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, BookOpen, Plus, ArrowLeft, Eye, ExternalLink, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TabBar } from "@/components/classroom/TabBar";
import { JoinCodeCard } from "@/components/classroom/JoinCodeCard";
import { StudentRow } from "@/components/classroom/StudentRow";
import { CreateAssignmentModal } from "@/components/classroom/CreateAssignmentModal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAssignmentSubmissions, getStatusLabel, getStatusColor, type Submission } from "@/lib/submissionUtils";

interface Student {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  joined_at?: string;
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

interface ClassroomDetail {
  id: string;
  name: string;
  join_code: string;
  students: Student[];
  student_count?: number;
  created_at: string;
}

interface Announcement {
  id: string;
  author: string;
  date: string;
  message: string;
}

const TABS = [
  { key: 'classwork', label: 'Classwork' },
  { key: 'people', label: 'People' },
];

export default function TeacherClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classwork');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const storageKey = `announcements_${id}`;

  const handleCopyCode = () => {
    if (!classroom?.join_code) return;
    navigator.clipboard.writeText(classroom.join_code);
    setCodeCopied(true);
    toast({ title: "Code copied" });
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const fetchClassroom = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<ClassroomDetail>(`/api/classrooms/${id}`);
      setClassroom(data);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load classroom" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<Assignment[]>(`/api/assignments/classroom/${id}`);
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    }
  }, [id]);

  const fetchSubmissions = async (assignmentId: string) => {
    setLoadingSubmissions(true);
    try {
      const data = await getAssignmentSubmissions(assignmentId);
      setSubmissions(data);
    } catch {
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchClassroom();
    fetchAssignments();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setAnnouncements(JSON.parse(stored)); } catch { }
    }
  }, [fetchClassroom, fetchAssignments, storageKey]);

  const handleSelectAssignment = (a: Assignment) => {
    setSelectedAssignment(a);
    fetchSubmissions(a.id);
  };

  const handlePost = (message: string) => {
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      author: user?.fullName || user?.email || 'Teacher',
      date: new Date().toISOString(),
      message,
    };
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleRegenerate = async () => {
    if (!id) return;
    const newCode = await api.post<string>(`/api/classrooms/${id}/regenerate-code`);
    setClassroom((prev) => prev ? { ...prev, join_code: typeof newCode === 'string' ? newCode : prev.join_code } : prev);
    toast({ title: "Code regenerated" });
  };

  const confirmRemove = async () => {
    if (!id || !removeTarget) return;
    try {
      await api.delete(`/api/classrooms/${id}/members/${removeTarget}`);
      toast({ title: "Student removed" });
      setRemoveTarget(null);
      fetchClassroom();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!classroom) {
    return <DashboardLayout><p className="text-center text-muted-foreground py-20">Classroom not found</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{classroom.name}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
            >
              {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {codeCopied ? 'Copied' : `Code: ${classroom.join_code}`}
            </button>
          </div>
        </div>
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-3">
          {activeTab === 'classwork' && (
            <div>
              {selectedAssignment ? (
                <div className="space-y-3">
                  <button onClick={() => { setSelectedAssignment(null); setSubmissions([]); }} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Classwork
                  </button>
                  <div className="gc-card p-4 space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">{selectedAssignment.title}</h2>
                    {selectedAssignment.description && <p className="text-xs text-muted-foreground">{selectedAssignment.description}</p>}
                    {selectedAssignment.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</p>}
                    <div className="pt-3 border-t border-border">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Student Submissions ({submissions.length})
                      </h3>
                      {loadingSubmissions ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                      ) : submissions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No submissions yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {submissions.map((sub) => {
                            const statusStyle = getStatusColor(sub.status);
                            return (
                              <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/30">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                                    {(sub.student_name || sub.student_email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{sub.student_name || sub.student_email}</p>
                                    {sub.submitted_at && <p className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleString()}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                    {getStatusLabel(sub.status)}
                                  </span>
                                  {sub.drive_file_url && (
                                    <a href={sub.drive_file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => navigate(`/teacher/submission/${sub.id}`)}
                                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                                    title="Live Monitor"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 gap-1">
                      <Plus className="w-4 h-4" /> Create
                    </Button>
                  </div>
                  {assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No assignments yet. Create your first assignment.</p>
                    </div>
                  ) : (
                    <div className="gc-card divide-y divide-border">
                      {assignments.map((a) => (
                        <div key={a.id} onClick={() => handleSelectAssignment(a)} className="p-4 cursor-pointer hover:bg-secondary transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                              {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                            </div>
                            {a.due_date && <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">Due {new Date(a.due_date).toLocaleDateString()}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <CreateAssignmentModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchAssignments} classroomId={id!} />
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-4">
              <JoinCodeCard code={classroom.join_code} onRegenerate={handleRegenerate} />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 pb-1.5 border-b border-border">Teacher</h3>
                <div className="flex items-center gap-2.5 py-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                    {(user?.fullName || user?.email || 'T').charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-foreground">{user?.fullName || user?.email}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 pb-1.5 border-b border-border">
                  Students ({classroom.students?.length || classroom.student_count || 0})
                </h3>
                {(!classroom.students || classroom.students.length === 0) ? (
                  <p className="text-xs text-muted-foreground py-3">No students have joined yet.</p>
                ) : classroom.students.map((s) => (
                  <StudentRow key={s.email} student={s} onRemove={(email) => setRemoveTarget(email)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove {removeTarget}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}