import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, Menu, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarDashboardLayoutProps {
  children: ReactNode;
  navItems: SidebarNavItem[];
  activeItem: string;
  onItemChange: (key: string) => void;
}

export function SidebarDashboardLayout({
  children,
  navItems,
  activeItem,
  onItemChange,
}: SidebarDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const homeRoute = user?.role === "teacher" ? "/teacher/home" : "/student/home";
  const firstName = user?.firstName || user?.email?.charAt(0).toUpperCase() || "U";
  const initial = (user?.firstName || user?.email || "U").charAt(0).toUpperCase();

  // Default collapsed on mobile
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const sidebarWidth = collapsed ? "w-16" : "w-60";

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <Link to={homeRoute} className="flex items-center gap-1">
            <span className="text-lg font-semibold">
              <span className="text-foreground">Fair</span>
              <span className="text-primary">Grade</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {initial}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {firstName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200 overflow-hidden",
            sidebarWidth
          )}
        >
          <nav className="flex-1 py-3 flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onItemChange(item.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors w-full",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
