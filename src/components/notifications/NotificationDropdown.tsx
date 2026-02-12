import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, FolderOpen, Check, X, Loader2, GraduationCap, Clock, Users } from "lucide-react";
import { useClassroom } from "@/contexts/ClassroomContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invitations, invitationCount, acceptInvitation, dismissInvitation } = useClassroom();
  const [isOpen, setIsOpen] = useState(false);
  const [acceptingToken, setAcceptingToken] = useState<string | null>(null);

  const handleAccept = async (invitation: any) => {
    const token = invitation.token;
    setAcceptingToken(token);
    try {
      await acceptInvitation(token);
      toast({
        title: "Invitation accepted!",
        description: `You've joined the classroom successfully.`,
      });
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast({
        title: "Failed to accept",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAcceptingToken(null);
    }
  };

  const handleDismiss = (id: string) => {
    dismissInvitation(id);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-400 hover:text-white" />
        {invitationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1">
            {invitationCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-sm">Notifications</h3>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {invitations.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">No new notifications</p>
                  </div>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-4 border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm">
                            You've been invited to join{" "}
                            <span className="text-white font-medium">
                              {invitation.classroom_name || invitation.classroom_id || "a classroom"}
                            </span>
                          </p>
                          {invitation.teacher_name && (
                            <p className="text-slate-500 text-xs mt-0.5">
                              From: {invitation.teacher_name}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAccept(invitation)}
                              disabled={acceptingToken === invitation.token}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                            >
                              {acceptingToken === invitation.token ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleDismiss(invitation.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium rounded-lg transition"
                            >
                              <X className="w-3 h-3" />
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
