import { useApp } from "@/App";

export const Footer = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.contact || {};
  const currentYear = new Date().getFullYear();

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative pt-16 pb-8 border-t border-[#22D3EE]/10" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column — Keep "EASY LEAZ | Genève" then Instagram below */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-cinzel text-2xl font-bold tracking-[0.2em] text-[#E6F7FF]">
                EASY LEAZ
              </span>
              <span className="font-inter text-xs text-[#E6F7FF]/30">|</span>
              <span className="font-inter text-xs text-[#E6F7FF]/40 tracking-wider">
                Genève, Suisse
              </span>
            </div>
            <p className="text-[#E6F7FF]/45 text-sm leading-relaxed max-w-sm">
              Leasing automobile premium à Genève. Neuf ou occasion, accompagnement complet et réponse rapide pour rouler dans le véhicule de vos rêves.
            </p>

            {/* Instagram icon - redirects to EasyLeaz Instagram */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={cms.instagram_url || "https://www.instagram.com/easyleazge?igsh=dnQ5ODBxcGthMWp2"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram EasyLeaz"
                data-testid="footer-instagram"
                className="w-10 h-10 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center hover:border-[#22D3EE]/40 hover:bg-[#22D3EE]/20 transition-all duration-300"
              >
                <svg className="w-4 h-4 text-[#E6F7FF]/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <p className="text-[#E6F7FF] text-xs font-semibold uppercase tracking-[0.15em] mb-5">Navigation</p>
            <nav className="space-y-3">
              {[
                { label: "Catalogue", href: "/catalogue", route: true },
                { label: "Processus", href: "#processus", route: false },
                { label: "FAQ", href: "#faq", route: false },
                { label: "Demande", href: "#demande", route: false },
                { label: "Contact", href: "#contact", route: false },
              ].map(link => (
                link.route ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-[#E6F7FF]/45 text-sm hover:text-[#22D3EE] transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className="block text-[#E6F7FF]/45 text-sm hover:text-[#22D3EE] transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>
          </div>

          {/* Legal Column */}
          <div>
            <p className="text-[#E6F7FF] text-xs font-semibold uppercase tracking-[0.15em] mb-5">Légal</p>
            <div className="space-y-3">
              <p className="text-[#E6F7FF]/45 text-sm hover:text-[#E6F7FF]/70 cursor-pointer transition-colors duration-300" data-testid="footer-legal-cgu">Conditions générales</p>
              <p className="text-[#E6F7FF]/45 text-sm hover:text-[#E6F7FF]/70 cursor-pointer transition-colors duration-300" data-testid="footer-legal-privacy">Politique de confidentialité</p>
              <p className="text-[#E6F7FF]/45 text-sm hover:text-[#E6F7FF]/70 cursor-pointer transition-colors duration-300" data-testid="footer-legal-mentions">Mentions légales</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#22D3EE]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#E6F7FF]/35 text-xs">
            &copy; {currentYear} EasyLeaz. Tous droits réservés.
          </p>
          <p className="text-[#22D3EE]/40 text-[0.65rem] tracking-[0.2em] uppercase">
            Genève, Suisse
          </p>
        </div>
      </div>
    </footer>
  );
};
