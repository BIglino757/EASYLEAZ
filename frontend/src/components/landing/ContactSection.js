import { useApp } from "@/App";
import { motion } from "framer-motion";
import { Phone, MapPin, Instagram, MessageCircle } from "lucide-react";

export const ContactSection = () => {
  const { cmsData } = useApp();
  const cms = cmsData?.contact || {};

  const contacts = [
    {
      icon: Phone,
      label: "Téléphone",
      value: cms.phone || "0799493229",
      href: `tel:${(cms.phone || "0799493229").replace(/\s/g, "")}`,
      testId: "contact-phone",
    },
    {
      icon: MapPin,
      label: "Localisation",
      value: cms.location || "Genève",
      href: `https://maps.google.com/?q=${cms.location || "Genève"}`,
      testId: "contact-location",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@easyleazge",
      href: cms.instagram_url || "https://www.instagram.com/easyleazge?igsh=dnQ5ODBxcGthMWp2",
      testId: "contact-instagram",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: cms.whatsapp || "0799493229",
      href: `https://wa.me/${(cms.whatsapp || "0799493229").replace(/\s/g, "")}`,
      testId: "contact-whatsapp",
    },
  ];

  return (
    <section id="contact" className="py-24 md:py-32 relative" data-testid="contact-section">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/20 to-[#071A1F]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-4">
            Restons en contact
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="contact-title">
            {cms.title || "CONTACTEZ-NOUS"}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <motion.a
                key={contact.label}
                href={contact.href}
                target={contact.label === "Instagram" || contact.label === "WhatsApp" ? "_blank" : undefined}
                rel={contact.label === "Instagram" || contact.label === "WhatsApp" ? "noopener noreferrer" : undefined}
                className="glass-card glass-card-hover rounded-2xl p-8 flex flex-col items-center text-center group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                data-testid={contact.testId}
              >
                <div className="w-16 h-16 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center mb-5 group-hover:border-[#22D3EE]/40 transition-colors duration-300">
                  <Icon size={24} className="text-[#22D3EE]" />
                </div>
                <span className="font-inter text-xs font-bold tracking-[0.2em] uppercase text-[#22D3EE] mb-2">
                  {contact.label}
                </span>
                <span className="font-inter text-base text-[#E6F7FF]/80 group-hover:text-[#E6F7FF] transition-colors duration-300">
                  {contact.value}
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
