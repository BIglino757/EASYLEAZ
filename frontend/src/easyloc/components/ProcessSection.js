import { motion } from "framer-motion";
import { Car, CalendarDays, CheckCircle } from "lucide-react";

const stepIcons = [Car, CalendarDays, CheckCircle];

export const ProcessSection = ({ content }) => {
  const steps = content?.steps || [
    { number: "01", title: "Choisissez votre véhicule", description: "Parcourez notre catalogue de véhicules premium et sélectionnez celui qui correspond à vos envies." },
    { number: "02", title: "Sélectionnez vos dates", description: "Choisissez vos dates de location et consultez la disponibilité en temps réel." },
    { number: "03", title: "Validez votre réservation", description: "Confirmez votre demande et notre équipe vous contactera sous 30 minutes." },
  ];

  return (
    <section 
      id="process" 
      className="relative py-24 md:py-32" 
      data-testid="process-section"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <span className="gold-line" style={{ transform: 'rotate(180deg)' }} />
            <span className="tag-gold">Simplicité</span>
            <span className="gold-line" />
          </div>
          <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold">
            {content?.title || "Comment ça fonctionne"}
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = stepIcons[index] || CheckCircle;
            return (
              <motion.div
                key={index}
                data-testid={`process-step-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="glass-card glass-card-glow rounded-2xl p-8 h-full relative overflow-hidden">
                  {/* Step Number */}
                  <span className="absolute top-6 right-8 text-5xl font-cinzel font-bold text-[rgba(201,162,39,0.1)]">
                    {step.number}
                  </span>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.15)] flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#C9A227]" />
                  </div>

                  {/* Content */}
                  <h3 className="font-cinzel text-[#FAF8F5] text-lg font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[rgba(250,248,245,0.55)] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
