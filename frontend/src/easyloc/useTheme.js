import { useApp } from "./context";

const DEFAULT_THEME = { primary: "#C9A227", primary_hover: "#D4AF37", accent: "#22D3EE", background: "#080705", background_alt: "#0C0A07", text: "#FAF8F5" };
const DEFAULT_SECTIONS = { vehicles: true, process: true, reservation_form: true, appointment: true, reservation_cta: true, easyleaz_switch: true, contact: true };
const DEFAULT_HERO_MEDIA = { type: "video", url: "/videos/easyloc-hero.mp4", overlay_opacity: 0.6 };

export const useEasyLocTheme = () => {
  const { content } = useApp();
  const theme = { ...DEFAULT_THEME, ...(content?.theme || {}) };
  const sections = { ...DEFAULT_SECTIONS, ...(content?.sections_config || {}) };
  const hero_media = { ...DEFAULT_HERO_MEDIA, ...(content?.hero_media || {}) };
  return { theme, sections, hero_media };
};
