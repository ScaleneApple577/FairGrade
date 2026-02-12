import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Check } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";

// CSS Keyframes
const silkFlowKeyframes = `
@keyframes silkFlow {
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 50% 100%; }
  75% { background-position: 0% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}
@keyframes lineGrow {
  0% { width: 0%; }
  100% { width: 100%; }
}
`;

// Animated Step Component with Intersection Observer
const AnimatedStep = ({ step, index, totalSteps }: { step: { num: string; title: string; desc: string }; index: number; totalSteps: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lineVisible, setLineVisible] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Trigger line animation after step appears
          if (index < totalSteps - 1) {
            setTimeout(() => setLineVisible(true), 400);
          }
        }
      },
      { threshold: 0.3 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, index, totalSteps]);

  return (
    <div 
      ref={stepRef}
      className="flex-1 flex flex-col items-center text-center relative"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease-out ${index * 200}ms, transform 0.6s ease-out ${index * 200}ms`
      }}
    >
      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg relative z-10">
        {step.num}
      </div>
      <h3 className="text-xl font-semibold text-white mt-4">{step.title}</h3>
      <p className="text-slate-300 mt-2">{step.desc}</p>
      
      {/* Animated connector line (desktop only) */}
      {index < totalSteps - 1 && (
        <div className="hidden md:block absolute top-5 left-[60%] overflow-hidden" style={{ width: '100%' }}>
          <div 
            className="border-t-2 border-dashed border-white/20"
            style={{
              width: lineVisible ? '100%' : '0%',
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
      )}
    </div>
  );
};

const Index = () => {
  

  return (
    <div 
      className="min-h-screen font-sans"
      style={{
        background: 'linear-gradient(-45deg, #0f172a, #1e3a5f, #1a1a2e, #1e40af, #0f172a, #172554, #1e293b)',
        backgroundSize: '600% 600%',
        animation: 'silkFlow 20s ease infinite'
      }}
    >
      <style>{silkFlowKeyframes}</style>

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 overflow-hidden">

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

          {/* Main Heading */}
          <h1 
            className="text-white text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
            style={{ animation: 'fadeSlideUp 0.8s ease-out forwards' }}
          >
            The group work ghost?
          </h1>
          <div 
            className="mt-4"
            style={{ animation: 'fadeSlideUp 0.8s ease-out 0.1s forwards', opacity: 0 }}
          >
            <span className="bg-primary text-white text-5xl md:text-7xl lg:text-8xl font-bold px-6 py-2 rounded-xl inline-block">
              Caught.
            </span>
          </div>

          {/* Subtitle */}
          <p 
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mt-8"
            style={{ animation: 'fadeSlideUp 0.8s ease-out 0.2s forwards', opacity: 0 }}
          >
            Automatically track student contributions in group projects. No more disputes. No more free riders.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex justify-center mt-10"
            style={{ animation: 'fadeSlideUp 0.8s ease-out 0.4s forwards', opacity: 0 }}
          >
            <button className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl text-lg font-medium flex items-center justify-center gap-2 transition-colors">
              <Play className="w-5 h-5" />
              Watch Demo (2 min)
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white/5 backdrop-blur-sm py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            How FairGrade works
          </h2>

          <div className="flex flex-col md:flex-row gap-8 md:gap-4 mt-16 items-start">
            {[
              { num: "1", title: "Connect Google Drive", desc: "Teachers link their class projects. Students join with a simple invite code." },
              { num: "2", title: "We Track Everything", desc: "FairGrade monitors edits, attendance, peer reviews, and flags issues automatically." },
              { num: "3", title: "Fair Grades, Zero Drama", desc: "Generate detailed contribution reports. Every student gets graded on what they actually did." },
            ].map((step, i) => (
              <AnimatedStep key={i} step={step} index={i} totalSteps={3} />
            ))}
          </div>
        </div>
      </section>

      {/* FOR TEACHERS & STUDENTS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* For Teachers */}
          <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-10">
            <h3 className="text-2xl font-bold">For Teachers</h3>
            <ul className="flex flex-col gap-3 mt-6">
              {[
                "Real-time project health dashboard",
                "AI & plagiarism detection alerts",
                "Live document replay viewer",
                "One-click contribution reports",
                "Free-rider detection"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link 
              to="/auth"
              className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-xl mt-8 hover:bg-primary-foreground transition-colors"
            >
              Start for Free
            </Link>
          </div>

          {/* For Students */}
          <div className="bg-slate-900 text-white rounded-2xl p-10">
            <h3 className="text-2xl font-bold">For Students</h3>
            <ul className="flex flex-col gap-3 mt-6">
              {[
                "Personal contribution dashboard",
                "Calendar & meeting scheduler",
                "Anonymous peer reviews",
                "Goal tracking & progress stats",
                "Fair recognition for your work"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link 
              to="/auth"
              className="inline-block border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl mt-8 hover:bg-white/10 transition-colors"
            >
              Join Your Team
            </Link>
          </div>
        </div>
      </section>


      {/* CTA BANNER */}
      <section className="px-6 my-20 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to make group work fair?
          </h2>
          <p className="text-primary-foreground/80 text-lg mt-4">
            Join 1,000+ educators who trust FairGrade.
          </p>
          <Link 
            to="/auth"
            className="inline-block bg-white text-primary font-semibold px-8 py-4 rounded-xl text-lg mt-8 hover:bg-primary-foreground shadow-lg transition-colors"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black/30 backdrop-blur-sm text-slate-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-11">
                <svg viewBox="0 0 40 48" className="w-full h-full" fill="none">
                  <path 
                    d="M10 14 Q10 10 14 9 L32 5 Q35 4.5 36 7 Q36 9.5 33 10.5 L15 15" 
                    stroke="#60A5FA" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M10 24 L26 20 Q29 19 30 21 Q30 23 27 24 L15 27" 
                    stroke="#60A5FA" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M10 10 L10 42 Q10 44 8 43.5" 
                    stroke="#60A5FA" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg">
                <span className="font-bold text-white">Fair</span>
                <span className="font-bold text-blue-400">Grade</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Fair grading for group projects. Track contributions, detect issues, grade fairly.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 FairGrade. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
