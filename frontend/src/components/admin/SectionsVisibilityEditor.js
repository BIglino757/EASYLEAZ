import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Loader2, Check, Eye, EyeOff } from "lucide-react";

/**
 * SectionsVisibilityEditor — toggle on/off sections of the landing page.
 * Props:
 *   - api: full base URL, e.g. `${BACKEND_URL}/api` or `${BACKEND_URL}/api/easyloc`
 *   - contentEndpoint: "cms" (EasyLeaz) | "content" (EasyLoc)
 *   - adminEndpoint: "cms" (EasyLeaz) | "admin/content" (EasyLoc)
 *   - token: admin JWT
 *   - defaults: fallback sections_config
 *   - sections: array of { key, label, description }
 *   - accent: hex color for UI
 *   - label: Site label
 */
export const SectionsVisibilityEditor = ({ api, contentEndpoint, adminEndpoint, token, defaults, sections, accent = "#22D3EE", label = "EasyLeaz" }) => {
  const [config, setConfig] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchConfig = async () => {
    try {
      const url = contentEndpoint === "cms" ? `${api}/cms/sections_config` : `${api}/content/sections_config`;
      const { data } = await axios.get(url);
      setConfig(data.content || data);
    } catch { /* use defaults */ }
  };

  useEffect(() => { fetchConfig(); /* eslint-disable-next-line */ }, []);

  const toggle = (key) => setConfig({ ...config, [key]: !config[key] });

  const save = async () => {
    setSaving(true);
    try {
      if (adminEndpoint === "cms") {
        await axios.put(`${api}/cms/sections_config`, { content: config }, { headers });
      } else {
        await axios.put(`${api}/${adminEndpoint}/sections_config`, config, { headers });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(`Erreur: ${e.response?.data?.detail || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid={`sections-editor-${label.toLowerCase()}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide" style={{ color: accent }}>Sections visibles — {label}</h2>
        <p className="text-sm opacity-60 mt-1">Activez ou désactivez les sections de la page d'accueil. Les sections désactivées ne s'affichent plus sur le site public.</p>
      </div>

      <div className="space-y-3 mb-6">
        {sections.map(({ key, label: sl, description }) => (
          <div
            key={key}
            className="p-4 border rounded-lg flex items-center justify-between gap-4"
            style={{ borderColor: `${accent}20` }}
            data-testid={`section-toggle-${key}`}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: accent }}>{sl}</p>
              <p className="text-xs opacity-50 mt-1">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(key)}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs uppercase tracking-wider"
              style={{
                borderColor: config[key] ? accent : "#555",
                background: config[key] ? `${accent}1A` : "transparent",
                color: config[key] ? accent : "#888",
              }}
            >
              {config[key] ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Masquée</>}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        data-testid="sections-save-btn"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wide"
        style={{ background: accent, color: "#071A1F" }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Sauvegardé</> : <><Save size={14} /> Enregistrer</>}
      </button>
    </div>
  );
};
