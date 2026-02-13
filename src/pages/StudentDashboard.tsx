import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  FolderOpen,
  Calendar,
  Star,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

const chalkboardLinks = [
  { icon: FolderOpen, label: "My Projects", href: "/student/projects" },
  { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  { icon: Star, label: "Peer Reviews", href: "/student/reviews" },
  { icon: User, label: "My Profile", href: "/student-profile" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const firstName = (() => {
    try {
      if (user) {
        return user.firstName || (user.fullName || '').split(' ')[0] || '';
      }
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        return u.first_name || (u.fullName || u.name || '').split(' ')[0] || '';
      }
    } catch {}
    return '';
  })();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#2d4a3e] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(170deg, #2d4a3e 0%, #243f34 40%, #1e3529 100%)",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.3)",
      }}
    >
      {/* Chalk dust texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }} />

      {/* Top left — Logo */}
      <div className="absolute top-6 left-8 z-20">
        <span className="font-['Caveat'] text-2xl font-bold select-none">
          <span className="text-white">Fair</span>
          <span className="text-white/70">Grade</span>
        </span>
      </div>

      {/* Top right — Bell only */}
      <div className="absolute top-6 right-8 z-20">
        <NotificationDropdown />
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="font-['Caveat'] text-5xl md:text-6xl font-bold text-white text-center mb-2"
        >
          Welcome back{firstName ? `, ${firstName}` : ''}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="font-['Caveat'] text-xl text-white/50 text-center mb-20"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.p>

        <div className="grid grid-cols-2 gap-x-24 gap-y-10 max-w-xl mx-auto">
          {chalkboardLinks.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
            >
              <Link
                to={item.href}
                className="font-['Caveat'] flex items-center gap-4 text-2xl md:text-3xl font-bold text-white/80 hover:text-white py-2 cursor-pointer transition-all duration-200 border-b-2 border-transparent hover:border-white/50"
              >
                <item.icon className="w-7 h-7 text-white/50 flex-shrink-0" />
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chalk ledge / tray */}
      <div
        className="flex-shrink-0 relative z-20 flex items-center px-8"
        style={{
          height: "48px",
          background: "linear-gradient(180deg, #8B7355 0%, #6B5740 30%, #8B7355 50%, #7A6548 70%, #8B7355 100%)",
          boxShadow: "0 -4px 8px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={handleLogout}
          className="font-['Caveat'] text-sm text-white/70 hover:text-white flex items-center gap-2 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
