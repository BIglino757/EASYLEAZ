import { useApp } from "@/App";
import { motion } from "framer-motion";
import { CalendarDays, ExternalLink } from "lucide-react";

export const AppointmentSection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.appointment || {};

  return (
    <section id="rendez-vous" className="py-24 md:py-32 relative" data-testid="appointment-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E2F36] to-[#071A1F]" />
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1618849888046-a6067b2c92bb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMGFtZyUyMGRhcmt8ZW58MHx8fHwxNzc0MTEwNTk1fDA&ixlib=rb-4.1.0&q=85"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 border border-[#22D3EE]/10 rounded-3xl" />

          <div className="relative z-10 py-20 md:py-28 px-8 md:px-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center mx-auto mb-8">
                <CalendarDays size={36} className="text-[#22D3EE]" />
              </div>

              <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF] mb-4" data-testid="appointment-title">
                {cms.title || "PARLER AVEC UN EXPERT EASYLEAZ"}
              </h2>

              <p className="font-inter text-base md:text-lg text-[#E6F7FF]/50 max-w-xl mx-auto mb-10">
                {cms.subtitle || "Prenez rendez-vous avec l'un de nos conseillers spécialisés"}
              </p>

              {cms.calendly_url ? (
                <a
                  href={cms.calendly_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-easyleaz inline-flex items-center gap-2 px-10 py-4 rounded-full text-base font-semibold tracking-wide animate-pulse-glow"
                  data-testid="appointment-calendly-link"
                >
                  <CalendarDays size={20} />
                  Prendre rendez-vous
                  <ExternalLink size={16} />
                </a>
              ) : (
                <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
                  <CalendarDays size={28} className="text-[#22D3EE] mx-auto mb-4" />
                  <p className="font-inter text-sm text-[#E6F7FF]/50 mb-4">
                    Le système de prise de rendez-vous sera bientôt disponible.
                  </p>
                  <a
                    href="tel:0799493229"
                    className="btn-primary-easyleaz inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
                    data-testid="appointment-phone-button"
                  >
                    Appelez-nous directement
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
