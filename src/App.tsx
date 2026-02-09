import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TeacherRoute, StudentRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCalendar from "./pages/StudentCalendar";
import StudentReviews from "./pages/StudentReviews";
import StudentProjects from "./pages/StudentProjects";
import StudentProjectDetail from "./pages/StudentProjectDetail";
import StudentStats from "./pages/StudentStats";
import LiveMonitor from "./pages/LiveMonitor";
import Flags from "./pages/Flags";
import Timeline from "./pages/Timeline";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import FeatureDetailPage from "./pages/FeatureDetailPage";
import LiveReplay from "./pages/LiveReplay";
import NotFound from "./pages/NotFound";
import TeacherProjects from "./pages/TeacherProjects";
import TeacherProjectDetail from "./pages/TeacherProjectDetail";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import TeacherLiveMonitor from "./pages/TeacherLiveMonitor";
import TeacherReports from "./pages/TeacherReports";
import TeacherLiveReplay from "./pages/TeacherLiveReplay";

const queryClient = new QueryClient();

// Auth redirect component - redirects authenticated users away from auth page
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard
    if (role === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route 
      path="/auth" 
      element={
        <AuthRedirect>
          <Auth />
        </AuthRedirect>
      } 
    />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/features/:featureId" element={<FeatureDetailPage />} />

    {/* Teacher routes */}
    <Route 
      path="/teacher/dashboard" 
      element={
        <TeacherRoute>
          <TeacherDashboard />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/projects" 
      element={
        <TeacherRoute>
          <TeacherProjects />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/projects/:id" 
      element={
        <TeacherRoute>
          <TeacherProjectDetail />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/students" 
      element={
        <TeacherRoute>
          <TeacherStudents />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/analytics" 
      element={
        <TeacherRoute>
          <TeacherAnalytics />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/live-monitor" 
      element={
        <TeacherRoute>
          <TeacherLiveMonitor />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/reports" 
      element={
        <TeacherRoute>
          <TeacherReports />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/live-replay/:projectId/:fileId" 
      element={
        <TeacherRoute>
          <TeacherLiveReplay />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/create" 
      element={
        <TeacherRoute>
          <CreateProject />
        </TeacherRoute>
      } 
    />
    <Route 
      path="/teacher/settings" 
      element={
        <TeacherRoute>
          <Settings />
        </TeacherRoute>
      } 
    />

    {/* Student routes */}
    <Route 
      path="/student/dashboard" 
      element={
        <StudentRoute>
          <StudentDashboard />
        </StudentRoute>
      } 
    />
    <Route 
      path="/student/projects" 
      element={
        <StudentRoute>
          <StudentProjects />
        </StudentRoute>
      } 
    />
    <Route 
      path="/student/projects/:id" 
      element={
        <StudentRoute>
          <StudentProjectDetail />
        </StudentRoute>
      } 
    />
    <Route 
      path="/student/calendar" 
      element={
        <StudentRoute>
          <StudentCalendar />
        </StudentRoute>
      } 
    />
    <Route 
      path="/student/reviews" 
      element={
        <StudentRoute>
          <StudentReviews />
        </StudentRoute>
      } 
    />
    <Route 
      path="/student/stats" 
      element={
        <StudentRoute>
          <StudentStats />
        </StudentRoute>
      } 
    />

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
