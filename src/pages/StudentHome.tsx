import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClassroomCard } from "@/components/classroom/ClassroomCard";
import { JoinClassroomModal } from "@/components/classroom/JoinClassroomModal";

interface Classroom {
  id: string;
  name: string;
  student_count?: number;
  instructor_name?: string;
}

export default function StudentHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-[#202124]">My Classes</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e8f0fe] flex items-center justify-center">
              <Plus className="w-8 h-8 text-[#1a73e8]" />
            </div>
            <h2 className="text-lg font-medium text-[#202124] mb-1">Join your first classroom</h2>
            <p className="text-sm text-[#5f6368] mb-4">Ask your teacher for the classroom code</p>
            <button
              onClick={() => setJoinOpen(true)}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              + Join Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((c) => (
              <ClassroomCard
                key={c.id}
                classroom={c}
                onClick={() => navigate(`/student/classroom/${c.id}`)}
              />
            ))}
          </div>
        )}

        {classrooms.length > 0 && (
          <button
            onClick={() => setJoinOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        <JoinClassroomModal
          open={joinOpen}
          onOpenChange={setJoinOpen}
          onSuccess={fetchClassrooms}
        />
      </div>
    </AppLayout>
  );
}
