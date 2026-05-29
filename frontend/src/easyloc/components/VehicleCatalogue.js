import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Fuel, Gauge, Zap, Settings2 } from "lucide-react";
import { VehicleModal } from "../components/VehicleModal";

const specIcons = {
  power: Zap,
  acceleration: Gauge,
  transmission: Settings2,
  fuel: Fuel,
};

const VehicleDescription = ({ description }) => {
  const [open, setOpen] = useState(false);
  if (!description) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="vehicle-desc-toggle"
        className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-[rgba(201,162,39,0.2)] text-[#C9A227] text-[0.7rem] uppercase tracking-wider hover:bg-[rgba(201,162,39,0.06)] transition-colors"
      >
        <span>{open ? "Masquer la description" : "Voir la description"}</span>
        <ChevronRight size={12} className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-[rgba(250,248,245,0.65)] text-xs mt-3 whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VehicleCatalogue = ({ vehicles }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 420;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <section 
      id="vehicles" 
      className="relative py-24 md:py-32" 
      data-testid="vehicle-catalogue"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="gold-line" />
              <span className="tag-gold">Notre flotte</span>
            </div>
            <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Véhicules d'exception
            </h2>
            <p className="text-[rgba(250,248,245,0.55)] text-base mt-4 max-w-lg">
              Découvrez notre sélection de véhicules premium disponibles à la location.
            </p>
          </div>

          {/* Carousel Navigation — hidden when only one vehicle */}
          {vehicles.length > 1 && (
            <div className="flex gap-3">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="carousel-nav-btn w-12 h-12 rounded-full flex items-center justify-center"
                aria-label="Précédent"
                data-testid="carousel-prev"
              >
                <ChevronLeft size={20} className="text-[#FAF8F5]" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="carousel-nav-btn w-12 h-12 rounded-full flex items-center justify-center"
                aria-label="Suivant"
                data-testid="carousel-next"
              >
                <ChevronRight size={20} className="text-[#FAF8F5]" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Horizontal Carousel */}
        <div className="relative -mx-6 lg:-mx-12">
          <div
            ref={carouselRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-6 lg:px-12 pb-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                data-testid={`vehicle-card-${vehicle.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 w-[360px] md:w-[400px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="vehicle-card glass-card glass-card-glow rounded-2xl overflow-hidden h-full">
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="vehicle-card-image w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A07] via-transparent to-transparent opacity-80" />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 price-tag rounded-lg px-3 py-2">
                      <span className="text-[#FAF8F5] text-sm font-semibold">CHF {vehicle.price_day}</span>
                      <span className="text-[rgba(250,248,245,0.5)] text-xs ml-1">/jour</span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="category-badge text-[rgba(250,248,245,0.75)] text-[0.65rem] uppercase tracking-wider rounded-md px-2.5 py-1.5">
                        {vehicle.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="font-cinzel text-[#FAF8F5] text-lg font-semibold">
                      {vehicle.name}
                    </h3>
                    <p className="text-[rgba(250,248,245,0.5)] text-sm mt-1">
                      {vehicle.year}
                    </p>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {Object.entries(vehicle.specs || {}).map(([key, value]) => {
                        const Icon = specIcons[key] || Gauge;
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <Icon size={12} className="text-[#C9A227]" />
                            <span className="text-[rgba(250,248,245,0.6)] text-xs">{value}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pricing Info */}
                    <div className="flex items-center gap-6 mt-5 pt-5 border-t border-[rgba(201,162,39,0.08)]">
                      <div>
                        <p className="text-[rgba(250,248,245,0.4)] text-[0.65rem] uppercase tracking-wider">Jour</p>
                        <p className="text-[#FAF8F5] text-sm font-medium mt-0.5">CHF {vehicle.price_day}</p>
                      </div>
                      <div className="w-[1px] h-8 bg-[rgba(201,162,39,0.1)]" />
                      <div>
                        <p className="text-[rgba(250,248,245,0.4)] text-[0.65rem] uppercase tracking-wider">Week-end</p>
                        <p className="text-[#FAF8F5] text-sm font-medium mt-0.5">CHF {vehicle.price_weekend}</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      data-testid={`vehicle-availability-btn-${vehicle.id}`}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="w-full mt-5 btn-outline-gold py-3 flex items-center justify-center gap-2 text-xs"
                    >
                      <CalendarIcon size={14} />
                      Voir disponibilité
                    </button>

                    {/* Description (expandable) */}
                    <VehicleDescription description={vehicle.description} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#080705] to-transparent pointer-events-none lg:w-16" />
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#080705] to-transparent pointer-events-none lg:w-16" />
        </div>
      </div>

      {/* Vehicle Modal */}
      {selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </section>
  );
};
