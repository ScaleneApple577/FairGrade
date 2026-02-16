import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClassroomBanner } from "@/components/classroom/ClassroomBanner";
import { TabBar } from "@/components/classroom/TabBar";
import { AnnouncementCard } from "@/components/classroom/AnnouncementCard";

interface ClassroomDetail {
  id: string;
  name: string;
  students: any[];
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
];

export default function StudentClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stream');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

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
          studentCount={classroom.students?.length}
        />

        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'stream' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-[#5f6368]">Your teacher hasn't posted any announcements yet.</p>
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
              <p className="text-sm text-[#5f6368]">No assignments yet. Your teacher will post assignments here.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
