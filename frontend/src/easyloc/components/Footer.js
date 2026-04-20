import { motion } from "framer-motion";

export const Footer = ({ content }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-16 pb-8 border-t border-[rgba(201,162,39,0.08)]" data-testid="footer">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="font-cinzel text-[#FAF8F5] text-2xl font-semibold tracking-[0.1em] mb-4">
              {content?.brand || "EASYLOC"}
            </h3>
            <p className="text-[rgba(250,248,245,0.45)] text-sm leading-relaxed max-w-sm">
              {content?.tagline || "Location de véhicules premium à Genève. Service sur mesure et véhicules d'exception pour une expérience inoubliable."}
            </p>
            
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a 
                href="https://www.instagram.com/easylocge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.12)] flex items-center justify-center hover:border-[rgba(201,162,39,0.25)] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-[rgba(250,248,245,0.6)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <p className="text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.15em] mb-5">Navigation</p>
            <nav className="space-y-3">
              {[
                { label: "Véhicules", id: "vehicles" },
                { label: "Processus", id: "process" },
                { label: "Réservation", id: "reservation" },
                { label: "Contact", id: "contact" },
              ].map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="block text-[rgba(250,248,245,0.45)] text-sm hover:text-[#C9A227] transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Legal Column */}
          <div>
            <p className="text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.15em] mb-5">Légal</p>
            <div className="space-y-3">
              <p className="text-[rgba(250,248,245,0.45)] text-sm hover:text-[rgba(250,248,245,0.65)] cursor-pointer transition-colors duration-300">Conditions générales</p>
              <p className="text-[rgba(250,248,245,0.45)] text-sm hover:text-[rgba(250,248,245,0.65)] cursor-pointer transition-colors duration-300">Politique de confidentialité</p>
              <p className="text-[rgba(250,248,245,0.45)] text-sm hover:text-[rgba(250,248,245,0.65)] cursor-pointer transition-colors duration-300">Mentions légales</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[rgba(201,162,39,0.06)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[rgba(250,248,245,0.35)] text-xs">
            © {currentYear} {content?.copyright || "EasyLoc. Tous droits réservés."}
          </p>
          <p className="text-[rgba(201,162,39,0.4)] text-[0.65rem] tracking-[0.2em] uppercase">
            Genève, Suisse
          </p>
        </div>
      </div>
    </footer>
  );
};
