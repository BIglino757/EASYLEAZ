import { useState } from "react";
import { useApp } from "@/App";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import axios from "axios";

export const LeasingFormSection = () => {
  const { cmsData, API } = useApp();
  const cms = cmsData?.leasing_form || {};
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    income: "",
    professional_status: "",
    desired_vehicle: "",
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/leasing-requests`, form);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="demande" className="py-24 md:py-32 relative" data-testid="leasing-form-success">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/20 to-[#071A1F]" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-12"
          >
            <div className="w-20 h-20 rounded-full bg-[#22D3EE]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-[#22D3EE]" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-[#E6F7FF] uppercase tracking-wide mb-3">
              Demande envoyée
            </h3>
            <p className="font-inter text-[#E6F7FF]/60">
              Merci ! Notre équipe vous contactera dans les plus brefs délais.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="demande" className="py-24 md:py-32 relative" data-testid="leasing-form-section">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/20 to-[#071A1F]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="font-inter text-xs font-bold tracking-[0.25em] uppercase text-[#22D3EE] block mb-4">
            Votre projet
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#E6F7FF]" data-testid="leasing-form-title">
            {cms.title || "FAITES VOTRE DEMANDE DE LEASING"}
          </h2>
          <p className="font-inter text-base text-[#E6F7FF]/50 mt-3 max-w-lg mx-auto">
            {cms.subtitle || "En quelques minutes, soumettez votre dossier et recevez une réponse rapide."}
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-8 md:p-10 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          data-testid="leasing-form"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Prénom</Label>
              <Input
                required
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                placeholder="Votre prénom"
                className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 focus:ring-[#22D3EE]/20 h-12 rounded-xl"
                data-testid="form-first-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Nom</Label>
              <Input
                required
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                placeholder="Votre nom"
                className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 focus:ring-[#22D3EE]/20 h-12 rounded-xl"
                data-testid="form-last-name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Téléphone</Label>
              <Input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+41 79 XXX XX XX"
                className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 focus:ring-[#22D3EE]/20 h-12 rounded-xl"
                data-testid="form-phone"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Email</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="votre@email.com"
                className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 focus:ring-[#22D3EE]/20 h-12 rounded-xl"
                data-testid="form-email"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Revenus annuels</Label>
              <Select value={form.income} onValueChange={(v) => handleChange("income", v)}>
                <SelectTrigger className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-12 rounded-xl" data-testid="form-income">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="< 50'000 CHF">Moins de 50'000 CHF</SelectItem>
                  <SelectItem value="50'000 - 80'000 CHF">50'000 - 80'000 CHF</SelectItem>
                  <SelectItem value="80'000 - 120'000 CHF">80'000 - 120'000 CHF</SelectItem>
                  <SelectItem value="> 120'000 CHF">Plus de 120'000 CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Situation professionnelle</Label>
              <Select value={form.professional_status} onValueChange={(v) => handleChange("professional_status", v)}>
                <SelectTrigger className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-12 rounded-xl" data-testid="form-status">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="Salarié">Salarié</SelectItem>
                  <SelectItem value="Indépendant">Indépendant</SelectItem>
                  <SelectItem value="Fonctionnaire">Fonctionnaire</SelectItem>
                  <SelectItem value="Retraité">Retraité</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-inter text-sm text-[#E6F7FF]/70 tracking-wide">Véhicule souhaité</Label>
            <Input
              value={form.desired_vehicle}
              onChange={(e) => handleChange("desired_vehicle", e.target.value)}
              placeholder="Ex: Porsche 911, Mercedes AMG GT..."
              className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 focus:ring-[#22D3EE]/20 h-12 rounded-xl"
              data-testid="form-vehicle"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-easyleaz w-full py-4 rounded-full text-base font-semibold tracking-wide flex items-center justify-center gap-2 mt-4"
            data-testid="leasing-submit-button"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Envoyer ma demande
              </>
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
};
