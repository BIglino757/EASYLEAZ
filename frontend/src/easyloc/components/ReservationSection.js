import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, ArrowRight, CalendarDays } from "lucide-react";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/easyloc`;

export const ReservationSection = ({ content, vehicles }) => {
  const embedUrl = content?.embed_url;

  const [formData, setFormData] = useState({
    nom: "", prenom: "", telephone: "", email: "", vehicule: "", date_debut: "", date_fin: "", message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [blockedDates, setBlockedDates] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch unavailable dates for the selected vehicle (same source as VehicleModal)
  useEffect(() => {
    const selectedVehicle = vehicles?.find((v) => v.name === formData.vehicule);
    if (!selectedVehicle?.id) {
      setBlockedDates([]);
      return;
    }
    let alive = true;
    axios
      .get(`${API}/vehicles/${selectedVehicle.id}/unavailable-dates`)
      .then((res) => { if (alive) setBlockedDates(res.data || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [formData.vehicule, vehicles]);

  const isDateBlocked = (date) => {
    const iso = format(date, "yyyy-MM-dd");
    return blockedDates.includes(iso);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateRange.from || !dateRange.to) return;
    setSubmitting(true);
    try {
      const selectedVehicle = vehicles?.find((v) => v.name === formData.vehicule);
      await axios.post(`${API}/reservations`, {
        ...formData,
        vehicle_id: selectedVehicle?.id || "",
        date_debut: format(dateRange.from, "yyyy-MM-dd"),
        date_fin: format(dateRange.to, "yyyy-MM-dd"),
      });
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

                <div className="mt-4">
                  <label className="text-[rgba(250,248,245,0.55)] text-xs font-medium block mb-2">Dates de location</label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        data-testid="form-dates-trigger"
                        disabled={!formData.vehicule}
                        className={`input-gold w-full flex items-center justify-between text-left ${dateRange.from ? "text-[#FAF8F5]" : "text-[rgba(250,248,245,0.45)]"} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-[#C9A227]" />
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, "dd MMM", { locale: fr })} → ${format(dateRange.to, "dd MMM yyyy", { locale: fr })}`
                            : dateRange.from
                            ? `${format(dateRange.from, "dd MMM yyyy", { locale: fr })} — sélectionnez la fin`
                            : (formData.vehicule ? "Choisissez vos dates" : "Sélectionnez d'abord un véhicule")}
                        </span>
                        <ArrowRight size={14} className="text-[rgba(250,248,245,0.4)]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="p-0 bg-[#0A0A0C] border border-[rgba(201,162,39,0.2)] rounded-xl shadow-2xl"
                      data-testid="form-dates-calendar"
                    >
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          const r = range || { from: undefined, to: undefined };
                          setDateRange(r);
                          if (r.from && r.to) setCalendarOpen(false);
                        }}
                        numberOfMonths={1}
                        locale={fr}
                        disabled={[{ before: new Date() }, isDateBlocked]}
                        className="bg-[#0A0A0C] border-none rounded-xl p-4"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium text-[#FAFAFA] font-cinzel",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-8 w-8 bg-transparent p-0 text-[rgba(250,250,250,0.5)] hover:text-[#FAFAFA] border border-[rgba(201,162,39,0.1)] hover:border-[rgba(201,162,39,0.3)] rounded-lg transition-all duration-200 inline-flex items-center justify-center",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-[rgba(250,250,250,0.4)] w-9 font-normal text-[0.7rem] uppercase",
                          row: "flex w-full mt-2",
                          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[rgba(201,162,39,0.1)] [&:has([aria-selected])]:rounded-md",
                          day: "h-9 w-9 p-0 font-normal text-[#FAFAFA] hover:bg-[rgba(201,162,39,0.1)] rounded-md transition-colors duration-150 inline-flex items-center justify-center cursor-pointer border-0 bg-transparent",
                          day_range_start: "day-range-start",
                          day_range_end: "day-range-end",
                          day_selected: "bg-[#C9A227] text-[#0A0A0C] hover:bg-[#C9A227] hover:text-[#0A0A0C] focus:bg-[#C9A227] focus:text-[#0A0A0C] rounded-md font-medium",
                          day_today: "border border-[rgba(201,162,39,0.3)] text-[#FAFAFA]",
                          day_outside: "text-[rgba(250,250,250,0.2)]",
                          day_disabled: "text-[rgba(250,250,250,0.15)] cursor-not-allowed line-through",
                          day_range_middle: "aria-selected:bg-[rgba(201,162,39,0.08)] aria-selected:text-[#FAFAFA]",
                          day_hidden: "invisible",
                        }}
                      />
                      {dateRange.from && (
                        <div className="px-4 pb-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => { setDateRange({ from: undefined, to: undefined }); setCalendarOpen(false); }}
                            className="text-[rgba(250,248,245,0.5)] hover:text-[#C9A227] text-[0.7rem] uppercase tracking-wider transition-colors"
                          >
                            Réinitialiser
                          </button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
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
                  disabled={submitting || !dateRange.from || !dateRange.to} 
                  className="btn-gold w-full mt-6 py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
