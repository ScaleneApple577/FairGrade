import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2, BookOpen, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClassroomBanner } from "@/components/classroom/ClassroomBanner";
import { TabBar } from "@/components/classroom/TabBar";
import { AnnouncementCard } from "@/components/classroom/AnnouncementCard";
import { AssignmentCard } from "@/components/classroom/AssignmentCard";
import { FileListItem } from "@/components/classroom/FileListItem";
import { StudentSubmissionForm } from "@/components/classroom/StudentSubmissionForm";

interface ProjectFile {
  id: string;
  name: string;
  drive_file_id: string;
  mime_type: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  files?: ProjectFile[];
  created_at: string;
}

interface ClassroomDetail {
  id: string;
  name: string;
  students: any[];
  projects: Project[];
  created_at: string;
}

interface Announcement {
  id: string;
  author: string;
  date: string;
  message: string;
}

const TABS = [
  { key: 'stream', label: 'Stream' },
  { key: 'classwork', label: 'Classwork' },
];

export default function StudentClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stream');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Classwork state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetail, setProjectDetail] = useState<Project | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const storageKey = `announcements_${id}`;

  const fetchClassroom = useCallback(async () => {
    if (!id) return;

    // TODO: remove dev bypass before production
    if (id === "dev-test") {
      setClassroom({
        id: "dev-test",
        name: "Dev Test Classroom",
        students: [],
        projects: [],
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    try {
      const data = await api.get<ClassroomDetail>(`/api/classrooms/${id}`);
      setClassroom(data);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load classroom" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchClassroom();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setAnnouncements(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [fetchClassroom, storageKey]);

  const openProjectDetail = async (project: Project) => {
    setSelectedProject(project);
    setLoadingDetail(true);
    try {
      const detail = await api.get<Project>(`/api/projects/${project.id}`);
      setProjectDetail(detail);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshProjectDetail = async () => {
    if (!selectedProject) return;
    try {
      const detail = await api.get<Project>(`/api/projects/${selectedProject.id}`);
      setProjectDetail(detail);
    } catch { /* ignore */ }
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" /></div></DashboardLayout>;
  }

  if (!classroom) {
    return <DashboardLayout><p className="text-center text-[#5f6368] py-20">Classroom not found</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <ClassroomBanner id={classroom.id} name={classroom.name} studentCount={classroom.students?.length} />
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {/* Stream Tab */}
          {activeTab === 'stream' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-[#5f6368]">Your teacher hasn't posted any announcements yet.</p>
                </div>
              ) : announcements.map((a) => (
                <AnnouncementCard key={a.id} author={a.author} date={a.date} message={a.message} />
              ))}
            </div>
          )}

          {/* Classwork Tab */}
          {activeTab === 'classwork' && (
            <div className="max-w-2xl mx-auto">
              {selectedProject ? (
                <div className="space-y-4">
                  <button onClick={() => { setSelectedProject(null); setProjectDetail(null); }} className="flex items-center gap-1 text-sm text-[#1a73e8] hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Classwork
                  </button>
                  {loadingDetail ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1a73e8]" /></div>
                  ) : projectDetail ? (
                    <div className="space-y-4">
                      <div className="gc-card p-6 space-y-3">
                        <h2 className="text-xl font-medium text-[#202124]">{projectDetail.name}</h2>
                        {projectDetail.description && <p className="text-sm text-[#5f6368]">{projectDetail.description}</p>}
                        <p className="text-xs text-[#5f6368]">Posted {new Date(projectDetail.created_at).toLocaleDateString()}</p>
                      </div>

                      {/* Existing submissions */}
                      {projectDetail.files && projectDetail.files.length > 0 && (
                        <div className="gc-card p-5">
                          <h3 className="text-sm font-medium text-[#202124] mb-2">Your Submission</h3>
                          {projectDetail.files.map((f) => <FileListItem key={f.id} file={f} />)}
                        </div>
                      )}

                      {/* Submission form */}
                      <StudentSubmissionForm projectId={projectDetail.id} onSuccess={refreshProjectDetail} />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  {(!classroom.projects || classroom.projects.length === 0) ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-[#dadce0] mx-auto mb-3" />
                      <p className="text-sm text-[#5f6368]">No assignments yet. Your teacher will post assignments here.</p>
                    </div>
                  ) : (
                    <div className="gc-card divide-y divide-[#e0e0e0]">
                      {classroom.projects.map((p) => (
                        <AssignmentCard key={p.id} project={p} onClick={() => openProjectDetail(p)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
