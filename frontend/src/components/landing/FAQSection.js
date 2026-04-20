import { useState } from "react";
import { useApp } from "@/App";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQItem = ({ question, answer, index, isOpen, toggle }) => (
  <motion.div
    className="glass-card glass-card-hover rounded-xl overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    data-testid={`faq-item-${index}`}
  >
    <button
      onClick={toggle}
      className="w-full px-6 py-5 flex items-center justify-between text-left"
    >
      <span className="font-inter text-sm md:text-base font-medium text-[#E6F7FF] pr-4">{question}</span>
      <ChevronDown
        size={18}
        className={`text-[#22D3EE] flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-5 pt-0">
            <div className="h-px bg-[#22D3EE]/10 mb-4" />
            <p className="font-inter text-sm text-[#E6F7FF]/60 leading-relaxed">{answer}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export const FAQSection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.faq || {};
  const [openIndex, setOpenIndex] = useState(null);

  const defaultQuestions = [
    { question: "Qu'est-ce que le leasing automobile ?", answer: "Le leasing automobile est un mode de financement qui vous permet de conduire un véhicule neuf ou d'occasion en échange de mensualités fixes, sans avoir à acheter le véhicule." },
    { question: "Quelles sont les conditions pour obtenir un leasing ?", answer: "Vous devez être résident suisse (permis C, B ou citoyen), avoir un emploi stable, et justifier de revenus suffisants." },
  ];
  const questions = cms.questions || defaultQuestions;

  return (
    <section id="faq" className="py-24 md:py-32 relative" data-testid="faq-section">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-4">
            Aide
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="faq-title">
            {cms.title || "QUESTIONS FRÉQUENTES"}
          </h2>
          <p className="font-inter text-base text-[#E6F7FF]/50 mt-3 max-w-lg mx-auto">
            {cms.subtitle || "Tout ce que vous devez savoir sur le leasing automobile"}
          </p>
        </motion.div>

        <div className="space-y-3">
          {questions.map((q, i) => (
            <FAQItem
              key={i}
              question={q.question}
              answer={q.answer}
              index={i}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
