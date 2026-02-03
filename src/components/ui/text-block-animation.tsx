import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TextBlockAnimationProps {
  children: React.ReactNode;
  blockColor?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export const TextBlockAnimation = ({
  children,
  blockColor = "#f97316",
  delay = 0,
  duration = 0.8,
  className = "",
}: TextBlockAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const block = blockRef.current;
    const content = contentRef.current;

    if (!container || !block || !content) return;

    // Set initial states
    gsap.set(content, { opacity: 0 });
    gsap.set(block, { scaleX: 0, transformOrigin: "left center" });

    // Create the animation timeline
    const tl = gsap.timeline({ delay });

    // Block slides in from left
    tl.to(block, {
      scaleX: 1,
      duration: duration * 0.5,
      ease: "power2.inOut",
    });

    // Content appears
    tl.to(
      content,
      {
        opacity: 1,
        duration: 0.01,
      },
      `-=${duration * 0.1}`
    );

    // Block slides out to right
    tl.to(block, {
      scaleX: 0,
      transformOrigin: "right center",
      duration: duration * 0.5,
      ease: "power2.inOut",
    });

    return () => {
      tl.kill();
    };
  }, [delay, duration]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div
        ref={blockRef}
        className="absolute inset-0 z-10"
        style={{ backgroundColor: blockColor }}
      />
      <div ref={contentRef} className="relative z-0">
        {children}
      </div>
    </div>
  );
};
