import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Key } from "lucide-react";

export const EasyLocSwitchSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="easyloc-switch"
      className="relative py-24 md:py-32 overflow-hidden"
      data-testid="easyloc-switch-section"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071A1F] via-[#0A2A30] to-[#071A1F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08)_0%,transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
        >
          {/* Left — copy */}
          <div>
            <span className="font-inter text-xs tracking-[0.3em] uppercase text-[#C9A227] mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-[#C9A227]" />
              Besoin d'une location courte durée ?
            </span>
            <h2
              className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-[#E6F7FF] leading-[1.15] mb-6"
              data-testid="easyloc-switch-title"
            >
              Découvrez notre service <span className="text-[#C9A227]">EasyLoc</span>
            </h2>
            <p className="font-inter text-base md:text-lg text-[#E6F7FF]/60 leading-relaxed mb-10 max-w-lg">
              Location de véhicules premium à Genève. Service sur mesure, véhicules
              d'exception, disponibilité immédiate — sans engagement long terme.
            </p>

            <button
              onClick={() => navigate("/easyloc")}
              data-testid="easyloc-switch-cta"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] hover:from-[#C9A227] hover:to-[#B8921E] text-[#080705] font-semibold tracking-wide uppercase text-sm rounded-full transition-all duration-300 shadow-[0_4px_30px_-8px_rgba(201,162,39,0.5)] hover:shadow-[0_8px_40px_-8px_rgba(201,162,39,0.7)] hover:-translate-y-0.5"
            >
              <Key size={18} />
              Basculer sur EasyLoc
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right — visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#C9A227]/20"
          >
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
              alt="EasyLoc - Location premium"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-cinzel text-2xl md:text-3xl font-bold tracking-[0.2em] text-white">
                EASYLOC
              </span>
              <p className="font-inter text-xs tracking-[0.2em] uppercase text-[#C9A227] mt-1">
                Location premium · Genève
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
