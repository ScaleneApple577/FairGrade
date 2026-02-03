import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { ChevronDown, Check, Play } from "lucide-react";
import { TextBlockAnimation } from "@/components/ui/text-block-animation";

export const AnimatedHero = () => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate trust badge
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, delay: 2.2, duration: 0.6, ease: "power2.out" }
      );
    }

    // Animate scroll indicator
    if (scrollIndicatorRef.current) {
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, delay: 2.5, duration: 0.6, ease: "power2.out" }
      );

      // Bouncing arrow animation
      gsap.to(scrollIndicatorRef.current.querySelector(".bounce-arrow"), {
        y: 8,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Trust Badge */}
      <div
        ref={badgeRef}
        className="absolute top-24 left-1/2 -translate-x-1/2 opacity-0"
      >
        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
          <Check className="w-4 h-4 text-green-400" />
          Trusted by 500+ educators worldwide
        </span>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 text-center">
        {/* Main Slogan */}
        <div className="mb-6">
          <TextBlockAnimation
            blockColor="#f97316"
            delay={0.3}
            duration={0.8}
            className="block"
          >
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-extrabold text-white antialiased leading-tight">
              The group work ghost?
            </h1>
          </TextBlockAnimation>
        </div>

        <div className="mb-12">
          <TextBlockAnimation
            blockColor="#000000"
            delay={0.9}
            duration={0.8}
            className="inline-block"
          >
            <div className="bg-white px-4 py-2 md:px-8 md:py-4 inline-block">
              <span className="text-5xl md:text-7xl lg:text-9xl font-extrabold text-black antialiased">
                Caught.
              </span>
            </div>
          </TextBlockAnimation>
        </div>

        {/* Subheading */}
        <div className="mb-10">
          <TextBlockAnimation
            blockColor="#3b82f6"
            delay={1.5}
            duration={0.6}
            className="inline-block"
          >
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto antialiased">
              Automatically track student contributions. No more disputes.
            </p>
          </TextBlockAnimation>
        </div>

        {/* CTA Buttons */}
        <TextBlockAnimation
          blockColor="#ffffff"
          delay={2.0}
          duration={0.6}
          className="inline-block"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
            >
              Get Started Free
            </Link>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg text-lg transition-all duration-200 hover:scale-105 hover:bg-white/10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo (2 min)
            </button>
          </div>
        </TextBlockAnimation>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
      >
        <span className="text-zinc-500 text-sm uppercase tracking-widest font-medium">
          Scroll to Reveal
        </span>
        <ChevronDown className="bounce-arrow w-6 h-6 text-white/60" />
      </div>
    </section>
  );
};
