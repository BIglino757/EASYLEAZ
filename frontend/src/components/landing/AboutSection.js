import { useApp } from "@/App";
import { motion } from "framer-motion";

export const AboutSection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.about || {};
  const content = cms.content || "EasyLeaz est votre partenaire de confiance pour le leasing automobile à Genève. Fondée par des passionnés de l'automobile, notre entreprise s'est donné pour mission de rendre le leasing accessible, transparent et sur-mesure.\n\nNous accompagnons chaque client de A à Z : du choix du véhicule à la signature du contrat, en passant par la recherche du meilleur financement adapté à votre profil. Que vous recherchiez un véhicule neuf ou d'occasion, notre équipe d'experts sélectionne pour vous les meilleures offres du marché suisse.\n\nNotre approche se distingue par un service personnalisé, une réponse rapide et une transparence totale sur les conditions de leasing. Basés à Genève, nous connaissons parfaitement le marché local et les attentes de notre clientèle exigeante.";

  const paragraphs = content.split("\n").filter(p => p.trim());

  return (
    <section id="a-propos" className="py-24 md:py-32 relative" data-testid="about-section">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/20 to-[#071A1F]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-4">
            Notre histoire
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="about-title">
            {cms.title || "QUI SOMMES-NOUS ?"}
          </h2>
        </motion.div>

        <motion.div
          className="glass-card rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="font-inter text-base md:text-lg text-[#E6F7FF]/70 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Decorative accent */}
          <div className="mt-8 pt-8 border-t border-[#22D3EE]/10 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="font-cinzel text-2xl font-bold text-[#22D3EE]">Genève</p>
              <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider mt-1">Localisation</p>
            </div>
            <div className="w-px h-12 bg-[#22D3EE]/10" />
            <div className="text-center">
              <p className="font-cinzel text-2xl font-bold text-[#22D3EE]">Premium</p>
              <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider mt-1">Service</p>
            </div>
            <div className="w-px h-12 bg-[#22D3EE]/10" />
            <div className="text-center">
              <p className="font-cinzel text-2xl font-bold text-[#22D3EE]">24-48h</p>
              <p className="font-inter text-xs text-[#E6F7FF]/40 uppercase tracking-wider mt-1">Réponse</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
