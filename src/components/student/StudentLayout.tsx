import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Star,
  LogOut,
  User,
  Trophy,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: FolderOpen, label: "Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Reviews", href: "/student/reviews" },
];

interface StudentLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  initials: string;
}

export function StudentLayout({ children, pageTitle }: StudentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      const fullName = user.fullName || 
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email;
      const initials = fullName 
        ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email.charAt(0).toUpperCase();
      setProfile({ id: user.id, email: user.email, fullName, initials });
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-[#0a0e27] flex">
      {/* Rain background */}
      <div className="rain-bg" />

      {/* Sidebar */}
      <aside className="w-56 h-screen bg-[#111633] fixed left-0 top-0 flex flex-col relative z-10">
        {/* Logo */}
        <div className="px-5 py-5">
          <Link to="/student/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-8 flex-shrink-0">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-semibold">
              <span className="text-white">Fair</span>
              <span className="text-blue-400">Grade</span>
            </span>
          </Link>
        </div>

        {/* Gradient divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? "text-white bg-blue-500/10"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-400 rounded-r-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                  )}
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-blue-400" : "text-white/40"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-56 min-h-screen flex-1 relative z-10">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 h-14 bg-[#0a0e27]/80 backdrop-blur-xl">
          <div className="flex items-center justify-end px-6 h-full">
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-none">
                  {profile ? (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-blue-400/30">
                        {profile.initials}
                      </div>
                      <span className="text-sm text-white/60 hidden md:block">{profile.fullName}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                    </>
                  ) : (
                    <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-[#111633] border border-white/10 shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => navigate("/student-profile")}
                    className="text-white/60 hover:!bg-white/[0.06] hover:!text-white cursor-pointer gap-2 text-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/student-achievements")}
                    className="text-white/60 hover:!bg-white/[0.06] hover:!text-white cursor-pointer gap-2 text-sm"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Achievements
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/student-settings")}
                    className="text-white/60 hover:!bg-white/[0.06] hover:!text-white cursor-pointer gap-2 text-sm"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
