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
import { MenuVertical } from "@/components/ui/menu-vertical";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { LiveEditsNotification } from "@/components/live/LiveEditsNotification";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
  { icon: FolderOpen, label: "All Projects", href: "/teacher/projects" },
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
  const { liveEdits, totalActive } = useLiveStatus();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-11">
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
          <div className="mt-2">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-400/30 text-xs rounded-full font-medium">
              Teacher
            </span>
          </div>
        </div>

        {/* Live Edits Counter */}
        <LiveEditsNotification
          liveEdits={liveEdits}
          totalActive={totalActive}
          variant="sidebar"
        />

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <MenuVertical
            menuItems={sidebarItems}
            color="hsl(217, 91%, 60%)"
            skew={-2}
            variant="dark"
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
