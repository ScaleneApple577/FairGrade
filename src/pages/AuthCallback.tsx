import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, normalizeUser, toFrontendRole } from "@/lib/api";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("No token received. Please try signing in again.");
      setTimeout(() => navigate("/auth"), 3000);
      return;
    }

    // Store token
    localStorage.setItem("access_token", token);

    // Fetch user profile
    api.get("/api/auth/me")
      .then((data) => {
        const normalized = normalizeUser(data);
        localStorage.setItem("user", JSON.stringify(normalized));
        localStorage.setItem("user_role", normalized.role || "");

        const role = normalized.role;
        if (role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else if (role === "student") {
          navigate("/student/dashboard", { replace: true });
        } else {
          // No role yet — go to auth page for role selection
          navigate("/auth", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Please try again.");
        localStorage.removeItem("access_token");
        setTimeout(() => navigate("/auth"), 3000);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center flex-col gap-4">
      {error ? (
        <>
          <p className="text-red-400">{error}</p>
          <p className="text-slate-500 text-sm">Redirecting to sign in...</p>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Completing sign in...</p>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
