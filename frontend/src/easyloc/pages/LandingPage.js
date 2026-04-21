import { useApp } from "../context";
import { useEasyLocTheme } from "../useTheme";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { VehicleCatalogue } from "../components/VehicleCatalogue";
import { ProcessSection } from "../components/ProcessSection";
import { ReservationSection } from "../components/ReservationSection";
import { AppointmentSection } from "../components/AppointmentSection";
import { CTASection } from "../components/CTASection";
import { EasyLeazSwitchSection } from "../components/EasyLeazSwitchSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";

export default function LandingPage() {
  const { content, vehicles } = useApp();
  const { theme, sections } = useEasyLocTheme();

  const themeVars = {
    "--elc-primary": theme.primary,
    "--elc-primary-hover": theme.primary_hover,
    "--elc-accent": theme.accent,
    "--elc-bg": theme.background,
    "--elc-bg-alt": theme.background_alt,
    "--elc-text": theme.text,
    background: theme.background,
  };

  return (
    <div className="min-h-screen" style={themeVars} data-testid="landing-page">
      <Navbar content={content?.navbar} />
      <HeroSection content={content?.hero} />
      {sections.vehicles && <VehicleCatalogue vehicles={vehicles} />}
      {sections.process && <ProcessSection content={content?.process} />}
      {sections.reservation_form && <ReservationSection content={content?.reservation_form} vehicles={vehicles} />}
      {sections.appointment && <AppointmentSection content={content?.appointment} />}
      {sections.reservation_cta && <CTASection content={content?.reservation_cta} />}
      {sections.easyleaz_switch && <EasyLeazSwitchSection />}
      {sections.contact && <ContactSection content={content?.contact} />}
      <Footer content={content?.footer} />
    </div>
  );
}
