import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Star,
  BarChart3,
  LogOut,
  Key,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";
import { MenuVertical } from "@/components/ui/menu-vertical";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

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

// TODO: GET http://localhost:8000/api/auth/profile
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  initials: string;
}

export function StudentLayout({
  children,
  pageTitle,
  showExtensionButton = false,
  onGenerateToken,
  isGeneratingToken = false,
}: StudentLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Build profile from auth user
  useEffect(() => {
    if (user) {
      // Build full name from firstName + lastName or fullName
      const fullName = user.fullName || 
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email;
      
      const initials = fullName 
        ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email.charAt(0).toUpperCase();
      
      setProfile({
        id: user.id,
        email: user.email,
        fullName,
        initials,
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 h-screen bg-[#0f172a] border-r border-white/10 fixed left-0 top-0 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <Link to="/student/dashboard" className="flex items-center gap-3">
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
            <div />

            <div className="flex items-center gap-4">
              <NotificationDropdown />

              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {profile ? (
                  <>
                    <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {profile.initials}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-white">
                        {profile.fullName}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 bg-white/10 rounded-full animate-pulse" />
                    <div className="hidden md:block">
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                    </div>
                  </>
                )}
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
