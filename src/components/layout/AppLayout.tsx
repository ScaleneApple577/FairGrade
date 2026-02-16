import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut, Home, Settings, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getClassroomColor, getInitial } from "@/lib/classroomColors";

interface AppLayoutProps {
  children: ReactNode;
}

interface SidebarClassroom {
  id: string;
  name: string;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [classrooms, setClassrooms] = useState<SidebarClassroom[]>([]);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const homeRoute = role === 'teacher' ? '/teacher/home' : '/student/home';
  const classroomBase = role === 'teacher' ? '/teacher/classroom' : '/student/classroom';

  useEffect(() => {
    api.get<SidebarClassroom[]>('/api/classrooms')
      .then((data) => setClassrooms(Array.isArray(data) ? data : []))
      .catch(() => setClassrooms([]));
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside
        className={`fixed h-full bg-white border-r border-[#e0e0e0] z-30 transition-all duration-200 flex flex-col ${
          sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#e0e0e0]">
          <Link to={homeRoute} className="flex items-center gap-2">
            <span className="text-xl font-medium">
              <span className="text-[#202124]">Fair</span>
              <span className="text-[#1a73e8]">Grade</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <Link
            to={homeRoute}
            className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors rounded-r-full mr-3 ${
              location.pathname === homeRoute
                ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                : 'text-[#202124] hover:bg-[#f1f3f4]'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>

          {classrooms.length > 0 && (
            <>
              <div className="my-2 mx-6 h-px bg-[#e0e0e0]" />
              <p className="px-6 py-1.5 text-xs font-medium text-[#5f6368] uppercase tracking-wider">
                {role === 'teacher' ? 'My Classes' : 'Enrolled'}
              </p>
              {classrooms.map((c) => {
                const active = location.pathname === `${classroomBase}/${c.id}`;
                return (
                  <Link
                    key={c.id}
                    to={`${classroomBase}/${c.id}`}
                    className={`flex items-center gap-3 px-6 py-2 text-sm transition-colors rounded-r-full mr-3 ${
                      active
                        ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                        : 'text-[#202124] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                      style={{ backgroundColor: getClassroomColor(c.id) }}
                    >
                      {getInitial(c.name)}
                    </div>
                    <span className="truncate">{c.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#e0e0e0] p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#e0e0e0] flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors">
                <Menu className="w-5 h-5 text-[#5f6368]" />
              </button>
            )}
            {!sidebarOpen && (
              <Link to={homeRoute} className="text-lg font-medium ml-1">
                <span className="text-[#202124]">Fair</span>
                <span className="text-[#1a73e8]">Grade</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-sm font-medium cursor-pointer">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
