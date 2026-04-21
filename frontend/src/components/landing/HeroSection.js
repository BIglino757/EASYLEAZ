import { useApp } from "@/App";
import { useEasyLeazTheme } from "@/hooks/useEasyLeazTheme";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronRight, Calendar, Key, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const { cmsData } = useApp();
  const hero = cmsData?.hero || {};
  const { hero_media } = useEasyLeazTheme();
  const ref = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [muted, setMuted] = useState(true);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  const isVideo = hero_media.type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(hero_media.url || "");

  return (
    <section ref={ref} className="relative h-screen overflow-hidden" data-testid="hero-section">
      {/* Background media (video or image) with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        {isVideo ? (
          <video
            ref={videoRef}
            src={hero_media.url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-[120%] object-cover"
            data-testid="hero-video"
          />
        ) : (
          <img
            src={hero_media.url}
            alt="Hero"
            className="w-full h-[120%] object-cover"
            data-testid="hero-image"
          />
        )}
      </motion.div>

      {/* Overlay gradient — opacity configurable via CMS */}
      <div className="absolute inset-0 z-[1] bg-hero-overlay" style={{ opacity: hero_media.overlay_opacity ?? 0.5 }} />

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

      {/* Audio toggle button — fixed at bottom-right of hero */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        data-testid="hero-audio-toggle"
        className="absolute bottom-8 right-8 z-20 w-12 h-12 rounded-full bg-[#071A1F]/70 backdrop-blur-md border border-[#22D3EE]/30 hover:border-[#22D3EE]/60 hover:bg-[#071A1F]/90 flex items-center justify-center transition-all duration-300 group"
      >
        {muted ? (
          <VolumeX size={18} className="text-[#E6F7FF]/70 group-hover:text-[#22D3EE] transition-colors" />
        ) : (
          <Volume2 size={18} className="text-[#22D3EE] transition-colors" />
        )}
      </button>
    </section>
  );
};
