import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { AssetUpload } from "@/components/admin/AssetUpload";

// Field name patterns that should trigger a media upload UI
const MEDIA_FIELD_PATTERNS = /image|photo|video|url$|logo|background|media|avatar|icon/i;

const SectionEditor = ({ section, token, API }) => {
  const [content, setContent] = useState(section.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const headers = token.length > 30 ? { Authorization: `Bearer ${token}` } : { "x-admin-token": token };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/cms/${section.section_key}`, { content }, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const updateField = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedField = (arrayKey, index, field, value) => {
    setContent(prev => {
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [arrayKey]: arr };
    });
  };

  const sectionLabels = {
    hero: "Section Hero",
    hero_media: "Média du Hero (vidéo / image)",
    vehicles: "Section Véhicules",
    vehicle_cta: "Section CTA Véhicules",
    about: "Section À propos",
    process: "Section Processus",
    faq: "Section FAQ",
    leasing_form: "Section Formulaire",
    appointment: "Section Rendez-vous",
    contact: "Section Contact",
    navbar: "Barre de navigation",
  };

  // Skip theme and sections_config (dedicated tabs handle these)
  if (section.section_key === "theme" || section.section_key === "sections_config") return null;

  return (
    <div className="glass-card rounded-xl overflow-hidden" data-testid={`cms-section-${section.section_key}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#22D3EE]/5 transition-colors duration-200"
      >
        <h3 className="font-cinzel text-sm font-semibold text-[#E6F7FF] uppercase tracking-wide">
          {sectionLabels[section.section_key] || section.section_key}
        </h3>
        {expanded ? <ChevronUp size={16} className="text-[#22D3EE]" /> : <ChevronDown size={16} className="text-[#E6F7FF]/40" />}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-[#22D3EE]/10 pt-4">
          {Object.entries(content).map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <div key={key} className="space-y-3">
                  <Label className="text-xs text-[#22D3EE] uppercase tracking-wider font-bold">{key}</Label>
                  {value.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#071A1F]/50 border border-[#22D3EE]/10 space-y-2">
                      <span className="font-inter text-xs text-[#E6F7FF]/40">#{idx + 1}</span>
                      {Object.entries(item).map(([field, val]) => (
                        <div key={field} className="space-y-1">
                          <Label className="text-[10px] text-[#E6F7FF]/40 uppercase">{field}</Label>
                          <Input
                            value={val}
                            onChange={(e) => updateNestedField(key, idx, field, e.target.value)}
                            className="bg-[#0E2F36]/30 border-[#22D3EE]/10 text-[#E6F7FF] h-8 text-sm rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            }
            if (typeof value === "object") return null;
            const isLong = typeof value === "string" && value.length > 80;
            const isMedia = MEDIA_FIELD_PATTERNS.test(key);
            return (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-[#E6F7FF]/50 uppercase tracking-wider">{key.replace(/_/g, " ")}</Label>
                {isMedia ? (
                  <div className="space-y-2">
                    <Input
                      value={value}
                      onChange={(e) => updateField(key, e.target.value)}
                      placeholder="URL ou upload via bouton"
                      className="bg-[#0E2F36]/30 border-[#22D3EE]/10 text-[#E6F7FF] h-9 text-sm rounded-lg"
                    />
                    <AssetUpload value={value} onChange={(url) => updateField(key, url)} token={token} theme="cyan" />
                  </div>
                ) : isLong ? (
                  <Textarea
                    value={value}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="bg-[#0E2F36]/30 border-[#22D3EE]/10 text-[#E6F7FF] text-sm rounded-lg resize-none"
                    rows={3}
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="bg-[#0E2F36]/30 border-[#22D3EE]/10 text-[#E6F7FF] h-9 text-sm rounded-lg"
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary-easyleaz px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
            data-testid={`cms-save-${section.section_key}`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Sauvegardé</> : <><Save size={14} /> Sauvegarder</>}
          </button>
        </div>
      )}
    </div>
  );
};

export const CMSEditor = ({ token }) => {
  const { API } = useApp();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCMS = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cms`);
      setSections(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [API]);

  useEffect(() => { fetchCMS(); }, [fetchCMS]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#22D3EE]" size={32} /></div>;

  return (
    <div data-testid="cms-editor">
      <h2 className="font-cinzel text-xl font-bold text-[#E6F7FF] uppercase tracking-wide mb-6">Gestion du contenu</h2>
      <p className="font-inter text-sm text-[#E6F7FF]/50 mb-8">Modifiez les textes, images et liens de chaque section du site.</p>
      <div className="space-y-3">
        {sections.map((s) => (
          <SectionEditor key={s.section_key} section={s} token={token} API={API} />
        ))}
      </div>
    </div>
  );
};
