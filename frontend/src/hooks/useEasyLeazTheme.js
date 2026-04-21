import { useApp } from "@/App";

/**
 * Applies the CMS "theme" section as inline CSS variables + returns:
 *  - theme: merged theme object (defaults if unset)
 *  - sections: merged sections_config (defaults if unset)
 *  - hero_media: { type, url, overlay_opacity }
 */
const DEFAULT_THEME = { primary: "#22D3EE", primary_hover: "#0EA5B7", accent: "#C9A227", background: "#071A1F", background_alt: "#0A2A30", text: "#E6F7FF" };
const DEFAULT_SECTIONS = { about: true, process: true, vehicle_cta: true, leasing_form: true, faq: true, easyloc_switch: true, contact: true };
const DEFAULT_HERO_MEDIA = { type: "video", url: "/videos/easyleaz-hero.mp4", overlay_opacity: 0.5 };

export const useEasyLeazTheme = () => {
  const { cmsData } = useApp();
  const theme = { ...DEFAULT_THEME, ...(cmsData?.theme || {}) };
  const sections = { ...DEFAULT_SECTIONS, ...(cmsData?.sections_config || {}) };
  const hero_media = { ...DEFAULT_HERO_MEDIA, ...(cmsData?.hero_media || {}) };
  return { theme, sections, hero_media };
};
