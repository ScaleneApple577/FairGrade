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
}

const FeatureCard = ({
  title,
  subtitle,
  icon: Icon,
  featureId,
  featured = false,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/features/${featureId}`)}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg",
        "bg-white border border-slate-200 transition-all duration-300",
        "hover:border-primary hover:shadow-lg",
        featured && "ring-1 ring-primary/50 ring-offset-2 ring-offset-white"
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-4 md:p-5 flex items-center gap-4">
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          "bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110"
        )}>
          <Icon className="w-6 h-6 text-primary transition-colors" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-semibold text-base md:text-lg truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-slate-500 text-sm truncate">
            {subtitle}
          </p>
        </div>

        <motion.div
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>

      {featured && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
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
    title: "Individual Grade Calculator",
    subtitle: "Adjust grades based on effort",
    icon: Calculator,
    featureId: "grade-adjuster",
  },
];

export const Features = () => {
  return (
    <section id="features" className="bg-slate-50 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
            Features Built For Everyone
          </h2>
          <p className="text-xl text-slate-600">
            Choose your role to explore
          </p>
        </motion.div>

        {/* Two Column Layout - Side by Side */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-12">
          {/* Student Features Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Student Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">For Students</h3>
                <p className="text-slate-500">Tools to prove your contribution</p>
              </div>
            </div>

            <div className="space-y-3">
              {studentFeatures.map((feature) => (
                <FeatureCard
                  key={feature.featureId}
                  {...feature}
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
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">For Teachers</h3>
                <p className="text-slate-500">Grade fairly with data</p>
              </div>
            </div>

            <div className="space-y-3">
              {teacherFeatures.map((feature) => (
                <FeatureCard
                  key={feature.featureId}
                  {...feature}
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
