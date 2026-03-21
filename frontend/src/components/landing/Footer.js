export const Footer = () => {
  return (
    <footer className="py-12 border-t border-[#22D3EE]/10" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#E6F7FF]">EASY LEAZ</span>
            <span className="font-inter text-xs text-[#E6F7FF]/30">|</span>
            <span className="font-inter text-xs text-[#E6F7FF]/30 tracking-wider">Genève, Suisse</span>
          </div>
          <p className="font-inter text-xs text-[#E6F7FF]/30">
            &copy; {new Date().getFullYear()} EasyLeaz. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
