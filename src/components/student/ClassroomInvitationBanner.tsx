import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ClassroomInvitation {
  id: number;
  classroom_name: string;
  teacher_name: string;
  token: string;
  created_at: string;
}

interface ClassroomInvitationBannerProps {
  onAccept?: () => void;
}

export function ClassroomInvitationBanner({ onAccept }: ClassroomInvitationBannerProps) {
  const [invitations, setInvitations] = useState<ClassroomInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        // GET /api/classrooms/invitations/mine
        const data = await api.get<ClassroomInvitation[]>("/api/classrooms/invitations/mine");
        setInvitations(data || []);
      } catch (error) {
        console.warn("Failed to fetch classroom invitations:", error);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAccept = async (invitation: ClassroomInvitation) => {
    setProcessingId(invitation.id);
    try {
      // POST /api/classrooms/invitations/accept with { token }
      const response = await api.post<{ classroom_id: number; classroom_name: string }>(
        "/api/classrooms/invitations/accept",
        { token: invitation.token }
      );
      toast.success(`✅ Joined ${response.classroom_name || invitation.classroom_name}!`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
      onAccept?.();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitation: ClassroomInvitation) => {
    // TODO: api.post('/api/classrooms/invitations/decline', { token: invitation.token })
    // For now, just hide locally
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
    toast.success("Invitation dismissed.");
  };

  if (isLoading || invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {invitations.map((invitation) => (
        <motion.div
          key={invitation.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {invitation.teacher_name} has invited you to join {invitation.classroom_name}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Invitation received
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => handleAccept(invitation)}
                disabled={processingId === invitation.id}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {processingId === invitation.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Accept"
                )}
              </Button>
              <button
                onClick={() => handleDecline(invitation)}
                disabled={processingId === invitation.id}
                className="text-slate-400 hover:text-white text-sm px-2"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
