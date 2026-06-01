import { motion } from "framer-motion";
import { CalendarDays, MessageCircle } from "lucide-react";

export const AppointmentSection = ({ content }) => {
  const embedUrl = content?.embed_url;

  return (
    <section className="relative py-24 md:py-32" data-testid="appointment-section">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <span className="gold-line" style={{ transform: 'rotate(180deg)' }} />
            <span className="tag-gold">Rendez-vous</span>
            <span className="gold-line" />
          </div>
          <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold">
            {content?.title || "Parler avec un conseiller EasyLoc"}
          </h2>
          <p className="text-[rgba(250,248,245,0.55)] text-base mt-4 leading-relaxed">
            {content?.subtitle || "Prenez rendez-vous avec l'un de nos conseillers pour un accompagnement personnalisé."}
          </p>
        </motion.div>

        {/* Content */}
        {embedUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card rounded-2xl p-2 max-w-4xl mx-auto min-h-[500px]"
          >
            <iframe 
              src={embedUrl} 
              title="Calendly" 
              className="w-full min-h-[500px] border-0 rounded-xl" 
              style={{ background: "transparent" }} 
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-lg mx-auto"
            data-testid="appointment-placeholder"
          >
            <div className="glass-card rounded-2xl p-10 md:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.15)] flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="text-[#C9A227]" size={24} />
              </div>

              <h3 className="font-cinzel text-[#FAF8F5] text-lg font-semibold mb-3">
                Rendez-vous en ligne
              </h3>
              <p className="text-[rgba(250,248,245,0.55)] text-sm leading-relaxed mb-8">
                Le système de rendez-vous en ligne sera bientôt disponible. En attendant, contactez-nous directement.
              </p>

              <a
                data-testid="appointment-whatsapp-button"
                href="https://wa.me/41799493229"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Contactez-nous par WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
