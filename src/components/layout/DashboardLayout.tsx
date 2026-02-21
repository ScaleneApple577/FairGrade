import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false); // placeholder toggle

  const homeRoute = user?.role === 'teacher' ? '/teacher/home' : '/student/home';
  const firstName = user?.firstName || user?.email?.charAt(0).toUpperCase() || 'U';
  const initial = (user?.firstName || user?.email || 'U').charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <Link to={homeRoute} className="flex items-center gap-2">
          <span className="text-xl font-medium">
            <span className="text-foreground">Fair</span>
            <span className="text-primary">Grade</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              {initial}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">{firstName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
