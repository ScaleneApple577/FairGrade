import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, ChevronRight, Eye, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAssignmentSubmissions, getStatusLabel, getStatusColor, type Submission } from "@/lib/submissionUtils";

interface Assignment {
  id: string;
  classroom_id: string;
  classroom_name?: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
}

export default function TeacherMonitoringPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loadingSubmissions, setLoadingSubmissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get<Assignment[]>("/api/assignments/mine")
      .then(data => setAssignments(Array.isArray(data) ? data : []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (assignmentId: string) => {
    if (expandedId === assignmentId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(assignmentId);
    if (submissions[assignmentId]) return;
    setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: true }));
    try {
      const data = await getAssignmentSubmissions(assignmentId);
      setSubmissions(prev => ({ ...prev, [assignmentId]: data }));
    } catch {
      setSubmissions(prev => ({ ...prev, [assignmentId]: [] }));
    } finally {
      setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="mb-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Live Monitoring</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Click an assignment to see student submissions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-muted-foreground">No assignments yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => (
              <div key={a.id} className="gc-card overflow-hidden">
                <button
                  onClick={() => handleToggle(a.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors text-left"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.classroom_name && `${a.classroom_name} · `}
                      {a.due_date ? `Due ${new Date(a.due_date).toLocaleDateString()}` : 'No due date'}
                    </p>
                  </div>
                  {expandedId === a.id
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  }
                </button>

                {expandedId === a.id && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    {loadingSubmissions[a.id] ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : !submissions[a.id] || submissions[a.id].length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No submissions yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {submissions[a.id].map((sub) => {
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
                                  <a
                                    href={sub.drive_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

