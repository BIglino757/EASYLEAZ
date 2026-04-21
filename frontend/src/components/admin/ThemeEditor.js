import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Loader2, Check, RefreshCw } from "lucide-react";

/**
 * ThemeEditor — edits a CMS "theme" section with color pickers.
 * Props:
 *   - api: full base URL, e.g. `${BACKEND_URL}/api` or `${BACKEND_URL}/api/easyloc`
 *   - contentEndpoint: "cms" (EasyLeaz) | "content" (EasyLoc)
 *   - adminEndpoint: "cms" (EasyLeaz) | "admin/content" (EasyLoc)
 *   - token: admin JWT
 *   - defaults: fallback theme if server returns nothing
 *   - accent: UI accent color hex for labels/buttons
 *   - label: Site label
 */
export const ThemeEditor = ({ api, contentEndpoint, adminEndpoint, token, defaults, accent = "#22D3EE", label = "EasyLeaz" }) => {
  const [theme, setTheme] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTheme = async () => {
    try {
      const url = contentEndpoint === "cms" ? `${api}/cms/theme` : `${api}/content/theme`;
      const { data } = await axios.get(url);
      // EasyLeaz returns {section_key, content}, EasyLoc returns plain content
      setTheme(data.content || data);
    } catch { /* use defaults */ }
  };

  useEffect(() => { fetchTheme(); /* eslint-disable-next-line */ }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (adminEndpoint === "cms") {
        await axios.put(`${api}/cms/theme`, { content: theme }, { headers });
      } else {
        await axios.put(`${api}/${adminEndpoint}/theme`, theme, { headers });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(`Erreur: ${e.response?.data?.detail || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "primary", label: "Couleur principale", description: "Boutons, liens, accents" },
    { key: "primary_hover", label: "Principale (survol)", description: "Hover des boutons principaux" },
    { key: "accent", label: "Couleur d'accent", description: "Section cross-sell (autre site)" },
    { key: "background", label: "Fond principal", description: "Couleur de fond dominante" },
    { key: "background_alt", label: "Fond alternatif", description: "Sections secondaires" },
    { key: "text", label: "Texte principal", description: "Couleur du texte principal" },
  ];

  return (
    <div data-testid={`theme-editor-${label.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide" style={{ color: accent }}>Thème {label}</h2>
          <p className="text-sm opacity-60 mt-1">Les couleurs s'appliquent dynamiquement à tout le site après sauvegarde.</p>
        </div>
        <button
          onClick={fetchTheme}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs border rounded hover:opacity-80 transition-opacity"
          style={{ borderColor: `${accent}4D`, color: accent }}
          title="Recharger"
        >
          <RefreshCw size={13} /> Recharger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {fields.map(({ key, label: fl, description }) => (
          <div key={key} className="p-4 border rounded-lg" style={{ borderColor: `${accent}20` }} data-testid={`theme-field-${key}`}>
            <label className="block text-xs uppercase tracking-wider opacity-60 mb-2">{fl}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme[key] || "#000000"}
                onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer border"
                style={{ borderColor: `${accent}30` }}
              />
              <input
                type="text"
                value={theme[key] || ""}
                onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                className="flex-1 bg-transparent border rounded px-3 py-2 text-sm font-mono"
                style={{ borderColor: `${accent}30`, color: "#E6F7FF" }}
                placeholder="#FFFFFF"
              />
            </div>
            <p className="text-[0.65rem] opacity-40 mt-2">{description}</p>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="mb-6 p-6 rounded-lg border" style={{ background: theme.background, borderColor: `${accent}20` }}>
        <p className="text-[0.65rem] uppercase tracking-wider opacity-60 mb-3" style={{ color: theme.text }}>Aperçu</p>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            className="px-5 py-3 rounded-full text-sm font-semibold uppercase tracking-wide"
            style={{ background: theme.primary, color: theme.background }}
          >
            Bouton principal
          </button>
          <button
            className="px-5 py-3 rounded-full text-sm font-semibold uppercase tracking-wide border"
            style={{ borderColor: theme.accent, color: theme.accent }}
          >
            Bouton d'accent
          </button>
          <span className="text-sm" style={{ color: theme.text }}>
            Exemple de texte sur ce thème.
          </span>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        data-testid="theme-save-btn"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wide"
        style={{ background: accent, color: "#071A1F" }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Sauvegardé</> : <><Save size={14} /> Enregistrer le thème</>}
      </button>
    </div>
  );
};
