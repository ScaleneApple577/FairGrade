import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  UserCheck,
  Activity,
  PieChart,
  Calendar,
  CheckSquare,
  Star,
  Eye,
  Bot,
  Shield,
  FileText,
  TrendingUp,
  Calculator,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  featureId: string;
  featured?: boolean;
  accentColor: "blue" | "orange";
}

const FeatureCard = ({
  title,
  subtitle,
  icon: Icon,
  featureId,
  featured = false,
  accentColor,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  const accentClasses = {
    blue: {
      border: "hover:border-blue-500",
      shadow: "hover:shadow-blue-500/20",
      icon: "text-blue-500",
      iconBg: "group-hover:bg-blue-500/20",
      ring: "ring-blue-500/50",
      badge: "bg-blue-500/20 text-blue-400",
    },
    orange: {
      border: "hover:border-orange-500",
      shadow: "hover:shadow-orange-500/20",
      icon: "text-orange-500",
      iconBg: "group-hover:bg-orange-500/20",
      ring: "ring-orange-500/50",
      badge: "bg-orange-500/20 text-orange-400",
    },
  };

  const accent = accentClasses[accentColor];

  return (
    <motion.div
      onClick={() => navigate(`/features/${featureId}`)}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg",
        "bg-zinc-900 border border-zinc-800 transition-all duration-300",
        accent.border,
        accent.shadow,
        "hover:shadow-lg",
        featured && "ring-1 ring-offset-2 ring-offset-black",
        featured && accent.ring
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Corner brackets */}
      <div className={cn("absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />
      <div className={cn("absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />
      <div className={cn("absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />
      <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />

      <div className="p-4 md:p-5 flex items-center gap-4">
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          "bg-zinc-800 group-hover:scale-110",
          accent.iconBg
        )}>
          <Icon className={cn("w-6 h-6 transition-colors", accent.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base md:text-lg truncate group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-zinc-400 text-sm truncate">
            {subtitle}
          </p>
        </div>

        <motion.div
          className={cn("flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", accent.icon)}
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>

      {featured && (
        <div className={cn("absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium", accent.badge)}>
          Featured
        </div>
      )}
    </motion.div>
  );
};

const studentFeatures = [
  {
    title: "Real-Time Contribution Tracking",
    subtitle: "See your progress as you work",
    icon: Activity,
    featureId: "track-your-work",
    featured: true,
  },
  {
    title: "Personal Contribution Dashboard",
    subtitle: "View your stats and improve",
    icon: PieChart,
    featureId: "self-audit",
  },
  {
    title: "Group Availability Calendar",
    subtitle: "Find times everyone is free",
    icon: Calendar,
    featureId: "team-calendar",
  },
  {
    title: "Task & Deadline Manager",
    subtitle: "Stay organized with your team",
    icon: CheckSquare,
    featureId: "task-tracker",
  },
  {
    title: "Rate Your Teammates",
    subtitle: "Anonymous, fair feedback",
    icon: Star,
    featureId: "peer-reviews",
  },
];

const teacherFeatures = [
  {
    title: "Live Google Docs Monitoring",
    subtitle: "See who writes what, in real-time",
    icon: Eye,
    featureId: "live-tracking",
    featured: true,
  },
  {
    title: "AI Content Detection",
    subtitle: "Catch AI-generated text instantly",
    icon: Bot,
    featureId: "ai-detection",
  },
  {
    title: "Plagiarism Detector",
    subtitle: "Verify originality automatically",
    icon: Shield,
    featureId: "plagiarism-check",
  },
  {
    title: "Contribution Reports",
    subtitle: "Fair grades backed by data",
    icon: FileText,
    featureId: "auto-reports",
  },
  {
    title: "Group Health Monitoring",
    subtitle: "Intervene before groups fail",
    icon: TrendingUp,
    featureId: "analytics-dashboard",
  },
  {
    title: "Individual Grade Calculator",
    subtitle: "Adjust grades based on effort",
    icon: Calculator,
    featureId: "grade-adjuster",
  },
];

export const Features = () => {
  return (
    <section id="features" className="bg-black py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Features Built For Everyone
          </h2>
          <p className="text-xl text-zinc-400">
            Choose your role to explore
          </p>
        </motion.div>

        {/* Two Column Layout - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Student Features Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Student Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">For Students</h3>
                <p className="text-zinc-400">Tools to prove your contribution</p>
              </div>
            </div>

            <div className="space-y-3">
              {studentFeatures.map((feature) => (
                <FeatureCard
                  key={feature.featureId}
                  {...feature}
                  accentColor="blue"
                />
              ))}
            </div>
          </motion.div>

          {/* Teacher Features Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Teacher Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">For Teachers</h3>
                <p className="text-zinc-400">Grade fairly with data</p>
              </div>
            </div>

            <div className="space-y-3">
              {teacherFeatures.map((feature) => (
                <FeatureCard
                  key={feature.featureId}
                  {...feature}
                  accentColor="orange"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
