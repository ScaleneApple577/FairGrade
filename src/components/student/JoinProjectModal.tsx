import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinProjectModal({ isOpen, onClose, onSuccess }: JoinProjectModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Join project using API
      // await api.post('/api/student/projects/join', { invite_code: inviteCode.trim() });
      
      // Simulate for now - remove when connecting real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError("Invalid or expired invite code");
      setIsLoading(false);
      return;

      // On success:
      // toast({
      //   title: "Successfully joined project!",
      //   description: "You can now view the project in your dashboard.",
      // });
      // onSuccess();
      // onClose();
    } catch (err: any) {
      setError(err.message || "Invalid or expired invite code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-semibold">Join a Project</h2>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">
                    Enter invite code
                  </label>
                  <Input
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="XXXXXX"
                    className="font-mono tracking-widest text-center text-lg bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                    maxLength={10}
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>

                <Button
                  onClick={handleJoin}
                  disabled={isLoading || !inviteCode.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join"
                  )}
                </Button>

                <p className="text-slate-500 text-xs text-center">
                  Ask your instructor for the project invite code
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
