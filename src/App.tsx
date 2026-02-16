import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TeacherRoute, StudentRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import FeatureDetailPage from "./pages/FeatureDetailPage";
import NotFound from "./pages/NotFound";
import TeacherHome from "./pages/TeacherHome";
import TeacherClassroomDetail from "./pages/TeacherClassroomDetail";
import StudentHome from "./pages/StudentHome";
import StudentClassroomDetail from "./pages/StudentClassroomDetail";

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <>{children}</>;
  if (isAuthenticated) {
    if (role === "teacher") return <Navigate to="/teacher/home" replace />;
    if (role === "student") return <Navigate to="/student/home" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/features/:featureId" element={<FeatureDetailPage />} />

    {/* Teacher routes */}
    <Route path="/teacher/home" element={<TeacherRoute><TeacherHome /></TeacherRoute>} />
    <Route path="/teacher/classroom/:id" element={<TeacherRoute><TeacherClassroomDetail /></TeacherRoute>} />

    {/* Student routes */}
    <Route path="/student/home" element={<StudentRoute><StudentHome /></StudentRoute>} />
    <Route path="/student/classroom/:id" element={<StudentRoute><StudentClassroomDetail /></StudentRoute>} />

    {/* Legacy redirects */}
    <Route path="/teacher/dashboard" element={<Navigate to="/teacher/home" replace />} />
    <Route path="/student/dashboard" element={<Navigate to="/student/home" replace />} />

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
