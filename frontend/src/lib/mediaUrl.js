// Prefixes server-relative API URLs with the backend host.
// In split frontend/backend deployments (Vercel + Railway), paths like
// "/api/easyloc/uploads/xxx.jpg" need to point at Railway, NOT Vercel.
// Local frontend assets (/sections/, /static/, etc.) stay relative.
const BACKEND = process.env.REACT_APP_BACKEND_URL || "";

export const mediaUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;
  // Only prefix /api/* paths — other absolute paths (e.g. /sections/) are frontend static assets.
  if (path.startsWith("/api/")) return `${BACKEND}${path}`;
  return path;
};
