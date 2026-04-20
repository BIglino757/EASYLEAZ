import { useApp } from "../context";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { VehicleCatalogue } from "../components/VehicleCatalogue";
import { ProcessSection } from "../components/ProcessSection";
import { ReservationSection } from "../components/ReservationSection";
import { CTASection } from "../components/CTASection";
import { AppointmentSection } from "../components/AppointmentSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";

export default function LandingPage() {
  const { content, vehicles } = useApp();

  return (
    <div className="min-h-screen bg-[#080705]" data-testid="landing-page">
      <Navbar content={content?.navbar} />
      <HeroSection content={content?.hero} />
      <VehicleCatalogue vehicles={vehicles} />
      <ProcessSection content={content?.process} />
      <ReservationSection content={content?.reservation_form} vehicles={vehicles} />
      <CTASection content={content?.reservation_cta} />
      <AppointmentSection content={content?.appointment} />
      <ContactSection content={content?.contact} />
      <Footer content={content?.footer} />
    </div>
  );
}
