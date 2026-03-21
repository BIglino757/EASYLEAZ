import { useApp } from "@/App";
import { motion } from "framer-motion";
import { Car, FileText, CheckCircle } from "lucide-react";

const icons = [Car, FileText, CheckCircle];

export const ProcessSection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.process || {};
  const steps = cms.steps || [
    { number: "01", title: "Choix du véhicule", description: "Parcourez notre sélection ou indiquez-nous le véhicule de vos rêves." },
    { number: "02", title: "Demande de leasing", description: "Remplissez votre demande en quelques minutes. Nous nous occupons du reste." },
    { number: "03", title: "Validation rapide", description: "Recevez une réponse rapide et prenez le volant de votre nouveau véhicule." },
  ];

  return (
    <section id="processus" className="py-24 md:py-32 relative" data-testid="process-section">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/30 to-[#071A1F]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-4">
            Notre processus
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="process-title">
            {cms.title || "COMMENT ÇA MARCHE"}
          </h2>
          <p className="font-inter text-base text-[#E6F7FF]/50 mt-3 max-w-lg mx-auto">
            {cms.subtitle || "Un processus simple et rapide en 3 étapes"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-[#22D3EE]/30 to-transparent" />

          {steps.map((step, i) => {
            const Icon = icons[i] || CheckCircle;
            return (
              <motion.div
                key={i}
                className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                data-testid={`process-step-${i}`}
              >
                {/* Icon circle */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full bg-[#071A1F] border border-[#22D3EE]/20 flex items-center justify-center relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22D3EE]/10 to-transparent flex items-center justify-center">
                      <Icon size={32} className="text-[#22D3EE]" />
                    </div>
                  </div>
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-[#22D3EE]/5 blur-xl" />
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#22D3EE] flex items-center justify-center z-20">
                    <span className="font-inter text-xs font-bold text-[#071A1F]">{step.number}</span>
                  </div>
                </div>

                <h3 className="font-cinzel text-xl font-semibold text-[#E6F7FF] tracking-wide uppercase mb-3">
                  {step.title}
                </h3>
                <p className="font-inter text-sm text-[#E6F7FF]/50 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
