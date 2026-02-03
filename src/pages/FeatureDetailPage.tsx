import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

// Feature data mapped by ID
const featureData: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  primaryImageSrc: string;
  secondaryImageSrc: string;
  accentColor: "blue" | "orange";
  category: "student" | "teacher";
}> = {
  // Student Features
  "track-your-work": {
    title: "Real-Time Contribution Tracking",
    description: "Your Contribution, Tracked Automatically",
    longDescription: "See exactly how much you've contributed in real-time. Word counts, time spent, tasks completed. No more wondering if you're pulling your weight. Our Chrome extension runs silently in the background, tracking every keystroke and edit you make in Google Docs. Watch your contribution percentage grow as you work, and have concrete evidence of your effort when it's time for grading.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/3b82f6?text=Student+Dashboard",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/3b82f6?text=Progress+Chart",
    accentColor: "blue",
    category: "student",
  },
  "self-audit": {
    title: "Personal Contribution Dashboard",
    description: "See How You Compare",
    longDescription: "Personal dashboard shows your contribution percentage, peer review scores, meeting attendance. Set goals and improve your teamwork skills. Compare your stats against group averages and identify areas where you can step up. Track your growth over time and build a portfolio of your collaborative work.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/3b82f6?text=Self+Audit+View",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/3b82f6?text=Stats+Breakdown",
    accentColor: "blue",
    category: "student",
  },
  "team-calendar": {
    title: "Group Availability Calendar",
    description: "Find Meeting Times in Seconds",
    longDescription: "Mark when you're free. See a heatmap of when everyone is available. No more endless group chat messages trying to coordinate schedules. Our smart calendar overlay shows you at a glance when your entire team can meet. Just drag to select your available times, and the system automatically finds the best slots for everyone.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/3b82f6?text=Calendar+Heatmap",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/3b82f6?text=Availability+Grid",
    accentColor: "blue",
    category: "student",
  },
  "task-tracker": {
    title: "Task & Deadline Manager",
    description: "Never Miss a Deadline",
    longDescription: "See all group tasks in one place. Know what you need to do and when. Get reminders so nothing falls through the cracks. Assign tasks to team members, set due dates, and track completion status. Integration with your calendar means you'll never forget an upcoming deadline.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/3b82f6?text=Task+Board",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/3b82f6?text=My+Tasks",
    accentColor: "blue",
    category: "student",
  },
  "peer-reviews": {
    title: "Rate Your Teammates",
    description: "Rate Your Teammates Fairly",
    longDescription: "Anonymous peer reviews let you honestly evaluate who contributed. Rate on effort, communication, quality. Your feedback helps ensure fair grades. The system aggregates reviews from all team members to provide balanced, unbiased assessments that teachers can use for individual grade adjustments.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/3b82f6?text=Review+Form",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/3b82f6?text=Submit+Review",
    accentColor: "blue",
    category: "student",
  },
  // Teacher Features
  "live-tracking": {
    title: "Live Google Docs Monitoring",
    description: "Watch Contributions Happen in Real-Time",
    longDescription: "Our Chrome extension tracks every keystroke in Google Docs. See word counts update live, detect large pastes, track exactly when each student works. The live dashboard shows you a real-time feed of all student activity across all your project groups. Identify who's working and who's not at a glance.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/f97316?text=Live+Tracking",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/f97316?text=Timeline+View",
    accentColor: "orange",
    category: "teacher",
  },
  "ai-detection": {
    title: "AI Content Detection",
    description: "Catch AI-Generated Content Instantly",
    longDescription: "Advanced AI detection scans all pasted text over 100 characters. When a student pastes ChatGPT output, you'll know immediately. Our system flags suspicious content and provides confidence scores, allowing you to make informed decisions about academic integrity.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/f97316?text=AI+Alert",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/f97316?text=Flagged+Content",
    accentColor: "orange",
    category: "teacher",
  },
  "plagiarism-check": {
    title: "Plagiarism Detector",
    description: "Verify Originality Automatically",
    longDescription: "Integrated plagiarism checking compares student work against billions of web pages. Get originality scores for each team member instantly. Detailed reports show exactly what was copied and from where, making it easy to address academic integrity issues.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/f97316?text=Plagiarism+Report",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/f97316?text=Originality+Score",
    accentColor: "orange",
    category: "teacher",
  },
  "auto-reports": {
    title: "Contribution Reports",
    description: "Fair Grades Backed by Data",
    longDescription: "Auto-generated PDF reports show each student's exact contribution. Words written, tasks completed, meeting attendance, peer review scores. Everything you need to justify individual grades is compiled into a professional, shareable document.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/f97316?text=Report+PDF",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/f97316?text=Data+Breakdown",
    accentColor: "orange",
    category: "teacher",
  },
  "analytics-dashboard": {
    title: "Group Health Monitoring",
    description: "Monitor Group Health in Real-Time",
    longDescription: "Instructor dashboard shows red flags (no activity), yellow warnings (deadlines approaching), green indicators (on track). Intervene before groups fail. Get alerts when a group hasn't shown activity in days, or when workload distribution becomes severely imbalanced.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/f97316?text=Analytics+View",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/f97316?text=Health+Alerts",
    accentColor: "orange",
    category: "teacher",
  },
  "grade-adjuster": {
    title: "Individual Grade Calculator",
    description: "Adjust Grades Based on Real Effort",
    longDescription: "AI-powered grade recommendation engine suggests individual adjustments based on tracked data and peer reviews. Fair grading made simple. Input your group grade and let the system suggest how to distribute it based on actual contribution data.",
    primaryImageSrc: "https://placehold.co/800x500/1a1a1a/f97316?text=Grade+Calculator",
    secondaryImageSrc: "https://placehold.co/600x400/0f0f0f/f97316?text=Recommendations",
    accentColor: "orange",
    category: "teacher",
  },
};

const FeatureDetailPage = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();

  const feature = featureId ? featureData[featureId] : null;

  if (!feature) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Feature not found</h1>
          <button
            onClick={() => navigate("/features")}
            className="text-blue-500 hover:underline"
          >
            Back to Features
          </button>
        </div>
      </div>
    );
  }

  const accentClasses = {
    blue: {
      gradient: "from-blue-500/20",
      border: "border-blue-500/30",
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      glow: "shadow-blue-500/20",
    },
    orange: {
      gradient: "from-orange-500/20",
      border: "border-orange-500/30",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      glow: "shadow-orange-500/20",
    },
  };

  const accent = accentClasses[feature.accentColor];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate("/features")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Features</span>
          </motion.button>

          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${accent.badge}`}>
              {feature.category === "student" ? "For Students" : "For Teachers"}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {feature.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-zinc-400 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {feature.description}
          </motion.p>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                {feature.longDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:scale-105 transition-transform">
                  Get Started Free
                </button>
                <button className="px-6 py-3 border border-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                  Watch Demo
                </button>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Primary Image */}
              <div className={`rounded-2xl overflow-hidden border ${accent.border} shadow-2xl ${accent.glow}`}>
                <img
                  src={feature.primaryImageSrc}
                  alt={feature.title}
                  className="w-full h-auto"
                />
              </div>

              {/* Secondary Image */}
              <motion.div
                className={`absolute -bottom-6 -left-6 w-2/3 rounded-xl overflow-hidden border ${accent.border} shadow-xl`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <img
                  src={feature.secondaryImageSrc}
                  alt={`${feature.title} detail`}
                  className="w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureDetailPage;
