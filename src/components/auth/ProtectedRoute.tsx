import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

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

  // No loading screen — use cached data immediately

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && role !== requiredRole) {
    // Redirect to the correct dashboard based on their actual role
    if (role === "teacher") {
      return <Navigate to="/teacher/home" replace />;
    } else if (role === "student") {
      return <Navigate to="/student/home" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "teacher") {
      return <Navigate to="/teacher/home" replace />;
    } else if (role === "student") {
      return <Navigate to="/student/home" replace />;
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
