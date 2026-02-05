import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Star,
  BarChart3,
  LogOut,
  Bell,
  Search,
  Key,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MenuVertical } from "@/components/ui/menu-vertical";

// Sidebar navigation items
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: FolderOpen, label: "My Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Peer Reviews", href: "/student/reviews" },
  { icon: BarChart3, label: "My Stats", href: "/student/stats" },
];

interface StudentLayoutProps {
  children: ReactNode;
  pageTitle: string;
  showExtensionButton?: boolean;
  onGenerateToken?: () => void;
  isGeneratingToken?: boolean;
}

export function StudentLayout({
  children,
  pageTitle,
  showExtensionButton = false,
  onGenerateToken,
  isGeneratingToken = false,
}: StudentLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 h-screen bg-[#0f172a] border-r border-white/10 fixed left-0 top-0 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11 flex-shrink-0">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path 
                  d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M10 10 L10 42 Q10 44 8 43.5" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Fair</span>
              <span className="text-blue-400">Grade</span>
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <MenuVertical menuItems={sidebarItems} variant="dark" />
        </div>

        {/* Extension Token Button */}
        {showExtensionButton && onGenerateToken && (
          <div className="px-4 pb-2">
            <Button
              onClick={onGenerateToken}
              disabled={isGeneratingToken}
              variant="outline"
              className="w-full bg-white/10 border border-white/10 text-blue-400 hover:bg-white/15"
            >
              {isGeneratingToken ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Get Extension Token
            </Button>
          </div>
        )}

        {/* Log Out */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 min-h-screen bg-[#111827] flex-1">
        {/* Top Bar */}
        <header className="bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search..."
                  className="w-64 pl-10 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg"
                />
              </div>

              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-slate-400 hover:text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  SJ
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">
                    Sarah Johnson
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
