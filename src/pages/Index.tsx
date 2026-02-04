import { Navbar } from "@/components/landing/Navbar";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { Footer } from "@/components/landing/Footer";
import { Timeline } from "@/components/ui/timeline";
import { FileText, Puzzle, BarChart3 } from "lucide-react";

const timelineData = [
  {
    title: "Step 01",
    content: (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-3">
          Create Project
        </h4>
        <p className="text-slate-600 leading-relaxed">
          Add project details and student emails. Specify which Google Docs, GitHub repos, 
          or meeting links to track.
        </p>
      </div>
    ),
  },
  {
    title: "Step 02",
    content: (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
          <Puzzle className="w-8 h-8 text-primary" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-3">
          Students Install Extension
        </h4>
        <p className="text-slate-600 leading-relaxed">
          One-click install from email invitation. Extension only tracks specified project URLs 
          - not personal browsing.
        </p>
      </div>
    ),
  },
  {
    title: "Step 03",
    content: (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-3">
          View Fair Grades
        </h4>
        <p className="text-slate-600 leading-relaxed">
          See who contributed what. Generate grade reports with timestamped evidence. 
          No more arguments or disputes.
        </p>
      </div>
    ),
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      <Navbar />
      <AnimatedHero />
      <Timeline data={timelineData} />
      <Footer />
    </div>
  );
};

export default Index;
