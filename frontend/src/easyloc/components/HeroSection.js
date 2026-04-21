import { motion } from "framer-motion";
import { ChevronDown, Award, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

export const HeroSection = ({ content }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <section data-testid="hero-section" className="relative min-h-screen w-full overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src="/videos/easyloc-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          data-testid="hero-video"
        />

        {/* VERY SMOOTH and LONG gradient - reduced opacity so video is visible */}
        <div className="absolute inset-0 bg-hero-overlay opacity-60" />

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
            <button
              data-testid="hero-cta-easyleaz"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-xs font-semibold tracking-[0.05em] uppercase border border-[#22D3EE]/40 text-[#22D3EE] hover:bg-[#22D3EE]/10 hover:border-[#22D3EE]/60 transition-all duration-300"
            >
              <Award size={16} />
              Leasing long terme
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

      {/* Audio toggle button — fixed at bottom-right of hero */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        data-testid="hero-audio-toggle"
        className="absolute bottom-8 right-8 z-20 w-12 h-12 rounded-full bg-[#080705]/70 backdrop-blur-md border border-[#C9A227]/30 hover:border-[#C9A227]/60 hover:bg-[#080705]/90 flex items-center justify-center transition-all duration-300 group"
      >
        {muted ? (
          <VolumeX size={18} className="text-[#FAF8F5]/70 group-hover:text-[#C9A227] transition-colors" />
        ) : (
          <Volume2 size={18} className="text-[#C9A227] transition-colors" />
        )}
      </button>
    </section>
  );
};
