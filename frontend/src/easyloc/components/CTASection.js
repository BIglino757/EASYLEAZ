import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTASection = ({ content }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-24 md:py-32" data-testid="cta-section">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
            {content?.title || "Réservez votre véhicule en quelques minutes"}
          </h2>

          <p className="text-[rgba(250,248,245,0.55)] text-base md:text-lg mt-5 leading-relaxed max-w-xl mx-auto">
            {content?.subtitle || "Notre équipe est à votre disposition pour vous accompagner dans votre choix."}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <button
              data-testid="cta-reservation-button"
              onClick={() => scrollTo("reservation")}
              className="btn-gold inline-flex items-center gap-3 px-10 py-4"
            >
              {content?.cta || "Faire une demande de réservation"}
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
