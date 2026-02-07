import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-slate-400 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && role !== requiredRole) {
    // Redirect to the correct dashboard based on their actual role
    if (role === "teacher") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If no role, redirect to auth
    return <Navigate to="/auth" replace />;
  }

  // Check allowed roles
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the correct dashboard based on their actual role
    if (role === "teacher") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Wrapper for teacher-only routes
export function TeacherRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="teacher">
      {children}
    </ProtectedRoute>
  );
}

// Wrapper for student-only routes
export function StudentRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="student">
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
