import { Navbar } from "@/components/landing/Navbar";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-black scroll-smooth">
      <Navbar />
      <div className="pt-16">
        <Features />
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
