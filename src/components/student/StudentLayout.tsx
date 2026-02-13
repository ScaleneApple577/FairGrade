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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 h-screen bg-white border-r border-gray-200/80 fixed left-0 top-0 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5">
          <Link to="/student/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-8 flex-shrink-0">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-semibold">
              <span className="text-gray-900">Fair</span>
              <span className="text-blue-600">Grade</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <div className="space-y-0.5">
            {sidebarItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                    active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
                  )}
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-56 min-h-screen flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 h-12 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-end px-6 h-full">
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-none">
                  {profile ? (
                    <>
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-blue-100">
                        {profile.initials}
                      </div>
                      <span className="text-sm text-gray-600 hidden md:block">{profile.fullName}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </>
                  ) : (
                    <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-white border border-gray-200 shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => navigate("/student-profile")}
                    className="text-gray-600 hover:!bg-gray-50 hover:!text-gray-900 cursor-pointer gap-2 text-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/student-achievements")}
                    className="text-gray-600 hover:!bg-gray-50 hover:!text-gray-900 cursor-pointer gap-2 text-sm"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Achievements
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/student-settings")}
                    className="text-gray-600 hover:!bg-gray-50 hover:!text-gray-900 cursor-pointer gap-2 text-sm"
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
