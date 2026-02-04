import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group" aria-label="FairGrade Home">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="hidden sm:inline text-xl font-bold">
              <span className="text-slate-900">Fair</span>
              <span className="text-blue-500">Grade</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-primary transition-all duration-200 font-medium text-sm hover:scale-105"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth"
              className="px-4 py-2 text-slate-600 hover:text-primary font-medium text-sm transition-all duration-200 hover:scale-105"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Sign Up Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-900"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white"
            >
              <div className="py-4 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block py-2 text-slate-600 hover:text-primary transition-all duration-200 font-medium hover:translate-x-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 space-y-2">
                  <Link
                    to="/auth"
                    className="block w-full py-3 text-center text-slate-600 border border-slate-200 rounded-lg font-medium transition-all duration-200 hover:bg-slate-50 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/auth"
                    className="block w-full py-3 text-center bg-primary text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
