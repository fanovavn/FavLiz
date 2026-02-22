import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { ProblemSection } from "./components/ProblemSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PlatformsSection } from "./components/PlatformsSection";
import { UseCasesSection } from "./components/UseCasesSection";
import { ProductsSection } from "./components/ProductsSection";
import { ComparisonSection } from "./components/ComparisonSection";
import { PrivacySection } from "./components/PrivacySection";
import { MetricsSection } from "./components/MetricsSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <HowItWorksSection />
      <PlatformsSection />
      <UseCasesSection />
      <ProductsSection />
      <ComparisonSection />
      <PrivacySection />
      <MetricsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
