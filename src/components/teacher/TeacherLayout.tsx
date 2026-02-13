import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart3,
  Activity,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveStatus } from "@/hooks/useLiveStatus";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
  { icon: FolderOpen, label: "Projects", href: "/teacher/projects" },
  { icon: Users, label: "Students", href: "/teacher/students" },
  { icon: BarChart3, label: "Analytics", href: "/teacher/analytics" },
  { icon: Activity, label: "Live Activity", href: "/teacher/live-monitor" },
  { icon: FileText, label: "Reports", href: "/teacher/reports" },
];

interface TeacherLayoutProps {
  children: ReactNode;
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { totalActive } = useLiveStatus();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[hsl(220,14%,6%)] border-r border-white/[0.06] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="px-5 py-5">
          <Link to="/teacher/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-8 flex-shrink-0">
              <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                <path d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10 L10 42 Q10 44 8 43.5" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-semibold">
              <span className="text-white">Fair</span>
              <span className="text-blue-400">Grade</span>
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    active
                      ? "text-white bg-white/[0.06]"
                      : "text-[#8b949e] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-blue-500 rounded-r" />
                  )}
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.label === "Live Activity" && totalActive > 0 && (
                    <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#8b949e] hover:text-white hover:bg-white/[0.04] transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-56">
        {children}
      </div>
    </div>
  );
}
