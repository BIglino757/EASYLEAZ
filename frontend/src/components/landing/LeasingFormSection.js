import { useState, useRef, useEffect } from "react";
import { useApp } from "@/App";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Send, Loader2, Upload, X, FileText, ChevronDown, Home, Car, ArrowRight } from "lucide-react";
import axios from "axios";

const inputClass = "bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 focus:ring-[#22D3EE]/20 h-12 rounded-xl";
const labelClass = "font-inter text-sm text-[#E6F7FF]/70 tracking-wide";

export const LeasingFormSection = () => {
  const { cmsData, API } = useApp();
  const cms = cmsData?.leasing_form || {};
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const identityRef = useRef(null);
  const salaryRef = useRef(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    monthly_income: "",
    professional_status: "",
    desired_vehicle: "",
    marital_status: "",
    nationality: "",
    birth_date: "",
    address: "",
    address_since_date: "",
    residence_permit: "",
    children_count: "",
    children_ages: "",
    housing_cost: "",
    housing_status: "",
    employment_date: "",
  });

  // Auto-open + pre-fill vehicle if redirected from catalogue with ?vehicle=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get("vehicle");
    if (v) {
      setForm((p) => ({ ...p, desired_vehicle: v }));
      setFormOpen(true);
      // Scroll to form
      setTimeout(() => {
        const el = document.getElementById("demande");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [location.search]);

  const [identityFile, setIdentityFile] = useState(null);
  const [salaryFiles, setSalaryFiles] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Requis";
    if (!form.last_name.trim()) e.last_name = "Requis";
    if (!form.phone.trim()) e.phone = "Requis";
    if (!form.email.trim()) e.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format invalide";
    if (!form.marital_status) e.marital_status = "Requis";
    if (!form.nationality.trim()) e.nationality = "Requis";
    if (!form.birth_date) e.birth_date = "Requis";
    if (!form.address.trim()) e.address = "Requis";
    if (!form.address_since_date) e.address_since_date = "Requis";
    if (!form.residence_permit) e.residence_permit = "Requis";
    if (!form.children_count) e.children_count = "Requis";
    if (form.children_count && form.children_count !== "0" && !form.children_ages.trim()) e.children_ages = "Précisez l'âge des enfants";
    if (!form.housing_cost.trim()) e.housing_cost = "Requis";
    if (!form.housing_status) e.housing_status = "Requis";
    if (!form.employment_date) e.employment_date = "Requis";
    if (!form.monthly_income.trim()) e.monthly_income = "Requis";
    if (!form.professional_status) e.professional_status = "Requis";
    if (!form.desired_vehicle.trim()) e.desired_vehicle = "Requis";
    if (!identityFile) e.identity = "Pièce d'identité requise";
    if (salaryFiles.length === 0) e.salary = "Fiches de paie requises";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) return "Format non accepté (PDF, JPG, PNG)";
    if (file.size > 5 * 1024 * 1024) return "Fichier trop volumineux (max 5MB)";
    return null;
  };

  const handleIdentityFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrors(prev => ({ ...prev, identity: err })); return; }
    setIdentityFile(file);
    setErrors(prev => ({ ...prev, identity: null }));
  };

  const handleSalaryFiles = (e) => {
    const files = Array.from(e.target.files);
    const valid = [];
    for (const f of files) {
      const err = validateFile(f);
      if (err) { setErrors(prev => ({ ...prev, salary: err })); return; }
      valid.push(f);
    }
    setSalaryFiles(prev => [...prev, ...valid]);
    setErrors(prev => ({ ...prev, salary: null }));
  };

  const removeSalaryFile = (idx) => {
    setSalaryFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (identityFile) formData.append("identity_document", identityFile);
      salaryFiles.forEach(f => formData.append("salary_slips", f));
      await axios.post(`${API}/leads`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err.response?.data?.detail || "Erreur lors de l'envoi";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="demande" className="py-24 md:py-32 relative min-h-[80vh] flex items-center" data-testid="leasing-form-success">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A1F] via-[#0E2F36]/30 to-[#071A1F]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #22D3EE 0%, transparent 50%), radial-gradient(circle at 75% 75%, #22D3EE 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl p-8 md:p-14 relative overflow-hidden"
          >
            {/* Gold accent */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/60 to-transparent" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => { setSubmitted(false); window.location.href = "/"; }}
              aria-label="Fermer"
              data-testid="leasing-success-close-btn"
              className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[#22D3EE]/20 hover:border-[#22D3EE]/60 bg-[#0E2F36]/40 hover:bg-[#22D3EE]/10 text-[#E6F7FF]/60 hover:text-[#22D3EE] transition-all duration-300 flex items-center justify-center"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22D3EE]/25 to-[#22D3EE]/5 border border-[#22D3EE]/40 flex items-center justify-center mb-7 shadow-[0_0_60px_rgba(34,211,238,0.25)]"
              >
                <CheckCircle size={44} className="text-[#22D3EE]" strokeWidth={1.6} />
              </motion.div>

              <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-[#E6F7FF] uppercase tracking-wide leading-tight">
                Demande reçue avec <span className="text-[#22D3EE]">succès</span>
              </h1>

              <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/40 to-transparent mt-6" />

              <p className="font-inter text-base md:text-lg text-[#E6F7FF]/80 leading-relaxed mt-6 max-w-xl">
                Nous avons bien reçu votre demande !
              </p>
              <p className="font-inter text-sm md:text-base text-[#E6F7FF]/60 leading-relaxed mt-3 max-w-xl">
                Un conseiller prendra contact avec vous dans un délai de <strong className="text-[#E6F7FF]/90">24 à 48 heures</strong> afin de vous accompagner dans la suite de votre dossier.
              </p>
              <p className="font-inter text-sm md:text-base text-[#22D3EE] leading-relaxed mt-4 tracking-wide">
                Nous vous remercions pour votre confiance !
              </p>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 w-full max-w-2xl">
                <a
                  href="/"
                  data-testid="success-home-btn"
                  className="group flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-[#071A1F] text-[0.78rem] font-bold uppercase tracking-[0.12em] transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:-translate-y-0.5"
                >
                  <Home size={14} /> Retour à l'accueil
                </a>
                <a
                  href="/catalogue"
                  data-testid="success-catalog-btn"
                  className="group flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-[#22D3EE]/40 hover:border-[#22D3EE] bg-[#0E2F36]/30 hover:bg-[#22D3EE]/10 text-[#E6F7FF] hover:text-[#22D3EE] text-[0.78rem] font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Car size={14} /> Voir le catalogue
                </a>
                <a
                  href="/easyloc"
                  data-testid="success-easyloc-btn"
                  className="group flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-[#C9A227]/40 hover:border-[#C9A227] bg-[#0C0A07]/40 hover:bg-[#C9A227]/10 text-[#C9A227] hover:text-[#E8C547] text-[0.78rem] font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Basculer vers EasyLoc <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const FieldError = ({ field }) => errors[field] ? <span className="font-inter text-xs text-red-400 mt-1">{errors[field]}</span> : null;

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

          {/* CTA to open the form (mobile-friendly accordion) */}
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            aria-expanded={formOpen}
            aria-controls="leasing-form-panel"
            data-testid="leasing-form-toggle"
            className="mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5B7] hover:from-[#0EA5B7] hover:to-[#0891A3] text-[#071A1F] font-semibold tracking-wide uppercase text-sm transition-all duration-300 shadow-[0_4px_30px_-8px_rgba(34,211,238,0.5)] hover:shadow-[0_8px_40px_-8px_rgba(34,211,238,0.7)]"
          >
            {formOpen ? "Fermer le formulaire" : (cms.cta_open || "Remplir ma demande")}
            <ChevronDown size={18} className={`transition-transform duration-300 ${formOpen ? "rotate-180" : ""}`} />
          </button>
        </motion.div>

        <AnimatePresence initial={false}>
          {formOpen && (
            <motion.div
              key="leasing-form-panel"
              id="leasing-form-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >

        <motion.form
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-8 md:p-10 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          data-testid="leasing-form"
        >
          {/* Section: Informations personnelles */}
          <div className="space-y-1 mb-2">
            <h3 className="font-cinzel text-sm font-semibold text-[#22D3EE] uppercase tracking-[0.15em]">Informations personnelles</h3>
            <div className="h-px bg-[#22D3EE]/10" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Prénom *</Label>
              <Input value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} placeholder="Votre prénom" className={inputClass} data-testid="form-first-name" />
              <FieldError field="first_name" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Nom *</Label>
              <Input value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} placeholder="Votre nom" className={inputClass} data-testid="form-last-name" />
              <FieldError field="last_name" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Téléphone *</Label>
              <Input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+41 79 XXX XX XX" className={inputClass} data-testid="form-phone" />
              <FieldError field="phone" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="votre@email.com" className={inputClass} data-testid="form-email" />
              <FieldError field="email" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Date de naissance *</Label>
              <Input type="date" value={form.birth_date} onChange={(e) => handleChange("birth_date", e.target.value)} className={inputClass} data-testid="form-birth-date" />
              <FieldError field="birth_date" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Nationalité *</Label>
              <Input value={form.nationality} onChange={(e) => handleChange("nationality", e.target.value)} placeholder="Ex: Suisse, Française..." className={inputClass} data-testid="form-nationality" />
              <FieldError field="nationality" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>État civil *</Label>
              <Select value={form.marital_status} onValueChange={(v) => handleChange("marital_status", v)}>
                <SelectTrigger className={inputClass} data-testid="form-marital-status"><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="Célibataire">Célibataire</SelectItem>
                  <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                  <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                  <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
                  <SelectItem value="Pacsé(e)">Pacsé(e)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="marital_status" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Nombre d'enfants *</Label>
              <Select value={form.children_count} onValueChange={(v) => handleChange("children_count", v)}>
                <SelectTrigger className={inputClass} data-testid="form-children-count"><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4 ou plus</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="children_count" />
            </div>
          </div>

          {/* Children ages (only shown if at least 1 child) */}
          {form.children_count && form.children_count !== "0" && (
            <div className="space-y-2">
              <Label className={labelClass}>Âge des enfants *</Label>
              <Input value={form.children_ages} onChange={(e) => handleChange("children_ages", e.target.value)} placeholder="Ex: 4 ans, 8 ans, 12 ans" className={inputClass} data-testid="form-children-ages" />
              <FieldError field="children_ages" />
            </div>
          )}

          <div className="space-y-2">
            <Label className={labelClass}>Adresse de domicile complète *</Label>
            <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Rue, numéro, code postal, ville" className={inputClass} data-testid="form-address" />
            <FieldError field="address" />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>À cette adresse depuis (mois / année) *</Label>
            <Input type="month" value={form.address_since_date} onChange={(e) => handleChange("address_since_date", e.target.value)} className={inputClass} data-testid="form-address-since" />
            <FieldError field="address_since_date" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Permis de séjour *</Label>
              <Select value={form.residence_permit} onValueChange={(v) => handleChange("residence_permit", v)}>
                <SelectTrigger className={inputClass} data-testid="form-residence-permit"><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="Citoyen suisse">Citoyen suisse</SelectItem>
                  <SelectItem value="Permis C">Permis C</SelectItem>
                  <SelectItem value="Permis B">Permis B</SelectItem>
                  <SelectItem value="Permis L">Permis L</SelectItem>
                  <SelectItem value="Permis G">Permis G (frontalier)</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="residence_permit" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Situation du logement *</Label>
              <Select value={form.housing_status} onValueChange={(v) => handleChange("housing_status", v)}>
                <SelectTrigger className={inputClass} data-testid="form-housing-status"><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="Propriétaire">Propriétaire</SelectItem>
                  <SelectItem value="Locataire">Locataire</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="housing_status" />
            </div>
          </div>

          {/* Section: Situation financière */}
          <div className="space-y-1 mb-2 pt-4">
            <h3 className="font-cinzel text-sm font-semibold text-[#22D3EE] uppercase tracking-[0.15em]">Situation financière</h3>
            <div className="h-px bg-[#22D3EE]/10" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Revenus mensuels bruts (CHF) *</Label>
              <Input type="number" min="0" value={form.monthly_income} onChange={(e) => handleChange("monthly_income", e.target.value)} placeholder="Ex: 6500" className={inputClass} data-testid="form-monthly-income" />
              <FieldError field="monthly_income" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Situation professionnelle *</Label>
              <Select value={form.professional_status} onValueChange={(v) => handleChange("professional_status", v)}>
                <SelectTrigger className={inputClass} data-testid="form-status"><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                  <SelectItem value="Salarié">Salarié</SelectItem>
                  <SelectItem value="Indépendant">Indépendant</SelectItem>
                  <SelectItem value="Fonctionnaire">Fonctionnaire</SelectItem>
                  <SelectItem value="Retraité">Retraité</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="professional_status" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Coût mensuel du logement (CHF) *</Label>
              <Input type="number" value={form.housing_cost} onChange={(e) => handleChange("housing_cost", e.target.value)} placeholder="Ex: 1500" className={inputClass} data-testid="form-housing-cost" />
              <FieldError field="housing_cost" />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Date d'embauche (mois/année) *</Label>
              <Input type="month" value={form.employment_date} onChange={(e) => handleChange("employment_date", e.target.value)} className={inputClass} data-testid="form-employment-date" />
              <FieldError field="employment_date" />
            </div>
          </div>

          {/* Section: Véhicule */}
          <div className="space-y-1 mb-2 pt-4">
            <h3 className="font-cinzel text-sm font-semibold text-[#22D3EE] uppercase tracking-[0.15em]">Véhicule souhaité</h3>
            <div className="h-px bg-[#22D3EE]/10" />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>Véhicule souhaité *</Label>
            <Input value={form.desired_vehicle} onChange={(e) => handleChange("desired_vehicle", e.target.value)} placeholder="Ex: Porsche 911, Mercedes AMG GT..." className={inputClass} data-testid="form-vehicle" />
            <FieldError field="desired_vehicle" />
          </div>

          {/* Section: Documents */}
          <div className="space-y-1 mb-2 pt-4">
            <h3 className="font-cinzel text-sm font-semibold text-[#22D3EE] uppercase tracking-[0.15em]">Documents requis</h3>
            <div className="h-px bg-[#22D3EE]/10" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Identity Document */}
            <div className="space-y-2">
              <Label className={labelClass}>Pièce d'identité *</Label>
              <input type="file" ref={identityRef} accept=".pdf,.jpg,.jpeg,.png" onChange={handleIdentityFile} className="hidden" data-testid="form-identity-input" />
              {identityFile ? (
                <div className="flex items-center gap-3 bg-[#0E2F36]/50 border border-[#22D3EE]/15 rounded-xl h-12 px-4">
                  <FileText size={16} className="text-[#22D3EE] flex-shrink-0" />
                  <span className="font-inter text-sm text-[#E6F7FF]/70 truncate flex-1">{identityFile.name}</span>
                  <button type="button" onClick={() => { setIdentityFile(null); identityRef.current.value = ""; }} className="text-[#E6F7FF]/40 hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => identityRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-[#0E2F36]/50 border border-dashed border-[#22D3EE]/20 rounded-xl h-12 text-[#E6F7FF]/40 hover:border-[#22D3EE]/40 hover:text-[#E6F7FF]/60 transition-colors duration-200 font-inter text-sm" data-testid="form-identity-upload">
                  <Upload size={16} />
                  PDF, JPG ou PNG (max 5MB)
                </button>
              )}
              <FieldError field="identity" />
            </div>

            {/* Salary Slips */}
            <div className="space-y-2">
              <Label className={labelClass}>3 dernières fiches de paie *</Label>
              <input type="file" ref={salaryRef} accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleSalaryFiles} className="hidden" data-testid="form-salary-input" />
              {salaryFiles.length > 0 ? (
                <div className="space-y-2">
                  {salaryFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#0E2F36]/50 border border-[#22D3EE]/15 rounded-xl h-10 px-4">
                      <FileText size={14} className="text-[#22D3EE] flex-shrink-0" />
                      <span className="font-inter text-xs text-[#E6F7FF]/70 truncate flex-1">{f.name}</span>
                      <button type="button" onClick={() => removeSalaryFile(i)} className="text-[#E6F7FF]/40 hover:text-red-400">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {salaryFiles.length < 3 && (
                    <button type="button" onClick={() => salaryRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-[#0E2F36]/30 border border-dashed border-[#22D3EE]/10 rounded-xl h-8 text-[#E6F7FF]/30 hover:border-[#22D3EE]/30 text-xs font-inter">
                      + Ajouter un fichier
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => salaryRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-[#0E2F36]/50 border border-dashed border-[#22D3EE]/20 rounded-xl h-12 text-[#E6F7FF]/40 hover:border-[#22D3EE]/40 hover:text-[#E6F7FF]/60 transition-colors duration-200 font-inter text-sm" data-testid="form-salary-upload">
                  <Upload size={16} />
                  PDF, JPG ou PNG (max 5MB chacun)
                </button>
              )}
              <FieldError field="salary" />
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <span className="font-inter text-sm text-red-400">{errors.submit}</span>
            </div>
          )}

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
