import { useApp } from "@/App";
import { motion } from "framer-motion";
import { Fuel, Gauge, Calendar, Settings2, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { mediaUrl } from "@/lib/mediaUrl";

const VehicleCard = ({ vehicle, index }) => {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      className="vehicle-card glass-card glass-card-hover rounded-2xl overflow-hidden flex-shrink-0 w-[340px] md:w-[380px] group"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      data-testid={`vehicle-card-${index}`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={mediaUrl(vehicle.image_url)}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-card-image w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A1F] via-transparent to-transparent" />
        {/* Badge */}
        {vehicle.badge && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 backdrop-blur-md">
            <span className="font-inter text-xs font-semibold text-[#22D3EE] tracking-wide">{vehicle.badge}</span>
          </div>
        )}
        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#22D3EE]/5" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-cinzel text-lg font-semibold text-[#E6F7FF] tracking-wide uppercase">
          {vehicle.brand} {vehicle.model}
        </h3>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#22D3EE]" />
            <span className="font-inter text-sm text-[#E6F7FF]/60">{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-[#22D3EE]" />
            <span className="font-inter text-sm text-[#E6F7FF]/60">{vehicle.mileage?.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel size={14} className="text-[#22D3EE]" />
            <span className="font-inter text-sm text-[#E6F7FF]/60">{vehicle.fuel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings2 size={14} className="text-[#22D3EE]" />
            <span className="font-inter text-sm text-[#E6F7FF]/60">{vehicle.transmission}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-5 pt-4 border-t border-[#22D3EE]/10 flex items-end justify-between">
          <div>
            <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider">Prix</p>
            <p className="font-cinzel text-xl font-bold text-[#E6F7FF]">
              CHF {vehicle.price?.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider">Dès</p>
            <p className="font-inter text-lg font-semibold text-[#22D3EE]">
              CHF {vehicle.monthly_payment?.toLocaleString()}<span className="text-xs text-[#E6F7FF]/40">/mois</span>
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => scrollTo("#demande")}
            className="btn-primary-easyleaz flex-1 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center justify-center gap-1"
            data-testid={`vehicle-cta-leasing-${index}`}
          >
            Demande de leasing <ChevronRight size={14} />
          </button>
          <button
            onClick={() => scrollTo("#rendez-vous")}
            className="btn-outline-easyleaz px-4 py-2.5 rounded-full text-xs font-medium tracking-wide"
            data-testid={`vehicle-cta-rdv-${index}`}
          >
            RDV
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const VehiclesSection = () => {
  const { cmsData, vehicles } = useApp();
  const cms = cmsData?.vehicles || {};
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 400, behavior: "smooth" });
    setTimeout(checkScroll, 500);
  };

  return (
    <section id="vehicules" className="py-24 md:py-32 relative" data-testid="vehicles-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-4">
            Notre sélection
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="vehicles-title">
            {cms.title || "NOS VÉHICULES"}
          </h2>
          <p className="font-inter text-base text-[#E6F7FF]/50 mt-3 max-w-lg">
            {cms.subtitle || "Une sélection premium de véhicules neufs et d'occasion"}
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative">
        {/* Navigation arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#071A1F]/80 backdrop-blur-xl border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE] hover:border-[#22D3EE]/60 transition-colors duration-300"
            data-testid="vehicles-scroll-left"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#071A1F]/80 backdrop-blur-xl border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE] hover:border-[#22D3EE]/60 transition-colors duration-300"
            data-testid="vehicles-scroll-right"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto px-6 lg:px-8 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex-shrink-0 w-[calc((100vw-1280px)/2+1.5rem)] hidden xl:block" />
          {vehicles.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i} />
          ))}
          <div className="flex-shrink-0 w-8" />
        </div>
      </div>
    </section>
  );
};
