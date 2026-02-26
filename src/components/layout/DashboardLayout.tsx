import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Moon, Sun, Menu, Home, BookOpen, Calendar, Monitor } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  fullScreen?: boolean;
}

export function DashboardLayout({ children, fullScreen }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const isTeacher = user?.role === 'teacher';
  const homeRoute = isTeacher ? '/teacher/home' : '/student/home';
  const firstName = user?.firstName || user?.email?.charAt(0).toUpperCase() || 'U';
  const initial = (user?.firstName || user?.email || 'U').charAt(0).toUpperCase();

  const teacherNavItems = [
    { label: 'Classroom', icon: Home, tab: 'classroom' },
    { label: 'Assignments', icon: BookOpen, tab: 'assignments' },
    { label: 'Monitoring', icon: Monitor, route: '/teacher/monitoring' },
    { label: 'Calendar', icon: Calendar, route: '/teacher/calendar' },
  ];

  const studentNavItems = [
    { label: 'Classroom', icon: Home, tab: 'classroom' },
    { label: 'Assignments', icon: BookOpen, tab: 'assignments' },
    { label: 'Calendar', icon: Calendar, route: '/student/calendar' },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const isNavItemActive = (item: { tab?: string; route?: string }) => {
    if (item.route) return location.pathname === item.route;
    if (item.tab) return location.pathname === homeRoute && (location.state as { activeTab?: string } | null)?.activeTab === item.tab;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleNavClick = (item: { tab?: string; route?: string }) => {
    if (item.route) {
      navigate(item.route);
    } else if (item.tab) {
      navigate(homeRoute, { state: { activeTab: item.tab } });
    }
    setSidebarOpen(false);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
=======
    <div className={fullScreen ? "h-screen flex flex-col overflow-hidden bg-background" : "min-h-screen bg-background"}>
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-56 bg-white dark:bg-gray-900 border-r border-border dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center px-4 h-14 border-b border-border dark:border-gray-700">
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-foreground dark:text-white">Fair</span>
            <span className="text-primary">Grade</span>
          </span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = isNavItemActive(item);
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-lg font-medium text-left transition-colors border-l-2 ${
                  active
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'border-transparent text-foreground dark:text-gray-100 hover:bg-secondary dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className={`w-6 h-6 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground dark:text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 py-4 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-secondary dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-7 h-7 text-muted-foreground dark:text-gray-300" />
          </button>
          <Link to={homeRoute} className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-foreground dark:text-white">Fair</span>
              <span className="text-primary">Grade</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-md hover:bg-secondary dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme">
            {darkMode ? <Sun className="w-6 h-6 text-gray-300" /> : <Moon className="w-6 h-6 text-muted-foreground" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-secondary dark:hover:bg-gray-800 transition-colors outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-base font-medium shrink-0">
                  {initial}
                </div>
                <span className="text-lg font-medium text-foreground dark:text-white hidden sm:inline">{firstName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

<<<<<<< HEAD
      <main className="px-4 sm:px-6 py-4">
=======
      <main className={fullScreen ? "flex-1 min-h-0 overflow-hidden px-4 sm:px-6 py-3" : "max-w-6xl mx-auto px-4 sm:px-6 py-6"}>
>>>>>>> bb891d8e782f7073a5ed20b32c5c9195ffba4b3f
        {children}
      </main>
    </div>
  );
}