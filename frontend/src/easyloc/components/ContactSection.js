import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Instagram, ArrowUpRight } from "lucide-react";

export const ContactSection = ({ content }) => {
  const contactItems = [
    {
      icon: Phone,
      label: "Téléphone",
      value: content?.phone || "079 949 32 29",
      href: `tel:${(content?.phone || "079 949 32 29").replace(/\s/g, "")}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: content?.whatsapp || "079 949 32 29",
      href: `https://wa.me/41${(content?.whatsapp || "079 949 32 29").replace(/\s/g, "").replace(/^0/, "")}`,
    },
    {
      icon: MapPin,
      label: "Localisation",
      value: content?.location || "Genève",
      href: null,
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@easylocge",
      href: content?.instagram || "https://www.instagram.com/easylocge",
    },
  ];

  return (
    <section id="contact" className="relative py-24 md:py-32" data-testid="contact-section">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left - Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="gold-line" />
              <span className="tag-gold">Contact</span>
            </div>
            <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Nous contacter
            </h2>
            <p className="text-[rgba(250,248,245,0.55)] text-base mt-4 leading-relaxed max-w-md">
              Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre choix de véhicule.
            </p>

            {/* Operating hours */}
            <div className="mt-8 glass-card rounded-xl p-6 inline-block">
              <p className="text-[rgba(250,248,245,0.45)] text-xs uppercase tracking-wider mb-2">Horaires</p>
              <p className="text-[#FAF8F5] text-sm">Lundi - Dimanche</p>
              <p className="text-[#C9A227] text-lg font-semibold">08:00 - 22:00</p>
            </div>
          </motion.div>

          {/* Right - Contact Items */}
          <div className="space-y-4">
            {contactItems.map((item, index) => (
              <motion.div
                key={index}
                data-testid={`contact-item-${item.label.toLowerCase()}`}
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
                    className="glass-card glass-card-glow flex items-center justify-between p-5 rounded-xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.12)] flex items-center justify-center">
                        <item.icon size={18} className="text-[rgba(250,248,245,0.6)] group-hover:text-[#C9A227] transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="text-[rgba(250,248,245,0.45)] text-xs font-medium uppercase tracking-wider">{item.label}</p>
                        <p className="text-[#FAF8F5] text-base mt-0.5 group-hover:text-[#D4AF37] transition-colors duration-300">{item.value}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-[rgba(250,248,245,0.25)] group-hover:text-[#C9A227] transition-colors duration-300" />
                  </a>
                ) : (
                  <div className="glass-card flex items-center gap-4 p-5 rounded-xl">
                    <div className="w-11 h-11 rounded-xl bg-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.12)] flex items-center justify-center">
                      <item.icon size={18} className="text-[rgba(250,248,245,0.6)]" />
                    </div>
                    <div>
                      <p className="text-[rgba(250,248,245,0.45)] text-xs font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="text-[#FAF8F5] text-base mt-0.5">{item.value}</p>
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
