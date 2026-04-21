import { useApp } from "@/App";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { VehicleCTASection } from "@/components/landing/VehicleCTASection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { LeasingFormSection } from "@/components/landing/LeasingFormSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { EasyLocSwitchSection } from "@/components/landing/EasyLocSwitchSection";
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
      {/* 1. Accroche */}
      <HeroSection />
      {/* 2. Présentation de la marque */}
      <AboutSection />
      {/* 3. Éducation — comment ça marche */}
      <ProcessSection />
      {/* 4. Tentation — CTA vers le catalogue véhicules */}
      <VehicleCTASection />
      {/* 5. Conversion — formulaire de demande */}
      <LeasingFormSection />
      {/* 6. Levée des objections */}
      <FAQSection />
      {/* 7. Cross-sell — basculer vers EasyLoc */}
      <EasyLocSwitchSection />
      {/* 8. Contact final */}
      <ContactSection />
      <Footer />
    </div>
  );
}
