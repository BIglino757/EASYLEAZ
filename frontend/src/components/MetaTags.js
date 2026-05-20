import { useEffect } from "react";

/**
 * Dynamic meta tag manager — switches <title> + Open Graph + Twitter Card
 * based on which site (EasyLeaz vs EasyLoc) is being displayed.
 * Use: <MetaTags site="easyleaz" /> or <MetaTags site="easyloc" />
 */
const SITE_META = {
  easyleaz: {
    title: "EasyLeaz",
    og_title: "EasyLeaz — Leasing automobile premium à Genève",
    description: "Neuf & occasion · Réponse 24-48h · Accompagnement personnalisé. Découvrez aussi EasyLoc pour la location courte durée.",
    image: "/logos/easyleaz.png",
  },
  easyloc: {
    title: "EasyLoc",
    og_title: "EasyLoc — Location de véhicules premium à Genève",
    description: "Service sur mesure · Véhicules d'exception · Disponibilité immédiate. Location courte durée à Genève.",
    image: "/logos/easyloc.png",
  },
};

const setMeta = (selector, attr, value) => {
  let el = document.querySelector(selector);
  if (!el) return;
  el.setAttribute(attr, value);
};

export const MetaTags = ({ site = "easyleaz" }) => {
  useEffect(() => {
    const m = SITE_META[site] || SITE_META.easyleaz;
    document.title = m.title;
    setMeta('meta[name="description"]', "content", m.description);
    setMeta('meta[property="og:title"]', "content", m.og_title);
    setMeta('meta[property="og:description"]', "content", m.description);
    setMeta('meta[property="og:image"]', "content", m.image);
    setMeta('meta[name="twitter:title"]', "content", m.og_title);
    setMeta('meta[name="twitter:description"]', "content", m.description);
    setMeta('meta[name="twitter:image"]', "content", m.image);
  }, [site]);
  return null;
};
