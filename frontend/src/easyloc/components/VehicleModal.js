import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays, ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import { mediaUrl } from "@/lib/mediaUrl";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/easyloc`;

export const VehicleModal = ({ vehicle, onClose }) => {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [step, setStep] = useState("dates");
  const [formData, setFormData] = useState({
    nom: "", prenom: "", telephone: "", email: "", message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [blockedDates, setBlockedDates] = useState([]);

  const gallery = (vehicle.images && vehicle.images.length > 0) ? vehicle.images : [vehicle.image];
  const nextImg = () => setCurrentImg((i) => (i + 1) % gallery.length);
  const prevImg = () => setCurrentImg((i) => (i - 1 + gallery.length) % gallery.length);

  // Fetch unavailable dates (approved reservations)
  useEffect(() => {
    let alive = true;
    axios.get(`${API}/vehicles/${vehicle.id}/unavailable-dates`)
      .then((res) => { if (alive) setBlockedDates(res.data || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [vehicle.id]);

  const isDateBlocked = (date) => {
    const iso = format(date, "yyyy-MM-dd");
    return blockedDates.includes(iso);
  };

  const days = dateRange.from && dateRange.to
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 0;

  // Pricing logic:
  // - 1-2 days → weekend price (Fri-Sun) using price_weekend per day
  // - 3-6 days → standard daily price (price_day)
  // - 7+ days → standard daily price - 30% (special offer)
  const isWeekendStay = days > 0 && days <= 2;
  const qualifiesForLongStay = days >= 7;
  const dailyRate = isWeekendStay ? vehicle.price_weekend : vehicle.price_day;
  const subtotal = days * dailyRate;
  const discount = qualifiesForLongStay ? Math.round(subtotal * 0.30) : 0;
  const totalPrice = subtotal - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateRange.from || !dateRange.to) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/reservations`, {
        ...formData,
        vehicule: vehicle.name,
        vehicle_id: vehicle.id,
        date_debut: format(dateRange.from, "yyyy-MM-dd"),
        date_fin: format(dateRange.to, "yyyy-MM-dd"),
      });
      setStep("success");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        data-testid="vehicle-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          data-testid="vehicle-modal"
        >
          {/* Header with Image carousel */}
          <div className="relative">
            <img
              src={mediaUrl(gallery[currentImg])}
              alt={`${vehicle.name} - photo ${currentImg + 1}`}
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/40 to-transparent" />

            {/* Carousel controls (only if multiple images) */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prevImg(); }}
                  aria-label="Image précédente"
                  data-testid="modal-img-prev"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0A0A0C]/60 backdrop-blur-sm rounded-full border border-[rgba(201,162,39,0.2)] flex items-center justify-center text-[#FAFAFA] hover:border-[rgba(201,162,39,0.5)] transition-colors duration-300"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); nextImg(); }}
                  aria-label="Image suivante"
                  data-testid="modal-img-next"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0A0A0C]/60 backdrop-blur-sm rounded-full border border-[rgba(201,162,39,0.2)] flex items-center justify-center text-[#FAFAFA] hover:border-[rgba(201,162,39,0.5)] transition-colors duration-300"
                >
                  <ChevronRight size={18} />
                </button>
                {/* Dots indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                      aria-label={`Aller à la photo ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentImg ? "w-6 bg-[#C9A227]" : "w-1.5 bg-[rgba(250,250,250,0.35)] hover:bg-[rgba(250,250,250,0.6)]"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Close Button */}
            <button
              data-testid="modal-close-button"
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-[#0A0A0C]/60 backdrop-blur-sm rounded-xl border border-[rgba(250,250,250,0.1)] flex items-center justify-center text-[#FAFAFA] hover:border-[rgba(201,162,39,0.3)] transition-colors duration-300"
            >
              <X size={18} />
            </button>

            {/* Vehicle Info */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-cinzel text-[#FAFAFA] text-xl font-semibold">{vehicle.name}</h3>
                  <p className="text-[rgba(250,250,250,0.6)] text-sm mt-1">{vehicle.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A227] text-xl font-semibold">CHF {vehicle.price_day}</p>
                  <p className="text-[rgba(250,250,250,0.5)] text-xs">/jour</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Step: Date Selection */}
            {step === "dates" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-[1px] bg-[#C9A227]" />
                  <span className="tag-gold text-[0.6rem]">Sélectionnez vos dates</span>
                </div>

                {/* Special offer reminder */}
                <div data-testid="modal-offer-banner" className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-[rgba(201,162,39,0.10)] to-[rgba(201,162,39,0.04)] border border-[rgba(201,162,39,0.25)]">
                  <span className="text-lg leading-none mt-0.5" aria-hidden>🎁</span>
                  <div>
                    <p className="text-[#C9A227] text-xs font-semibold uppercase tracking-[0.15em]">Offre spéciale</p>
                    <p className="text-[rgba(250,248,245,0.7)] text-[0.78rem] mt-0.5">Réservez 7 jours ou plus et bénéficiez automatiquement de <strong className="text-[#FAF8F5]">−30%</strong>.</p>
                  </div>
                </div>

                <div className="flex justify-center" data-testid="vehicle-calendar">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={1}
                    locale={fr}
                    disabled={[{ before: new Date() }, isDateBlocked]}
                    className="bg-[#0A0A0C] border border-[rgba(201,162,39,0.08)] rounded-xl p-4"
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
                      day_disabled: "text-[rgba(250,250,250,0.15)] cursor-not-allowed",
                      day_range_middle: "aria-selected:bg-[rgba(201,162,39,0.08)] aria-selected:text-[#FAFAFA]",
                      day_hidden: "invisible",
                    }}
                  />
                </div>

                {/* Price Estimate */}
                {days > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-[#0A0A0C] border border-[rgba(201,162,39,0.1)] rounded-xl p-5 space-y-3"
                    data-testid="price-estimate"
                  >
                    {/* Unlocked banner */}
                    {qualifiesForLongStay && (
                      <div data-testid="discount-unlocked" className="rounded-lg px-3 py-2 bg-gradient-to-r from-[#C9A227]/15 to-[#E8C547]/10 border border-[#C9A227]/35 text-center">
                        <p className="text-[#C9A227] text-[0.7rem] uppercase tracking-[0.2em] font-bold">🎉 Vous avez débloqué l'offre spéciale −30%</p>
                      </div>
                    )}

                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[rgba(250,250,250,0.4)] text-xs font-medium uppercase tracking-wider">Estimation</p>
                        <p className="text-[#FAFAFA] text-sm mt-1">
                          {format(dateRange.from, "dd MMM", { locale: fr })} - {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
                          <span className="text-[rgba(250,250,250,0.5)] ml-2">({days} jour{days > 1 ? "s" : ""})</span>
                        </p>
                      </div>
                      <div className="text-right">
                        {qualifiesForLongStay && (
                          <p className="text-[rgba(250,250,250,0.4)] text-xs line-through">CHF {subtotal}</p>
                        )}
                        <p className="text-[#C9A227] text-2xl font-bold leading-none">CHF {totalPrice}</p>
                        <p className="text-[rgba(250,250,250,0.4)] text-[0.65rem] mt-1">total estimé</p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="pt-3 border-t border-[rgba(201,162,39,0.1)] space-y-1.5 text-[0.78rem]">
                      <div className="flex justify-between text-[rgba(250,250,250,0.6)]">
                        <span>Prix journalier {isWeekendStay ? "(week-end)" : ""}</span>
                        <span className="text-[#FAFAFA]">CHF {dailyRate}</span>
                      </div>
                      <div className="flex justify-between text-[rgba(250,250,250,0.6)]">
                        <span>Durée</span>
                        <span className="text-[#FAFAFA]">{days} jour{days > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex justify-between text-[rgba(250,250,250,0.6)]">
                        <span>Sous-total</span>
                        <span className="text-[#FAFAFA]">CHF {subtotal}</span>
                      </div>
                      {qualifiesForLongStay && (
                        <div className="flex justify-between text-[#C9A227]" data-testid="discount-line">
                          <span>Remise −30% (7 jours et +)</span>
                          <span>− CHF {discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1.5 mt-1 border-t border-[rgba(201,162,39,0.12)] font-semibold">
                        <span className="text-[rgba(250,250,250,0.8)]">Total</span>
                        <span className="text-[#C9A227]">CHF {totalPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  data-testid="modal-continue-to-form"
                  onClick={() => setStep("form")}
                  disabled={days === 0}
                  className={`w-full mt-6 flex items-center justify-center gap-2 py-3.5 text-xs tracking-wider uppercase transition-all duration-300 rounded-xl font-semibold ${
                    days > 0
                      ? "btn-gold"
                      : "bg-[rgba(250,250,250,0.05)] text-[rgba(250,250,250,0.3)] cursor-not-allowed border border-[rgba(250,250,250,0.05)]"
                  }`}
                >
                  Continuer <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Step: Form */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="reservation-modal-form">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-[1px] bg-[#C9A227]" />
                  <span className="tag-gold text-[0.6rem]">Vos informations</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[rgba(250,250,250,0.5)] text-xs font-medium block mb-1.5">Prénom</label>
                    <input
                      data-testid="modal-prenom-input"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="input-gold"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-[rgba(250,250,250,0.5)] text-xs font-medium block mb-1.5">Nom</label>
                    <input
                      data-testid="modal-nom-input"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="input-gold"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[rgba(250,250,250,0.5)] text-xs font-medium block mb-1.5">Email</label>
                  <input
                    data-testid="modal-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-gold"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-[rgba(250,250,250,0.5)] text-xs font-medium block mb-1.5">Téléphone</label>
                  <input
                    data-testid="modal-telephone-input"
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="input-gold"
                    placeholder="+41 79 123 45 67"
                  />
                </div>

                <div>
                  <label className="text-[rgba(250,250,250,0.5)] text-xs font-medium block mb-1.5">Message (optionnel)</label>
                  <textarea
                    data-testid="modal-message-input"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-gold resize-none"
                    placeholder="Informations complémentaires..."
                  />
                </div>

                {/* Summary */}
                <div className="bg-[#0A0A0C] border border-[rgba(201,162,39,0.1)] rounded-xl p-4">
                  <p className="text-[rgba(250,250,250,0.5)] text-xs mb-1">Récapitulatif</p>
                  <p className="text-[#FAFAFA] text-sm">
                    <span className="font-medium">{vehicle.name}</span>
                    <span className="text-[rgba(250,250,250,0.5)]"> · </span>
                    {dateRange.from && format(dateRange.from, "dd/MM")} - {dateRange.to && format(dateRange.to, "dd/MM/yyyy")}
                    <span className="text-[rgba(250,250,250,0.5)]"> · </span>
                    <span className="text-[#C9A227] font-medium">~CHF {totalPrice}</span>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("dates")}
                    className="btn-outline-gold flex-1 py-3 text-xs"
                  >
                    Retour
                  </button>
                  <button
                    data-testid="modal-submit-reservation"
                    type="submit"
                    disabled={submitting}
                    className="btn-gold flex-1 py-3 text-xs"
                  >
                    {submitting ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            )}

            {/* Step: Success */}
            {step === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
                data-testid="reservation-success"
              >
                <div className="w-20 h-20 rounded-2xl bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.25)] flex items-center justify-center mx-auto mb-6">
                  <Check className="text-[#C9A227]" size={32} />
                </div>
                <h3 className="font-cinzel text-[#FAFAFA] text-2xl font-semibold mb-3">Merci de votre confiance !</h3>
                <p className="text-[rgba(250,250,250,0.7)] text-sm leading-relaxed max-w-sm mx-auto">
                  Nous avons bien reçu votre demande de réservation. Notre équipe va l'analyser et reviendra vers vous dans les plus brefs délais.
                </p>
                <p className="text-[rgba(250,250,250,0.5)] text-xs leading-relaxed max-w-sm mx-auto mt-3">
                  Nous restons à votre disposition pour toute question.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                  <a
                    href="/easyloc"
                    data-testid="success-home-btn"
                    className="btn-gold px-8 inline-flex items-center justify-center gap-2"
                  >
                    <span aria-hidden>🏠</span> Revenir à l'accueil
                  </a>
                  <button
                    data-testid="modal-close-success"
                    onClick={onClose}
                    className="btn-outline-gold px-8"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
