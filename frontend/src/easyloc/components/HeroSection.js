import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const HeroSection = ({ content }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section data-testid="hero-section" className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          src="https://images.unsplash.com/photo-1668037069509-ba4c569475b1?w=1920&q=90"
          alt="Véhicule premium"
          className="w-full h-full object-cover"
        />
        
        {/* VERY SMOOTH and LONG gradient - starts from top */}
        <div className="absolute inset-0 bg-hero-overlay" />
        
        {/* Subtle gold tint at very bottom only - NO ANIMATION */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[40%]"
          style={{
            background: 'linear-gradient(to top, rgba(201, 162, 39, 0.03) 0%, transparent 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pb-28 md:pb-32 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Location tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="inline-flex items-center gap-3 mb-7"
          >
            <span className="gold-line" />
            <span className="tag-gold">Genève, Suisse</span>
          </motion.div>

          {/* Main Title */}
          <h1
            data-testid="hero-title"
            className="font-cinzel text-[#FAF8F5] text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-semibold max-w-4xl"
          >
            {content?.title || "Location de véhicules premium à Genève"}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-[rgba(250,248,245,0.65)] text-base md:text-lg mt-6 max-w-xl leading-relaxed"
          >
            {content?.subtitle || "Service sur mesure · Véhicules d'exception · Disponibilité immédiate"}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 mt-10"
          >
            <button
              data-testid="hero-cta-primary"
              onClick={() => scrollTo("reservation")}
              className="btn-gold"
            >
              {content?.cta_primary || "Réserver maintenant"}
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={() => scrollTo("vehicles")}
              className="btn-outline-gold"
            >
              {content?.cta_secondary || "Voir les véhicules"}
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => scrollTo("vehicles")}
          >
            <span className="text-[rgba(201,162,39,0.5)] text-xs tracking-[0.15em] uppercase">Découvrir</span>
            <ChevronDown className="text-[rgba(201,162,39,0.5)]" size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
