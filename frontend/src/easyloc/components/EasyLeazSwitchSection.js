import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";

export const EasyLeazSwitchSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="easyleaz-switch"
      className="relative py-24 md:py-32 overflow-hidden bg-[#080705]"
      data-testid="easyleaz-switch-section"
    >
      {/* Subtle centered cyan glow — no hard color seams against the body */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,211,238,0.07) 0%, rgba(34,211,238,0.03) 30%, transparent 70%)",
        }}
      />
      {/* Thin accent lines at edges */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/20 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/20 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
        >
          {/* Left — visual (mirror inverse of EasyLoc side) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#22D3EE]/20 order-2 md:order-1"
          >
            <img
              src="/sections/golf8r-top.jpeg"
              alt="EasyLeaz — Leasing premium"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-cinzel text-2xl md:text-3xl font-bold tracking-[0.2em] text-white">
                EASY LEAZ
              </span>
              <p className="font-inter text-xs tracking-[0.2em] uppercase text-[#22D3EE] mt-1">
                Leasing automobile · Genève
              </p>
            </div>
          </motion.div>

          {/* Right — copy */}
          <div className="order-1 md:order-2">
            <span className="font-inter text-xs tracking-[0.3em] uppercase text-[#22D3EE] mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-[#22D3EE]" />
              Envie d'un engagement long terme ?
            </span>
            <h2
              className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-semibold uppercase text-[#FAF8F5] leading-[1.15] mb-6"
              data-testid="easyleaz-switch-title"
            >
              Découvrez notre service <span className="text-[#22D3EE]">EasyLeaz</span>
            </h2>
            <p className="font-inter text-base md:text-lg text-[rgba(250,248,245,0.65)] leading-relaxed mb-10 max-w-lg">
              Leasing automobile premium à Genève. Neuf ou occasion, accompagnement
              complet et réponse rapide — pour rouler dans le véhicule de vos rêves.
            </p>

            <button
              onClick={() => navigate("/")}
              data-testid="easyleaz-switch-cta"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#22D3EE] to-[#0EA5B7] hover:from-[#0EA5B7] hover:to-[#0891A3] text-[#071A1F] font-semibold tracking-wide uppercase text-sm rounded-full transition-all duration-300 shadow-[0_4px_30px_-8px_rgba(34,211,238,0.5)] hover:shadow-[0_8px_40px_-8px_rgba(34,211,238,0.7)] hover:-translate-y-0.5"
            >
              <Award size={18} />
              Basculer sur EasyLeaz
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
