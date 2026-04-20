import { useState, useEffect } from "react";
import { useApp } from "@/App";
import { motion } from "framer-motion";
import { Fuel, Gauge, Calendar, Settings2, ChevronRight, ArrowLeft, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VehicleCard = ({ vehicle, index }) => {
  const navigate = useNavigate();
  const scrollToForm = () => navigate("/#demande");

  return (
    <motion.div
      className="vehicle-card glass-card glass-card-hover rounded-2xl overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      data-testid={`catalog-vehicle-${index}`}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={vehicle.image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-card-image w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A1F] via-transparent to-transparent" />
        {vehicle.badge && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 backdrop-blur-md">
            <span className="font-inter text-xs font-semibold text-[#22D3EE] tracking-wide">{vehicle.badge}</span>
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#22D3EE]/5" />
      </div>

      <div className="p-5">
        <h3 className="font-cinzel text-lg font-semibold text-[#E6F7FF] tracking-wide uppercase">
          {vehicle.brand} {vehicle.model}
        </h3>

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

        <div className="mt-5 pt-4 border-t border-[#22D3EE]/10 flex items-end justify-between">
          <div>
            <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider">Prix</p>
            <p className="font-cinzel text-xl font-bold text-[#E6F7FF]">CHF {vehicle.price?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider">Dès</p>
            <p className="font-inter text-lg font-semibold text-[#22D3EE]">CHF {vehicle.monthly_payment?.toLocaleString()}<span className="text-xs text-[#E6F7FF]/40">/mois</span></p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={scrollToForm} className="btn-primary-easyleaz flex-1 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center justify-center gap-1" data-testid={`catalog-cta-${index}`}>
            Demande de leasing <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CatalogPage() {
  const { API } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("price_asc");

  const activeTab = searchParams.get("type") || "occasion";

  const setActiveTab = (tab) => {
    setSearchParams({ type: tab });
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/vehicles`, { params: { condition: activeTab } });
        setVehicles(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchVehicles();
  }, [API, activeTab]);

  const sortedVehicles = [...vehicles].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "year_desc": return b.year - a.year;
      case "year_asc": return a.year - b.year;
      case "mileage_asc": return a.mileage - b.mileage;
      case "mileage_desc": return b.mileage - a.mileage;
      case "monthly_asc": return a.monthly_payment - b.monthly_payment;
      case "monthly_desc": return b.monthly_payment - a.monthly_payment;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#071A1F]" data-testid="catalog-page">
      {/* Navbar */}
      <nav className="bg-[#071A1F]/80 backdrop-blur-xl border-b border-[#22D3EE]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="font-cinzel text-xl md:text-2xl font-bold tracking-[0.2em] text-[#E6F7FF]" data-testid="catalog-logo">
              EASY LEAZ
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 font-inter text-sm text-[#E6F7FF]/60 hover:text-[#E6F7FF] transition-colors duration-300"
              data-testid="catalog-back-button"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Retour au site</span>
            </button>
            <button
              onClick={() => navigate("/#demande")}
              className="btn-primary-easyleaz px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide"
              data-testid="catalog-nav-cta"
            >
              Demande de leasing
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => setActiveTab("occasion")}
            className={`flex-1 py-4 px-6 rounded-xl font-inter text-sm font-semibold tracking-wide transition-all duration-300 text-center ${
              activeTab === "occasion"
                ? "bg-[#22D3EE]/10 border-2 border-[#22D3EE]/40 text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                : "glass-card border border-transparent text-[#E6F7FF]/50 hover:text-[#E6F7FF]/70 hover:border-[#22D3EE]/10"
            }`}
            data-testid="tab-occasion"
          >
            Nos véhicules d'occasion
          </button>
          <button
            onClick={() => setActiveTab("neuf")}
            className={`flex-1 py-4 px-6 rounded-xl font-inter text-sm font-semibold tracking-wide transition-all duration-300 text-center ${
              activeTab === "neuf"
                ? "bg-[#22D3EE]/10 border-2 border-[#22D3EE]/40 text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                : "glass-card border border-transparent text-[#E6F7FF]/50 hover:text-[#E6F7FF]/70 hover:border-[#22D3EE]/10"
            }`}
            data-testid="tab-neuf"
          >
            Nos véhicules neufs
          </button>
        </div>

        {/* Header + Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="catalog-title">
              {activeTab === "neuf" ? "Nos véhicules neufs" : "Nos véhicules d'occasion"}
            </h1>
            <p className="font-inter text-base text-[#E6F7FF]/50 mt-2">
              Sélectionnés avec soin par les experts EasyLeaz
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ArrowUpDown size={14} className="text-[#22D3EE]/50" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-9 w-52 rounded-lg text-sm" data-testid="catalog-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="monthly_asc">Mensualité croissante</SelectItem>
                <SelectItem value="monthly_desc">Mensualité décroissante</SelectItem>
                <SelectItem value="year_desc">Plus récent</SelectItem>
                <SelectItem value="year_asc">Plus ancien</SelectItem>
                <SelectItem value="mileage_asc">Kilométrage croissant</SelectItem>
                <SelectItem value="mileage_desc">Kilométrage décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="font-inter text-xs text-[#E6F7FF]/30 mb-6">{sortedVehicles.length} véhicule(s)</p>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-2 border-[#22D3EE]/30 border-t-[#22D3EE] rounded-full animate-spin" />
          </div>
        ) : sortedVehicles.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <p className="font-inter text-[#E6F7FF]/40 text-lg">Aucun véhicule disponible pour le moment</p>
            <p className="font-inter text-sm text-[#E6F7FF]/25 mt-2">Revenez bientôt ou contactez-nous pour une demande personnalisée</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-[#22D3EE]/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#E6F7FF]">EASY LEAZ</span>
          <p className="font-inter text-xs text-[#E6F7FF]/30">&copy; {new Date().getFullYear()} EasyLeaz. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
