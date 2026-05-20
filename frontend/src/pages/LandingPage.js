import { useApp } from "@/App";
import { useEasyLeazTheme } from "@/hooks/useEasyLeazTheme";
import { MetaTags } from "@/components/MetaTags";
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
  const { theme, sections } = useEasyLeazTheme();

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

  // Inline CSS variables allow admin-edited theme to override defaults
  const themeVars = {
    "--el-primary": theme.primary,
    "--el-primary-hover": theme.primary_hover,
    "--el-accent": theme.accent,
    "--el-bg": theme.background,
    "--el-bg-alt": theme.background_alt,
    "--el-text": theme.text,
    background: theme.background,
  };

  return (
    <div className="min-h-screen" style={themeVars} data-testid="landing-page">
      <MetaTags site="easyleaz" />
      <Navbar />
      <HeroSection />
      {sections.about && <AboutSection />}
      {sections.process && <ProcessSection />}
      {sections.vehicle_cta && <VehicleCTASection />}
      {sections.leasing_form && <LeasingFormSection />}
      {sections.faq && <FAQSection />}
      {sections.easyloc_switch && <EasyLocSwitchSection />}
      {sections.contact && <ContactSection />}
      <Footer />
    </div>
  );
}
