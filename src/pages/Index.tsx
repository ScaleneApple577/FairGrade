import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Play, ChevronDown, Check } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* NAVBAR */}
      <nav className="sticky top-0 bg-white/10 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg">
              <span className="font-bold text-white">Fair</span>
              <span className="font-bold text-blue-400">Grade</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors">Home</Link>
            <Link to="/features" className="text-slate-300 hover:text-white font-medium transition-colors">Features</Link>
            <a href="#how-it-works" className="text-slate-300 hover:text-white font-medium transition-colors">How It Works</a>
            <a href="#testimonials" className="text-slate-300 hover:text-white font-medium transition-colors">Testimonials</a>
            <Link to="/pricing" className="text-slate-300 hover:text-white font-medium transition-colors">Pricing</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-slate-300 hover:text-white font-medium transition-colors">Log In</Link>
            <Link to="/auth" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 font-medium transition-colors">
              Sign Up Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-6 py-4 space-y-4">
            <Link to="/" className="block text-slate-300 hover:text-white font-medium">Home</Link>
            <Link to="/features" className="block text-slate-300 hover:text-white font-medium">Features</Link>
            <a href="#how-it-works" className="block text-slate-300 hover:text-white font-medium">How It Works</a>
            <a href="#testimonials" className="block text-slate-300 hover:text-white font-medium">Testimonials</a>
            <Link to="/pricing" className="block text-slate-300 hover:text-white font-medium">Pricing</Link>
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link to="/auth" className="block text-slate-300 hover:text-white font-medium">Log In</Link>
              <Link to="/auth" className="block bg-primary text-white px-5 py-2.5 rounded-lg text-center font-medium">
                Sign Up Now
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Trust Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-sm px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm mb-8"
            style={{ animation: 'fadeSlideUp 0.8s ease-out forwards' }}
          >
            <Check className="w-4 h-4" />
            Trusted by 1,000+ educators worldwide
          </div>

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
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            style={{ animation: 'fadeSlideUp 0.8s ease-out 0.4s forwards', opacity: 0 }}
          >
            <Link 
              to="/auth"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-xl text-lg font-semibold shadow-lg transition-colors"
              style={{ boxShadow: '0 10px 40px rgba(59,130,246,0.25)' }}
            >
              Sign Up Free
            </Link>
            <button className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl text-lg font-medium flex items-center justify-center gap-2 transition-colors">
              <Play className="w-5 h-5" />
              Watch Demo (2 min)
            </button>
          </div>
        </div>

        {/* Bounce Chevron */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          style={{ animation: 'bounce 2s infinite' }}
        >
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="bg-white/5 backdrop-blur-sm py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-8">
            Integrated with tools students already use
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <span className="text-slate-500 font-semibold text-xl">Google Docs</span>
            <span className="text-slate-500 font-semibold text-xl">Google Sheets</span>
            <span className="text-slate-500 font-semibold text-xl">Google Slides</span>
            <span className="text-slate-500 font-semibold text-xl">Canvas</span>
            <span className="text-slate-500 font-semibold text-xl">Blackboard</span>
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

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-white/5 backdrop-blur-sm py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            Loved by educators & students
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { quote: "FairGrade eliminated all the 'he said, she said' in group project grading. I can see exactly who did what.", author: "Prof. Sarah Chen", role: "Stanford University" },
              { quote: "Finally, my contributions are visible. No more carrying the team without recognition.", author: "Alex Rivera", role: "Student, UCLA" },
              { quote: "The live replay feature is a game-changer. It's like having a DVR for student collaboration.", author: "Dr. James Park", role: "MIT" },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                <p className="text-slate-200 italic leading-relaxed">"{testimonial.quote}"</p>
                <p className="font-semibold text-white mt-6">{testimonial.author}</p>
                <p className="text-slate-400 text-sm">{testimonial.role}</p>
              </div>
            ))}
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
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
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
