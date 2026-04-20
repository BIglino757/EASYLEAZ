import { useApp } from "@/App";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronRight, Calendar, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const { cmsData } = useApp();
  const hero = cmsData?.hero || {};
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative h-screen overflow-hidden" data-testid="hero-section">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img
          src={hero.background_image || "https://images.unsplash.com/photo-1617814076231-2c58846db944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxtZXJjZWRlcyUyMGFtZyUyMGRhcmt8ZW58MHx8fHwxNzc0MTEwNTk1fDA&ixlib=rb-4.1.0&q=85"}
          alt="Véhicule premium"
          className="w-full h-[120%] object-cover"
        />
      </motion.div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 z-[1] bg-hero-overlay" />

      {/* Scan line effect */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute left-0 right-0 h-px bg-[#22D3EE] animate-[scan-line_8s_linear_infinite]" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ opacity: textOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="font-inter text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-[#22D3EE] mb-6 block">
            Genève, Suisse
          </span>
        </motion.div>

        <motion.h1
          className="font-cinzel text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase text-[#E6F7FF] leading-[1.1] max-w-4xl"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          data-testid="hero-title"
        >
          {hero.title || "LEASING AUTOMOBILE PREMIUM À GENÈVE"}
        </motion.h1>

        <motion.p
          className="font-inter text-base md:text-lg text-[#E6F7FF]/60 mt-6 max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          data-testid="hero-subtitle"
        >
          {hero.subtitle || "Neuf & occasion • Réponse rapide • Accompagnement complet"}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <button
            onClick={() => scrollTo("#demande")}
            className="btn-primary-easyleaz px-8 py-4 rounded-full text-sm md:text-base font-semibold tracking-wide flex items-center gap-2 animate-pulse-glow"
            data-testid="hero-cta-primary"
          >
            {hero.cta_primary || "Demande de leasing"}
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => scrollTo("#contact")}
            className="btn-outline-easyleaz px-8 py-4 rounded-full text-sm md:text-base font-medium tracking-wide flex items-center gap-2"
            data-testid="hero-cta-secondary"
          >
            <Calendar size={18} />
            {hero.cta_secondary || "Nous contacter"}
          </button>
          <button
            onClick={() => navigate("/easyloc")}
            className="px-8 py-4 rounded-full text-sm md:text-base font-semibold tracking-wide flex items-center gap-2 bg-transparent border border-[#C9A227]/50 text-[#D4AF37] hover:bg-[#C9A227]/10 hover:border-[#C9A227] transition-all duration-300"
            data-testid="hero-cta-easyloc"
          >
            <Key size={18} />
            Louer un véhicule
          </button>
        </motion.div>

        {/* Bottom scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#22D3EE]/40 to-transparent" />
          <span className="font-inter text-[10px] tracking-[0.3em] uppercase text-[#E6F7FF]/30">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
};
