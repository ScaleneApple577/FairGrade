import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"checking" | "not-logged-in" | "accepting" | "success" | "error">("checking");
  const [classroomName, setClassroomName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No invitation token found in the URL.");
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      // Store the full URL so we can redirect back after login
      sessionStorage.setItem("pending_invite_redirect", window.location.pathname + window.location.search);
      setStatus("not-logged-in");
      return;
    }

    // User is logged in — accept the invitation
    setStatus("accepting");
    api.post("/api/classrooms/invitations/accept", { token })
      .then((result) => {
        setClassroomName(result?.classroom_name || result?.classroom?.name || "the classroom");
        setStatus("success");
        sessionStorage.removeItem("pending_invite_redirect");
      })
      .catch((err) => {
        setErrorMessage(err?.message || "Failed to accept invitation.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {status === "checking" && (
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
        )}

        {status === "not-logged-in" && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-4">
            <LogIn className="h-12 w-12 text-blue-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">Sign In Required</h1>
            <p className="text-slate-400 text-sm">
              You need to sign in first to accept this invitation.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              Sign In
            </Button>
          </div>
        )}

        {status === "accepting" && (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
            <p className="text-slate-400">Accepting invitation...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">You've joined {classroomName}!</h1>
            <p className="text-slate-400 text-sm">
              You can now access all classroom features.
            </p>
            <Button
              onClick={() => navigate("/student/dashboard")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">Invitation Error</h1>
            <p className="text-slate-400 text-sm">{errorMessage}</p>
            <Button
              onClick={() => navigate("/student/dashboard")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteAccept;
