import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCalendar from "./pages/StudentCalendar";
import StudentReviews from "./pages/StudentReviews";
import StudentProjects from "./pages/StudentProjects";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
           <Route path="/teacher/projects" element={<TeacherProjects />} />
           <Route path="/teacher/projects/:id" element={<TeacherProjectDetail />} />
           <Route path="/teacher/students" element={<TeacherStudents />} />
           <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
           <Route path="/teacher/live-monitor" element={<TeacherLiveMonitor />} />
           <Route path="/teacher/reports" element={<TeacherReports />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/timeline" element={<Timeline />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/projects" element={<StudentProjects />} />
          <Route path="/student/calendar" element={<StudentCalendar />} />
          <Route path="/student/reviews" element={<StudentReviews />} />
          <Route path="/student/stats" element={<StudentStats />} />
          <Route path="/live-monitor" element={<LiveMonitor />} />
          <Route path="/flags" element={<Flags />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/features/:featureId" element={<FeatureDetailPage />} />
          <Route path="/teacher/live-replay/:fileId" element={<LiveReplay />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
