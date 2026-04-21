import { useApp } from "../context";
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

  return (
    <div className="min-h-screen bg-[#080705]" data-testid="landing-page">
      <Navbar content={content?.navbar} />
      {/* 1. Accroche */}
      <HeroSection content={content?.hero} />
      {/* 2. Tentation — catalogue premium */}
      <VehicleCatalogue vehicles={vehicles} />
      {/* 3. Éducation — processus de location */}
      <ProcessSection content={content?.process} />
      {/* 4. Conversion — formulaire de réservation */}
      <ReservationSection content={content?.reservation_form} vehicles={vehicles} />
      {/* 5. Alternative — prendre rendez-vous avec un conseiller */}
      <AppointmentSection content={content?.appointment} />
      {/* 6. Rappel final — CTA de réservation */}
      <CTASection content={content?.reservation_cta} />
      {/* 7. Cross-sell — basculer vers EasyLeaz (leasing long terme) */}
      <EasyLeazSwitchSection />
      {/* 8. Contact */}
      <ContactSection content={content?.contact} />
      <Footer content={content?.footer} />
    </div>
  );
}
