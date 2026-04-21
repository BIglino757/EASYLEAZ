import { useRef, useState } from "react";
import axios from "axios";
import { Upload, X, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Reusable upload button for CMS images & videos.
 * Props:
 *   - value: current URL (string)
 *   - onChange: fn(url) — called when upload or clear happens
 *   - token: admin JWT
 *   - accept: "image/*" | "video/*" | "image/*,video/*"
 *   - theme: "cyan" | "gold"
 */
export const AssetUpload = ({ value, onChange, token, accept = "image/*,video/*", theme = "cyan" }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const color = theme === "gold" ? "#C9A227" : "#22D3EE";

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axios.post(`${API}/cms/assets`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch (err) {
      alert(`Erreur upload: ${err.response?.data?.detail || err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const isVideo = value && /\.(mp4|webm|mov)(\?|$)/i.test(value);

  return (
    <div className="flex items-center gap-3">
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleUpload} />
      {value ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isVideo ? (
            <video src={value} muted className="w-16 h-12 object-cover rounded border" style={{ borderColor: `${color}40` }} />
          ) : (
            <img src={value} alt="asset" className="w-16 h-12 object-cover rounded border" style={{ borderColor: `${color}40` }} />
          )}
          <span className="text-xs text-[#E6F7FF]/60 truncate flex-1" title={value}>{value.split("/").pop()}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"
            title="Retirer"
            data-testid="asset-remove-btn"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        data-testid="asset-upload-btn"
        className="inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider border rounded transition-colors disabled:opacity-50"
        style={{ borderColor: `${color}4D`, color }}
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {busy ? "Envoi..." : (value ? "Changer" : "Uploader")}
      </button>
    </div>
  );
};
