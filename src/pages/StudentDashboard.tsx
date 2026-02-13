import { useState, useEffect } from "react";
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

  const fullName = user?.fullName || '';
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email || '?').charAt(0).toUpperCase();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#2d4a3e] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
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

      {/* Top right — Bell + User */}
      <div className="absolute top-5 right-8 z-20 flex items-center gap-4">
        <NotificationDropdown />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-blue-400/30">
            {initials}
          </div>
          <span className="text-sm text-white/70 font-medium hidden md:block">{fullName}</span>
        </div>
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

      {/* Bottom left — Log out */}
      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-8 z-20 font-['Caveat'] text-lg text-white/50 hover:text-white/80 flex items-center gap-2 transition-colors duration-200"
      >
        <LogOut className="w-5 h-5" />
        Log out
      </button>

      {/* Bottom right — Chalk doodles */}
      <div className="absolute bottom-6 right-8 z-10 font-['Caveat'] text-white/15 text-lg select-none space-x-3">
        <span>★</span><span>→</span><span>π</span><span>✦</span><span>∞</span><span>☆</span>
      </div>

      {/* More scattered doodles */}
      <div className="absolute top-1/4 right-16 font-['Caveat'] text-sm text-white/10 select-none rotate-12">E = mc²</div>
      <div className="absolute bottom-1/3 left-16 font-['Caveat'] text-sm text-white/10 select-none -rotate-6">∫ dx</div>
    </div>
  );
}
