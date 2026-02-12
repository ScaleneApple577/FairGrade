export const Footer = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-sm text-white py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        {/* Brand */}
        <div className="mb-8">
          <a href="/" className="flex items-center gap-3 group cursor-pointer mb-4">
            <div className="w-10 h-12 group-hover:scale-105 transition-transform duration-300">
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
            <span className="text-xl font-bold">
              <span className="text-white">Fair</span>
              <span className="text-blue-400">Grade</span>
            </span>
          </a>
          <p className="text-slate-400 text-sm max-w-xs">
            Fair grading for group projects. Track contributions, detect issues, grade fairly.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} FairGrade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
