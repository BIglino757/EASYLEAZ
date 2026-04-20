import { useApp } from "@/App";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { VehiclesSection } from "@/components/landing/VehiclesSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { LeasingFormSection } from "@/components/landing/LeasingFormSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071A1F] flex items-center justify-center" data-testid="loading-screen">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-[#22D3EE]/30 border-t-[#22D3EE] rounded-full animate-spin" />
          <span className="font-cinzel text-xl tracking-[0.3em] text-[#E6F7FF]/60">EASY LEAZ</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071A1F]" data-testid="landing-page">
      <Navbar />
      <HeroSection />
      <VehiclesSection />
      <ProcessSection />
      <LeasingFormSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
