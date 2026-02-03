import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWithMockupProps {
  id: string;
  title: string;
  description: string;
  primaryImageSrc: string;
  secondaryImageSrc: string;
  reverseLayout?: boolean;
  accentColor?: "blue" | "orange";
}

export const SectionWithMockup = ({
  id,
  title,
  description,
  primaryImageSrc,
  secondaryImageSrc,
  reverseLayout = false,
  accentColor = "blue",
}: SectionWithMockupProps) => {
  const accentClasses = {
    blue: {
      gradient: "from-blue-500/20 to-transparent",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
    orange: {
      gradient: "from-orange-500/20 to-transparent",
      border: "border-orange-500/30",
      text: "text-orange-400",
    },
  };

  const accent = accentClasses[accentColor];

  return (
    <section
      id={id}
      className="py-16 md:py-24 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
          reverseLayout && "lg:flex-row-reverse"
        )}>
          {/* Text Content */}
          <motion.div
            className={cn(reverseLayout && "lg:order-2")}
            initial={{ opacity: 0, x: reverseLayout ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-8">
              {description}
            </p>
            <button className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300",
              "bg-zinc-800 text-white hover:bg-zinc-700",
              "border border-zinc-700 hover:border-zinc-600"
            )}>
              Learn More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </motion.div>

          {/* Image Mockups */}
          <motion.div
            className={cn(
              "relative",
              reverseLayout && "lg:order-1"
            )}
            initial={{ opacity: 0, x: reverseLayout ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Gradient background glow */}
            <div className={cn(
              "absolute inset-0 bg-gradient-radial rounded-3xl blur-3xl opacity-30",
              accent.gradient
            )} />

            {/* Primary Image */}
            <motion.div
              className={cn(
                "relative z-10 rounded-2xl overflow-hidden border shadow-2xl",
                accent.border,
                "bg-zinc-900"
              )}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={primaryImageSrc}
                alt={title}
                className="w-full h-auto object-cover"
              />
            </motion.div>

            {/* Secondary Image (floating overlay) */}
            <motion.div
              className={cn(
                "absolute -bottom-6 -right-6 z-20 w-2/3 rounded-xl overflow-hidden border shadow-xl",
                accent.border,
                "bg-zinc-900"
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={secondaryImageSrc}
                alt={`${title} detail`}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SectionWithMockup;
