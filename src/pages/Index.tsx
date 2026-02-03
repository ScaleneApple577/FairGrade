import { Navbar } from "@/components/landing/Navbar";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black scroll-smooth">
      <Navbar />
      <AnimatedHero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
