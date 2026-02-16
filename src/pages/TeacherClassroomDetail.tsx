import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClassroomBanner } from "@/components/classroom/ClassroomBanner";
import { TabBar } from "@/components/classroom/TabBar";
import { AnnouncementInput } from "@/components/classroom/AnnouncementInput";
import { AnnouncementCard } from "@/components/classroom/AnnouncementCard";
import { JoinCodeCard } from "@/components/classroom/JoinCodeCard";
import { StudentRow } from "@/components/classroom/StudentRow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Student {
  email: string;
  first_name?: string;
  last_name?: string;
  joined_at?: string;
}

interface ClassroomDetail {
  id: string;
  name: string;
  join_code: string;
  students: Student[];
  projects: any[];
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
  { key: 'people', label: 'People' },
];

export default function TeacherClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stream');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

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

  useEffect(() => {
    fetchClassroom();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setAnnouncements(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [fetchClassroom, storageKey]);

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
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" /></div>
      </AppLayout>
    );
  }

  if (!classroom) {
    return (
      <AppLayout>
        <p className="text-center text-[#5f6368] py-20">Classroom not found</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <ClassroomBanner
          id={classroom.id}
          name={classroom.name}
          joinCode={classroom.join_code}
          studentCount={classroom.students?.length}
        />

        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'stream' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <AnnouncementInput
                onPost={handlePost}
                authorName={user?.fullName || user?.email || 'T'}
              />
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-[#5f6368]">This is where you can talk to your class.</p>
                  <p className="text-sm text-[#5f6368]">Share announcements and resources with everyone.</p>
                </div>
              ) : (
                announcements.map((a) => (
                  <AnnouncementCard key={a.id} author={a.author} date={a.date} message={a.message} />
                ))
              )}
            </div>
          )}

          {activeTab === 'classwork' && (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <BookOpen className="w-12 h-12 text-[#dadce0] mx-auto mb-3" />
              <p className="text-sm text-[#5f6368]">Assignments will appear here once you create them.</p>
              <button className="mt-4 px-4 py-2 text-sm text-[#5f6368] bg-[#f1f3f4] rounded-lg cursor-not-allowed opacity-60" disabled>
                + Create (Coming soon)
              </button>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <JoinCodeCard code={classroom.join_code} onRegenerate={handleRegenerate} />

              {/* Teacher */}
              <div>
                <h3 className="text-sm font-medium text-[#1a73e8] mb-2 pb-2 border-b border-[#1a73e8]">Teacher</h3>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-xs font-medium">
                    {(user?.fullName || user?.email || 'T').charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm text-[#202124] font-medium">{user?.fullName || user?.email}</p>
                </div>
              </div>

              {/* Students */}
              <div>
                <h3 className="text-sm font-medium text-[#1a73e8] mb-2 pb-2 border-b border-[#1a73e8]">
                  Students ({classroom.students?.length || 0})
                </h3>
                {(!classroom.students || classroom.students.length === 0) ? (
                  <p className="text-sm text-[#5f6368] py-4">No students have joined yet. Share the join code above.</p>
                ) : (
                  classroom.students.map((s) => (
                    <StudentRow key={s.email} student={s} onRemove={(email) => setRemoveTarget(email)} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeTarget} from this classroom?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
