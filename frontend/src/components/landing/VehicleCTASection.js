import { useApp } from "@/App";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const VehicleCTASection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.vehicle_cta || {};
  const navigate = useNavigate();

  return (
    <section id="vehicules" className="py-24 md:py-32 relative" data-testid="vehicle-cta-section">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/30 to-[#071A1F]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-6">
            Notre catalogue
          </span>

          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF] leading-tight" data-testid="vehicle-cta-title">
            {cms.title || "CHOISISSEZ VOTRE VÉHICULE"}
          </h2>

          <p className="font-inter text-base md:text-lg text-[#E6F7FF]/50 mt-6 max-w-2xl mx-auto leading-relaxed">
            {cms.subtitle || "Découvrez notre sélection de véhicules neufs et d'occasion, sélectionnés avec soin par nos experts."}
          </p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={() => navigate("/catalogue")}
              className="btn-primary-easyleaz px-10 py-4 rounded-full text-base font-semibold tracking-wide inline-flex items-center gap-2 animate-pulse-glow"
              data-testid="vehicle-cta-button"
            >
              {cms.cta_text || "Voir le catalogue"}
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
