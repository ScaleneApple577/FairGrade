import { Navbar } from "@/components/landing/Navbar";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black scroll-smooth">
      <Navbar />
      <AnimatedHero />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
