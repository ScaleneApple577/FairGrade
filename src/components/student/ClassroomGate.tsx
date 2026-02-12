import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroom } from "@/contexts/ClassroomContext";

interface ClassroomGateProps {
  children: ReactNode;
}

export function ClassroomGate({ children }: ClassroomGateProps) {
  const { hasClassroom, isLoading } = useClassroom();
  const navigate = useNavigate();

  if (isLoading) {
    return <>{children}</>;
  }

  if (!hasClassroom) {
    return (
      <div className="relative">
        {/* Blurred background content */}
        <div className="opacity-20 pointer-events-none select-none blur-sm">
          {children}
        </div>

        {/* Modal overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
            <div className="w-14 h-14 bg-blue-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Join a Classroom First</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You need to be part of a classroom before you can access this feature. 
              Ask your instructor for an invite or check your notifications for pending invitations.
            </p>
            <Button
              onClick={() => navigate("/student/dashboard")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
