import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Navbar = ({ content }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Véhicules", id: "vehicles" },
    { label: "Processus", id: "process" },
    { label: "Réservation", id: "reservation" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <>
      <motion.header
        data-testid="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "navbar-scrolled"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
          {/* Brand */}
          <a 
            href="/" 
            className="font-cinzel text-[#FAFAFA] text-lg font-semibold tracking-[0.15em] hover:text-[#C9A227] transition-colors duration-300" 
            data-testid="navbar-brand"
          >
            {content?.brand || "EASYLOC"}
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                data-testid={`nav-link-${link.id}`}
                onClick={() => scrollTo(link.id)}
                className="relative text-[rgba(250,250,250,0.6)] hover:text-[#FAFAFA] text-sm font-medium transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
            <button
              data-testid="nav-cta-easyleaz"
              onClick={() => navigate("/")}
              className="font-inter text-xs tracking-[0.25em] uppercase text-[#22D3EE] hover:text-[#67E8F9] border border-[#22D3EE]/30 hover:border-[#22D3EE]/60 rounded-full px-4 py-2 transition-all duration-300"
            >
              Easy Leaz
            </button>
            <button
              data-testid="nav-cta-button"
              onClick={() => scrollTo("reservation")}
              className="btn-gold py-2.5 px-6 text-xs"
            >
              Réserver
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#FAFAFA] p-2 hover:text-[#C9A227] transition-colors duration-300"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0A0A0C]/98 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* Gold glow effect */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[radial-gradient(ellipse,rgba(201,162,39,0.08)_0%,transparent_70%)] pointer-events-none" />
            
            <nav className="flex flex-col items-center gap-8 relative z-10">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => scrollTo(link.id)}
                  className="font-cinzel text-[#FAFAFA] text-2xl font-medium hover:text-[#C9A227] transition-colors duration-300"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => scrollTo("reservation")}
                className="btn-gold mt-4 px-10"
              >
                Réserver maintenant
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { setMobileOpen(false); navigate("/"); }}
                data-testid="mobile-nav-cta-easyleaz"
                className="border border-[#22D3EE]/40 text-[#22D3EE] hover:bg-[#22D3EE]/10 px-10 py-4 rounded-full text-sm uppercase tracking-widest font-medium transition-colors"
              >
                Basculer sur EasyLeaz
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
