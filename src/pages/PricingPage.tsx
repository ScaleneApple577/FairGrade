import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

const silkFlowKeyframes = `
@keyframes silkFlow {
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 50% 100%; }
  75% { background-position: 0% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const PricingPage = () => {
  return (
    <div 
      className="min-h-screen scroll-smooth"
      style={{
        background: 'linear-gradient(-45deg, #0f172a, #1e3a5f, #1a1a2e, #1e40af, #0f172a, #172554, #1e293b)',
        backgroundSize: '600% 600%',
        animation: 'silkFlow 20s ease infinite'
      }}
    >
      <style>{silkFlowKeyframes}</style>
      <Navbar />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
