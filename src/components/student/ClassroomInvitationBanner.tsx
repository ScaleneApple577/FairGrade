import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ClassroomInvitation {
  id: string;
  teacherName: string;
  teacherEmail: string;
  message?: string;
  createdAt: string;
}

interface ClassroomInvitationBannerProps {
  onAccept?: () => void;
}

export function ClassroomInvitationBanner({ onAccept }: ClassroomInvitationBannerProps) {
  const [invitations, setInvitations] = useState<ClassroomInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        // TODO: GET /api/student/classrooms/invitations
        const data = await api.get("/api/student/classrooms/invitations");
        setInvitations(data || []);
      } catch (error) {
        console.error("Failed to fetch classroom invitations:", error);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAccept = async (inviteId: string, teacherName: string) => {
    setProcessingId(inviteId);
    try {
      // TODO: POST /api/student/classrooms/{invite_id}/accept
      await api.post(`/api/student/classrooms/${inviteId}/accept`);
      toast.success(`You've joined ${teacherName}'s classroom!`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId));
      onAccept?.();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      // TODO: POST /api/student/classrooms/{invite_id}/decline
      await api.post(`/api/student/classrooms/${inviteId}/decline`);
      toast.success("Invitation declined");
      setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      toast.error("Failed to decline invitation");
    } finally {
      setProcessingId(null);
    }
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
                  {invitation.teacherName} has invited you to join their classroom
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {invitation.teacherEmail}
                </p>
                {invitation.message && (
                  <p className="text-slate-300 text-sm italic mt-2">
                    "{invitation.message}"
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => handleAccept(invitation.id, invitation.teacherName)}
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
                onClick={() => handleDecline(invitation.id)}
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
