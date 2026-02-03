import React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { CategoryList } from "@/components/ui/category-list";
import { SectionWithMockup } from "@/components/ui/section-with-mockup";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const studentFeatures = [
  {
    title: "Real-Time Contribution Tracking",
    subtitle: "See your progress as you work",
    icon: Activity,
    onClick: () => scrollToSection("track-your-work"),
    featured: true,
  },
  {
    title: "Personal Contribution Dashboard",
    subtitle: "View your stats and improve",
    icon: PieChart,
    onClick: () => scrollToSection("self-audit"),
  },
  {
    title: "Group Availability Calendar",
    subtitle: "Find times everyone is free",
    icon: Calendar,
    onClick: () => scrollToSection("team-calendar"),
  },
  {
    title: "Task & Deadline Manager",
    subtitle: "Stay organized with your team",
    icon: CheckSquare,
    onClick: () => scrollToSection("task-tracker"),
  },
  {
    title: "Rate Your Teammates",
    subtitle: "Anonymous, fair feedback",
    icon: Star,
    onClick: () => scrollToSection("peer-reviews"),
  },
];

const teacherFeatures = [
  {
    title: "Live Google Docs Monitoring",
    subtitle: "See who writes what, in real-time",
    icon: Eye,
    onClick: () => scrollToSection("live-tracking"),
    featured: true,
  },
  {
    title: "AI Content Detection",
    subtitle: "Catch AI-generated text instantly",
    icon: Bot,
    onClick: () => scrollToSection("ai-detection"),
  },
  {
    title: "Plagiarism Detector",
    subtitle: "Verify originality automatically",
    icon: Shield,
    onClick: () => scrollToSection("plagiarism-check"),
  },
  {
    title: "Contribution Reports",
    subtitle: "Fair grades backed by data",
    icon: FileText,
    onClick: () => scrollToSection("auto-reports"),
  },
  {
    title: "Group Health Monitoring",
    subtitle: "Intervene before groups fail",
    icon: TrendingUp,
    onClick: () => scrollToSection("analytics-dashboard"),
  },
  {
    title: "Individual Grade Calculator",
    subtitle: "Adjust grades based on effort",
    icon: Calculator,
    onClick: () => scrollToSection("grade-adjuster"),
  },
];

const studentDetails = [
  {
    id: "track-your-work",
    title: "Your Contribution, Tracked Automatically",
    description:
      "See exactly how much you've contributed in real-time. Word counts, time spent, tasks completed. No more wondering if you're pulling your weight.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/3b82f6?text=Student+Dashboard",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/3b82f6?text=Progress+Chart",
    reverseLayout: false,
  },
  {
    id: "self-audit",
    title: "See How You Compare",
    description:
      "Personal dashboard shows your contribution percentage, peer review scores, meeting attendance. Set goals and improve your teamwork skills.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/3b82f6?text=Self+Audit+View",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/3b82f6?text=Stats+Breakdown",
    reverseLayout: true,
  },
  {
    id: "team-calendar",
    title: "Find Meeting Times in Seconds",
    description:
      "Mark when you're free. See a heatmap of when everyone is available. No more endless group chat messages trying to coordinate schedules.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/3b82f6?text=Calendar+Heatmap",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/3b82f6?text=Availability+Grid",
    reverseLayout: false,
  },
  {
    id: "task-tracker",
    title: "Never Miss a Deadline",
    description:
      "See all group tasks in one place. Know what you need to do and when. Get reminders so nothing falls through the cracks.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/3b82f6?text=Task+Board",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/3b82f6?text=My+Tasks",
    reverseLayout: true,
  },
  {
    id: "peer-reviews",
    title: "Rate Your Teammates Fairly",
    description:
      "Anonymous peer reviews let you honestly evaluate who contributed. Rate on effort, communication, quality. Your feedback helps ensure fair grades.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/3b82f6?text=Review+Form",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/3b82f6?text=Submit+Review",
    reverseLayout: false,
  },
];

const teacherDetails = [
  {
    id: "live-tracking",
    title: "Watch Contributions Happen in Real-Time",
    description:
      "Our Chrome extension tracks every keystroke in Google Docs. See word counts update live, detect large pastes, track exactly when each student works.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/f97316?text=Live+Tracking",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/f97316?text=Timeline+View",
    reverseLayout: true,
  },
  {
    id: "ai-detection",
    title: "Catch AI-Generated Content Instantly",
    description:
      "Advanced AI detection scans all pasted text over 100 characters. When a student pastes ChatGPT output, you'll know immediately.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/f97316?text=AI+Alert",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/f97316?text=Flagged+Content",
    reverseLayout: false,
  },
  {
    id: "plagiarism-check",
    title: "Verify Originality Automatically",
    description:
      "Integrated plagiarism checking compares student work against billions of web pages. Get originality scores for each team member instantly.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/f97316?text=Plagiarism+Report",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/f97316?text=Originality+Score",
    reverseLayout: true,
  },
  {
    id: "auto-reports",
    title: "Fair Grades Backed by Data",
    description:
      "Auto-generated PDF reports show each student's exact contribution. Words written, tasks completed, meeting attendance, peer review scores.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/f97316?text=Report+PDF",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/f97316?text=Data+Breakdown",
    reverseLayout: false,
  },
  {
    id: "analytics-dashboard",
    title: "Monitor Group Health in Real-Time",
    description:
      "Instructor dashboard shows red flags (no activity), yellow warnings (deadlines approaching), green indicators (on track). Intervene before groups fail.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/f97316?text=Analytics+View",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/f97316?text=Health+Alerts",
    reverseLayout: true,
  },
  {
    id: "grade-adjuster",
    title: "Adjust Grades Based on Real Effort",
    description:
      "AI-powered grade recommendation engine suggests individual adjustments based on tracked data and peer reviews. Fair grading made simple.",
    primaryImageSrc:
      "https://placehold.co/600x400/1a1a1a/f97316?text=Grade+Calculator",
    secondaryImageSrc:
      "https://placehold.co/400x300/0f0f0f/f97316?text=Recommendations",
    reverseLayout: false,
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

        {/* Two Column Layout */}
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

            <CategoryList cards={studentFeatures} accentColor="blue" />
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

            <CategoryList cards={teacherFeatures} accentColor="orange" />
          </motion.div>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="mt-24 md:mt-32 border-t border-zinc-800 pt-16">
        {/* Student Detail Sections */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span className="text-blue-400 font-medium">Student Features</span>
          </div>
        </motion.div>

        {studentDetails.map((detail) => (
          <SectionWithMockup
            key={detail.id}
            {...detail}
            accentColor="blue"
          />
        ))}

        {/* Teacher Detail Sections */}
        <motion.div
          className="text-center mb-12 mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <UserCheck className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-medium">Teacher Features</span>
          </div>
        </motion.div>

        {teacherDetails.map((detail) => (
          <SectionWithMockup
            key={detail.id}
            {...detail}
            accentColor="orange"
          />
        ))}
      </div>
    </section>
  );
};

export default Features;
