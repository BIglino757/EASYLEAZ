import { useState, useEffect } from "react";
import { useApp } from "@/App";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { cmsData } = useApp();
  const nav = cmsData?.navbar || {};
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Catalogue", href: "/catalogue", type: "route" },
    { label: "Processus", href: "#processus", type: "scroll" },
    { label: "FAQ", href: "#faq", type: "scroll" },
    { label: "Demande", href: "#demande", type: "scroll" },
    { label: "Contact", href: "#contact", type: "scroll" },
  ];

  const handleLink = (link) => {
    setMobileOpen(false);
    if (link.type === "route") {
      navigate(link.href);
    } else {
      const el = document.querySelector(link.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "bg-[#071A1F]/80 backdrop-blur-xl border-b border-[#22D3EE]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <span className="font-cinzel text-xl md:text-2xl font-bold tracking-[0.2em] text-[#E6F7FF]">
              {nav.logo_text || "EASY LEAZ"}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLink(link)}
                className="font-inter text-sm tracking-widest uppercase text-[#E6F7FF]/70 hover:text-[#22D3EE] transition-colors duration-300"
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/easyloc")}
              className="font-inter text-xs tracking-[0.25em] uppercase text-[#C9A227] hover:text-[#D4AF37] border border-[#C9A227]/30 hover:border-[#C9A227]/60 rounded-full px-4 py-2 transition-all duration-300"
              data-testid="nav-cta-easyloc"
            >
              EasyLoc
            </button>
            <button
              onClick={() => handleLink({ href: "#demande", type: "scroll" })}
              className="btn-primary-easyleaz px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide"
              data-testid="nav-cta-button"
            >
              Demande de leasing
            </button>
          </div>

          <button
            className="md:hidden text-[#E6F7FF]"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#071A1F]/95 backdrop-blur-2xl pt-24 px-8"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col gap-8">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleLink(link)}
                  className="font-cinzel text-2xl tracking-[0.15em] text-[#E6F7FF] hover:text-[#22D3EE] text-left transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleLink({ href: "#demande", type: "scroll" })}
                className="btn-primary-easyleaz px-8 py-4 rounded-full text-base font-semibold tracking-wide mt-4 w-fit"
              >
                Demande de leasing
              </button>
              <button
                onClick={() => { setMobileOpen(false); navigate("/easyloc"); }}
                className="border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 px-8 py-4 rounded-full text-base font-semibold tracking-wide w-fit transition-colors"
                data-testid="mobile-nav-cta-easyloc"
              >
                Louer un véhicule → EasyLoc
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
