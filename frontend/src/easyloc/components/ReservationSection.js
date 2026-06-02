import { useState } from "react";
import { motion } from "framer-motion";
import { Send, ArrowRight } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/easyloc`;

export const ReservationSection = ({ content, vehicles }) => {
  const embedUrl = content?.embed_url;

  const [formData, setFormData] = useState({
    nom: "", prenom: "", telephone: "", email: "", vehicule: "", date_debut: "", date_fin: "", message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/reservations`, formData);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (embedUrl) {
    return (
      <section id="reservation" className="relative py-24 md:py-32" data-testid="reservation-section">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4 justify-center">
              <span className="gold-line" style={{ transform: 'rotate(180deg)' }} />
              <span className="tag-gold">Réservation</span>
              <span className="gold-line" />
            </div>
            <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold">
              {content?.title || "Faire une demande de réservation"}
            </h2>
          </motion.div>
          <div className="glass-card rounded-2xl p-2 max-w-4xl mx-auto min-h-[500px]">
            <iframe
              src={embedUrl}
              title="Reservation form"
              className="w-full min-h-[500px] border-0 rounded-xl"
              style={{ background: "transparent" }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservation" className="relative py-24 md:py-32" data-testid="reservation-section">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="gold-line" />
              <span className="tag-gold">Réservation</span>
            </div>
            <h2 className="font-cinzel text-[#FAF8F5] text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              {content?.title || "Faire une demande de réservation"}
            </h2>
            <p className="text-[rgba(250,248,245,0.55)] text-base mt-5 leading-relaxed max-w-md">
              {content?.subtitle || "Remplissez le formulaire ci-dessous et nous vous recontacterons dans les plus brefs délais."}
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-4">
              {[
                "Réponse garantie sous 30 minutes",
                "Conseiller dédié à votre disposition",
                "Livraison et récupération sur mesure"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                  <span className="text-[rgba(250,248,245,0.6)] text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Decorative image */}
            <div className="mt-10 hidden lg:block">
              <div className="glass-card rounded-2xl overflow-hidden">
                <img
                  src="/sections/a35-wheel.jpeg"
                  alt="Véhicule premium"
                  className="w-full h-48 object-cover opacity-60"
                />
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {submitted ? (
              <div className="glass-card rounded-2xl p-12 text-center" data-testid="reservation-form-success">
                <div className="w-20 h-20 rounded-2xl bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.25)] flex items-center justify-center mx-auto mb-6">
                  <Send className="text-[#C9A227]" size={32} />
                </div>
                <h3 className="font-cinzel text-[#FAF8F5] text-2xl font-semibold mb-3">Merci de votre confiance !</h3>
                <p className="text-[rgba(250,248,245,0.7)] text-sm leading-relaxed">
                  Nous avons bien reçu votre demande. Notre équipe va l'analyser et reviendra vers vous dans les plus brefs délais.
                </p>
                <p className="text-[rgba(250,248,245,0.5)] text-xs leading-relaxed mt-3">
                  Nous restons à votre disposition pour toute question.
                </p>
                <a
                  href="/easyloc"
                  data-testid="reservation-success-home-btn"
                  className="btn-gold inline-flex items-center justify-center gap-2 mt-8 px-8"
                >
                  <span aria-hidden>🏠</span> Revenir à l'accueil
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8" data-testid="reservation-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Prénom</label>
                    <input 
                      data-testid="form-prenom" 
                      required 
                      value={formData.prenom} 
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} 
                      className="input-gold" 
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Nom</label>
                    <input 
                      data-testid="form-nom" 
                      required 
                      value={formData.nom} 
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                      className="input-gold" 
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Email</label>
                  <input 
                    data-testid="form-email" 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="input-gold" 
                    placeholder="john@example.com"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Téléphone</label>
                  <input 
                    data-testid="form-telephone" 
                    type="tel" 
                    required 
                    value={formData.telephone} 
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} 
                    className="input-gold" 
                    placeholder="+41 79 123 45 67"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Véhicule souhaité</label>
                  <select 
                    data-testid="form-vehicule" 
                    required 
                    value={formData.vehicule} 
                    onChange={(e) => setFormData({ ...formData, vehicule: e.target.value })} 
                    className="input-gold appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionnez un véhicule</option>
                    {vehicles?.map(v => (
                      <option key={v.id} value={v.name}>{v.name} - CHF {v.price_day}/jour</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Date début</label>
                    <input 
                      data-testid="form-date-debut" 
                      type="date" 
                      required 
                      value={formData.date_debut} 
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })} 
                      className="input-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Date fin</label>
                    <input 
                      data-testid="form-date-fin" 
                      type="date" 
                      required 
                      value={formData.date_fin} 
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })} 
                      className="input-gold"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Message (optionnel)</label>
                  <textarea 
                    data-testid="form-message" 
                    rows={3} 
                    value={formData.message} 
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                    className="input-gold resize-none"
                    placeholder="Informations complémentaires..."
                  />
                </div>

                <button 
                  data-testid="form-submit-button" 
                  type="submit" 
                  disabled={submitting} 
                  className="btn-gold w-full mt-6 py-4 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#080705]/30 border-t-[#080705] rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer la demande
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
