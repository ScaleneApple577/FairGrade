import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2, BookOpen, ArrowLeft, FileText, Link2, ExternalLink, CheckCircle2, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TabBar } from "@/components/classroom/TabBar";
<<<<<<< HEAD
=======
import { AnnouncementCard } from "@/components/classroom/AnnouncementCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { getMySubmissions, createGoogleDoc, createSubmission, type Submission } from "@/lib/submissionUtils";
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f

interface Assignment {
  id: string;
  classroom_id: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
}

interface ClassroomDetail {
  id: string;
  name: string;
  students: any[];
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
];

export default function StudentClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classwork');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"choose" | "import">("choose");
  const [importUrl, setImportUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const storageKey = `announcements_${id}`;

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

  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await getMySubmissions();
      setSubmissions(data);
    } catch {
      setSubmissions([]);
    }
  }, []);

  useEffect(() => {
    fetchClassroom();
    fetchAssignments();
    fetchSubmissions();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setAnnouncements(JSON.parse(stored)); } catch { }
    }
  }, [fetchClassroom, fetchAssignments, fetchSubmissions, storageKey]);

  function getSubmissionForAssignment(assignmentId: string): Submission | undefined {
    return submissions.find((s) => s.assignment_id === assignmentId);
  }

  function handleAssignmentClick(a: Assignment) {
    const existing = getSubmissionForAssignment(a.id);
    setSelectedAssignment(a);
    if (existing) {
      // Already has a submission — just show the detail view
      setDialogOpen(false);
    } else {
      // No submission yet — show the create/import dialog
      setDialogMode("choose");
      setImportUrl("");
      setDialogOpen(true);
    }
  }

  async function handleCreateDoc() {
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      const sub = await createGoogleDoc(selectedAssignment.id);
      setSubmissions((prev) => [...prev, sub]);
      setDialogOpen(false);
      if (sub.drive_file_url) {
        window.open(sub.drive_file_url, "_blank");
      }
      toast({ title: "Google Doc created", description: "Your document has been created and linked." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to create Google Doc" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImportDoc() {
    if (!selectedAssignment || !importUrl.trim()) return;
    setSubmitting(true);
    try {
      const sub = await createSubmission({
        assignment_id: selectedAssignment.id,
        drive_file_url: importUrl.trim(),
      });
      setSubmissions((prev) => [...prev, sub]);
      setDialogOpen(false);
      setImportUrl("");
      toast({ title: "Document linked", description: "Your Google Doc has been linked to this assignment." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to link document" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!classroom) {
    return <DashboardLayout><p className="text-center text-muted-foreground py-20">Classroom not found</p></DashboardLayout>;
  }

  const existingSub = selectedAssignment ? getSubmissionForAssignment(selectedAssignment.id) : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{classroom.name}</h1>
        </div>
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-3">
          {activeTab === 'classwork' && (
            <div>
              {selectedAssignment ? (
                <div className="space-y-3">
                  <button onClick={() => setSelectedAssignment(null)} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Classwork
                  </button>
                  <div className="gc-card p-4 space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">{selectedAssignment.title}</h2>
                    {selectedAssignment.description && <p className="text-xs text-muted-foreground">{selectedAssignment.description}</p>}
                    {selectedAssignment.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</p>}
                    <p className="text-xs text-muted-foreground">Posted {new Date(selectedAssignment.created_at).toLocaleDateString()}</p>

                    {/* Submission status */}
                    {existingSub ? (
                      <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-foreground">Your work</span>
                          <span className={`ml-auto px-2.5 py-1 text-xs font-medium rounded-full ${existingSub.status === "submitted" ? "bg-emerald-500/15 text-emerald-400" : existingSub.status === "in_progress" ? "bg-blue-500/15 text-blue-400" : "bg-slate-500/15 text-slate-400"}`}>
                            {existingSub.status === "not_started" ? "Not Started" : existingSub.status === "in_progress" ? "In Progress" : "Submitted"}
                          </span>
                        </div>
                        {existingSub.drive_file_url && (
                          <a
                            href={existingSub.drive_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary transition-colors"
                          >
                            <FileText className="w-5 h-5 text-[#4285f4]" />
                            <span className="text-sm text-foreground flex-1">Your Google Doc</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border">
                        <button
                          onClick={() => { setDialogMode("choose"); setImportUrl(""); setDialogOpen(true); }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add your work
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No assignments yet. Your teacher will post assignments here.</p>
                    </div>
                  ) : (
                    <div className="gc-card divide-y divide-border">
<<<<<<< HEAD
                      {assignments.map((a) => (
                        <div key={a.id} onClick={() => setSelectedAssignment(a)} className="p-4 cursor-pointer hover:bg-secondary transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                              {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
=======
                      {assignments.map((a) => {
                        const sub = getSubmissionForAssignment(a.id);
                        return (
                          <div key={a.id} onClick={() => handleAssignmentClick(a)} className="p-4 cursor-pointer hover:bg-secondary transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${sub ? "bg-emerald-500/15" : "bg-[#1a73e8]/10"}`}>
                                  {sub ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <FileText className="w-4.5 h-4.5 text-[#1a73e8]" />}
                                </div>
                                <div>
                                  <h3 className="font-medium text-foreground">{a.title}</h3>
                                  {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {a.due_date && <p className="text-xs text-muted-foreground whitespace-nowrap">Due {new Date(a.due_date).toLocaleDateString()}</p>}
                                {sub && (
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sub.status === "submitted" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"}`}>
                                    {sub.status === "submitted" ? "Submitted" : "In Progress"}
                                  </span>
                                )}
                              </div>
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Import Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {dialogMode === "choose"
                ? "How would you like to add your work?"
                : "Paste your Google Docs link below"}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "choose" ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCreateDoc}
                disabled={submitting}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-[#1a73e8] hover:bg-[#1a73e8]/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#4285f4]/10 flex items-center justify-center group-hover:bg-[#4285f4]/20 transition-colors">
                  <FileText className="w-5 h-5 text-[#4285f4]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Create new Google Doc</p>
                  <p className="text-xs text-muted-foreground">We'll create a blank doc in your Drive</p>
                </div>
                {submitting && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </button>

              <button
                onClick={() => setDialogMode("import")}
                disabled={submitting}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-[#1a73e8] hover:bg-[#1a73e8]/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1a73e8]/10 flex items-center justify-center group-hover:bg-[#1a73e8]/20 transition-colors">
                  <Link2 className="w-5 h-5 text-[#1a73e8]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Import existing Google Doc</p>
                  <p className="text-xs text-muted-foreground">Link a doc you've already started</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Google Docs link</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1.5">Paste the full URL from your browser's address bar</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDialogMode("choose")}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImportDoc}
                  disabled={submitting || !importUrl.trim()}
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Link Document
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
