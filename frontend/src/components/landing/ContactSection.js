import { useApp } from "@/App";
import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Instagram, ArrowUpRight } from "lucide-react";

export const ContactSection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.contact || {};

  const contactItems = [
    {
      icon: Phone,
      label: "Téléphone",
      value: cms.phone || "0799493229",
      href: `tel:${(cms.phone || "0799493229").replace(/\s/g, "")}`,
      testId: "contact-phone",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: cms.whatsapp || "0799493229",
      href: `https://wa.me/${(cms.whatsapp || "0799493229").replace(/\s/g, "").replace(/^0/, "41")}`,
      testId: "contact-whatsapp",
    },
    {
      icon: MapPin,
      label: "Localisation",
      value: cms.location || "Genève",
      href: null,
      testId: "contact-location",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@easyleazge",
      href: cms.instagram_url || "https://www.instagram.com/easyleazge?igsh=dnQ5ODBxcGthMWp2",
      testId: "contact-instagram",
    },
  ];

  return (
    <section id="contact" className="relative py-24 md:py-32" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left - Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#22D3EE]" />
              <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE]">
                Contact
              </span>
            </div>
            <h2 className="font-cinzel text-[#E6F7FF] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight uppercase" data-testid="contact-title">
              {cms.title || "Nous contacter"}
            </h2>
            <p className="text-[#E6F7FF]/55 text-base mt-4 leading-relaxed max-w-md">
              Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre projet de leasing automobile.
            </p>

            {/* Operating hours */}
            <div className="mt-8 glass-card rounded-xl p-6 inline-block border border-[#22D3EE]/10">
              <p className="text-[#E6F7FF]/45 text-xs uppercase tracking-wider mb-2">Horaires</p>
              <p className="text-[#E6F7FF] text-sm">Lundi - Dimanche</p>
              <p className="text-[#22D3EE] text-lg font-semibold">08:00 - 22:00</p>
            </div>
          </motion.div>

          {/* Right - Contact Items */}
          <div className="space-y-4">
            {contactItems.map((item, index) => (
              <motion.div
                key={item.label}
                data-testid={item.testId}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="glass-card flex items-center justify-between p-5 rounded-xl group border border-[#22D3EE]/10 hover:border-[#22D3EE]/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center">
                        <item.icon size={18} className="text-[#E6F7FF]/60 group-hover:text-[#22D3EE] transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="text-[#E6F7FF]/45 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                        <p className="text-[#E6F7FF] text-base mt-0.5 group-hover:text-[#67E8F9] transition-colors duration-300">{item.value}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-[#E6F7FF]/25 group-hover:text-[#22D3EE] transition-colors duration-300" />
                  </a>
                ) : (
                  <div className="glass-card flex items-center gap-4 p-5 rounded-xl border border-[#22D3EE]/10">
                    <div className="w-11 h-11 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center">
                      <item.icon size={18} className="text-[#E6F7FF]/60" />
                    </div>
                    <div>
                      <p className="text-[#E6F7FF]/45 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="text-[#E6F7FF] text-base mt-0.5">{item.value}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
