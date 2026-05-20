import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Instagram, LogOut, LayoutDashboard, Car, Calendar, FileText, Settings, Trash2, Plus, Edit, Check, X, Eye, EyeOff, Upload, Image as ImageIcon, Star, Palette, Layers } from "lucide-react";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { SectionsVisibilityEditor } from "@/components/admin/SectionsVisibilityEditor";
import { AssetUpload } from "@/components/admin/AssetUpload";

const ELC_DEFAULT_THEME = { primary: "#C9A227", primary_hover: "#D4AF37", accent: "#22D3EE", background: "#080705", background_alt: "#0C0A07", text: "#FAF8F5" };
const ELC_DEFAULT_SECTIONS = { vehicles: true, process: true, reservation_form: true, appointment: true, reservation_cta: true, easyleaz_switch: true, contact: true };
const ELC_SECTIONS = [
  { key: "vehicles", label: "Catalogue véhicules", description: "Section de présentation des véhicules" },
  { key: "process", label: "Processus", description: "Section 'Comment ça fonctionne'" },
  { key: "reservation_form", label: "Formulaire de réservation", description: "Section demande de réservation" },
  { key: "appointment", label: "Prise de rendez-vous", description: "Section conseiller Calendly" },
  { key: "reservation_cta", label: "CTA Réservation", description: "Section d'appel à la réservation" },
  { key: "easyleaz_switch", label: "Bascule EasyLeaz", description: "Section cross-sell vers /" },
  { key: "contact", label: "Contact", description: "Section coordonnées" },
];

// Unified backend + admin JWT shared with EasyLeaz ("2 sites in 1")
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/easyloc`; // EASYLOC API
const AUTH_API = `${BACKEND_URL}/api`; // EasyLeaz auth endpoints

export default function AdminPage() {
  const [token, setToken] = useState(sessionStorage.getItem("admin_jwt") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  const [content, setContent] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editData, setEditData] = useState({});

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [contentRes, vehiclesRes, reservationsRes] = await Promise.all([
        axios.get(`${API}/content`),
        axios.get(`${API}/vehicles`),
        axios.get(`${API}/admin/reservations`, { headers })
      ]);
      setContent(contentRes.data);
      setVehicles(vehiclesRes.data);
      setReservations(reservationsRes.data);
      setIsAuthenticated(true);
    } catch (e) {
      if (e.response?.status === 401) {
        setIsAuthenticated(false);
        setToken("");
        sessionStorage.removeItem("admin_jwt");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      // Unified auth: use EasyLeaz JWT login (email/password)
      const res = await axios.post(`${AUTH_API}/auth/login`, { email: username, password });
      setToken(res.data.token);
      sessionStorage.setItem("admin_jwt", res.data.token);
      setIsAuthenticated(true);
    } catch {
      setLoginError("Identifiants invalides");
    }
  };

  const handleLogout = () => {
    setToken("");
    sessionStorage.removeItem("admin_jwt");
    setIsAuthenticated(false);
  };

  const saveContent = async (section) => {
    try {
      await axios.put(`${API}/admin/content/${section}`, editData, { headers });
      await fetchData();
      setEditingSection(null);
    } catch (e) {
      console.error(e);
    }
  };

  const saveVehicle = async () => {
    try {
      if (editingVehicle === "new") {
        await axios.post(`${API}/admin/vehicles`, editData, { headers });
      } else {
        await axios.put(`${API}/admin/vehicles/${editingVehicle}`, editData, { headers });
      }
      await fetchData();
      setEditingVehicle(null);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm("Supprimer ce vehicule ?")) return;
    try {
      await axios.delete(`${API}/admin/vehicles/${id}`, { headers });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/reservations/${id}`, { status }, { headers });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Vehicle image upload helpers (only works for existing vehicles)
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const uploadVehicleImages = async (vehicleId, fileList) => {
    if (!vehicleId || vehicleId === "new") {
      alert("Enregistrez d'abord le véhicule avant d'ajouter des images.");
      return;
    }
    const form = new FormData();
    Array.from(fileList).forEach((f) => form.append("files", f));
    setUploading(true);
    try {
      const res = await axios.post(`${API}/admin/vehicles/${vehicleId}/images`, form, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setEditData(res.data);
      await fetchData();
    } catch (e) {
      alert(`Erreur upload: ${e.response?.data?.detail || e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteVehicleImage = async (vehicleId, imageUrl) => {
    if (!window.confirm("Supprimer cette image ?")) return;
    try {
      const res = await axios.delete(`${API}/admin/vehicles/${vehicleId}/images`, {
        headers, params: { image_url: imageUrl },
      });
      setEditData(res.data);
      await fetchData();
    } catch (e) {
      alert(`Erreur: ${e.response?.data?.detail || e.message}`);
    }
  };

  const setMainVehicleImage = async (vehicleId, imageUrl) => {
    try {
      const res = await axios.post(`${API}/admin/vehicles/${vehicleId}/main-image`, { image_url: imageUrl }, { headers });
      setEditData(res.data);
      await fetchData();
    } catch (e) {
      alert(`Erreur: ${e.response?.data?.detail || e.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4" data-testid="admin-login-page">
        <div className="w-full max-w-md p-8 bg-[#111111] border border-[#333333]">
          <h1 className="font-cinzel text-2xl text-[#D4AF37] mb-8 tracking-widest text-center">EASYLOC ADMIN</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label className="text-[#A0A0A0] text-xs uppercase tracking-widest">Email</Label>
              <Input
                data-testid="admin-username-input"
                type="email"
                placeholder="Insérez l'email admin"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0"
              />
            </div>
            <div>
              <Label className="text-[#A0A0A0] text-xs uppercase tracking-widest">Mot de passe</Label>
              <div className="relative mt-2">
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors" data-testid="admin-password-toggle">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <Input
                  data-testid="admin-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Insérez le mot de passe admin"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 pl-11"
                />
              </div>
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button data-testid="admin-login-button" type="submit" className="btn-gold w-full">Connexion</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "content", label: "Contenu", icon: FileText },
    { id: "vehicles", label: "Vehicules", icon: Car },
    { id: "reservations", label: "Reservations", icon: Calendar },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "sections", label: "Sections", icon: Layers },
    { id: "settings", label: "Parametres", icon: Settings },
  ];

  const sectionLabels = {
    hero: "Section Hero",
    hero_media: "Média du Hero (vidéo/image)",
    process: "Section Processus",
    reservation_cta: "Section CTA",
    appointment: "Section Rendez-vous",
    contact: "Section Contact",
    reservation_form: "Section Formulaire",
    navbar: "Navigation",
    footer: "Pied de page"
  };

  // Hide theme / sections_config from Content tab (dedicated tabs handle these)
  const contentEntries = Object.entries(content).filter(([k]) => !["theme", "sections_config"].includes(k));
  const mediaFieldPattern = /image|photo|video|url$|logo|background|media|avatar|icon/i;

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <div className="w-64 bg-[#111111] border-r border-[#333333] min-h-screen p-6 flex flex-col">
        <h2 className="font-cinzel text-[#D4AF37] tracking-[0.2em] text-lg mb-10">EASYLOC</h2>
        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-testid={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm tracking-wider transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-[#D4AF37] bg-[#D4AF37]/10 border-l-2 border-[#D4AF37]"
                  : "text-[#A0A0A0] hover:text-[#F5F5F5]"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-[#333333] pt-4 space-y-3">
          <a href="/" target="_blank" className="flex items-center gap-3 text-[#A0A0A0] hover:text-[#D4AF37] text-sm transition-colors duration-300">
            <Eye size={16} /> Voir le site
          </a>
          <button onClick={handleLogout} data-testid="admin-logout-button" className="flex items-center gap-3 text-[#A0A0A0] hover:text-red-400 text-sm transition-colors duration-300">
            <LogOut size={16} /> Deconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <h2 className="font-cinzel text-2xl text-[#F5F5F5] tracking-widest mb-8">GESTION DU CONTENU</h2>
              {contentEntries.map(([section, data]) => (
                <div key={section} className="bg-[#111111] border border-[#333333] p-6" data-testid={`content-section-${section}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cinzel text-[#D4AF37] tracking-widest text-sm">{sectionLabels[section] || section.toUpperCase()}</h3>
                    {editingSection === section ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveContent(section)} className="p-2 text-green-400 hover:bg-green-400/10 transition-colors"><Check size={16} /></button>
                        <button onClick={() => setEditingSection(null)} className="p-2 text-red-400 hover:bg-red-400/10 transition-colors"><X size={16} /></button>
                      </div>
                    ) : (
                      <button
                        data-testid={`edit-content-${section}`}
                        onClick={() => { setEditingSection(section); setEditData(data); }}
                        className="p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                  {editingSection === section ? (
                    <div className="space-y-3">
                      {Object.entries(editData).map(([key, value]) => {
                        const isMedia = mediaFieldPattern.test(key);
                        return (
                          <div key={key}>
                            <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">{key}</Label>
                            {typeof value === "string" ? (
                              isMedia ? (
                                <div className="space-y-2 mt-1">
                                  <Input
                                    value={value}
                                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                    placeholder="URL ou upload via bouton"
                                    className="bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                                  />
                                  <AssetUpload value={value} onChange={(url) => setEditData({ ...editData, [key]: url })} token={token} theme="gold" />
                                </div>
                              ) : value.length > 80 ? (
                                <Textarea
                                  value={value}
                                  onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                  className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                                />
                              ) : (
                                <Input
                                  value={value}
                                  onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                  className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                                />
                              )
                            ) : typeof value === "number" ? (
                              <Input
                                type="number"
                                value={value}
                                onChange={(e) => setEditData({ ...editData, [key]: Number(e.target.value) })}
                                className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                              />
                            ) : (
                              <pre className="mt-1 text-xs text-[#A0A0A0] bg-[#0B0B0B] p-3 border border-[#333333] overflow-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="flex gap-4 text-sm">
                          <span className="text-[#A0A0A0] min-w-[120px] uppercase text-xs tracking-wider">{key}:</span>
                          <span className="text-[#F5F5F5] text-xs">{typeof value === "string" ? value : JSON.stringify(value).substring(0, 100)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-cinzel text-2xl text-[#F5F5F5] tracking-widest">VEHICULES</h2>
                <button
                  data-testid="add-vehicle-button"
                  onClick={() => {
                    setEditingVehicle("new");
                    setEditData({ name: "", year: 2024, image: "", price_day: 0, price_weekend: 0, km_included: "200 km/jour inclus", specs: {}, category: "sport", available: true, order: vehicles.length });
                  }}
                  className="btn-gold flex items-center gap-2 py-2 px-6"
                >
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              {editingVehicle && (
                <div className="bg-[#111111] border border-[#D4AF37]/30 p-6 mb-6" data-testid="vehicle-edit-form">
                  <h3 className="font-cinzel text-[#D4AF37] tracking-widest text-sm mb-4">
                    {editingVehicle === "new" ? "NOUVEAU VEHICULE" : "MODIFIER VEHICULE"}
                  </h3>

                  {/* Basic fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {["name", "year", "price_day", "price_weekend", "km_included", "category"].map(field => (
                      <div key={field}>
                        <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">{field}</Label>
                        <Input
                          value={editData[field] ?? ""}
                          onChange={(e) => setEditData({ ...editData, [field]: ["year", "price_day", "price_weekend", "order"].includes(field) ? Number(e.target.value) : e.target.value })}
                          className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Specs editor */}
                  <div className="mt-6">
                    <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">Caractéristiques techniques</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[
                        { key: "power", label: "Puissance (ex: 306 ch)" },
                        { key: "acceleration", label: "Accélération (ex: 0-100 en 4.7s)" },
                        { key: "transmission", label: "Transmission (ex: Automatique DCT 7G)" },
                        { key: "fuel", label: "Carburant (ex: Essence)" },
                        { key: "drivetrain", label: "Transmission aux roues (ex: 4MATIC intégrale)" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <Label className="text-[#A0A0A0] text-[0.65rem] uppercase tracking-wider">{label}</Label>
                          <Input
                            value={editData.specs?.[key] ?? ""}
                            onChange={(e) => setEditData({
                              ...editData,
                              specs: { ...(editData.specs || {}), [key]: e.target.value }
                            })}
                            className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image gallery (only for saved vehicles) */}
                  {editingVehicle !== "new" && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">Galerie photos ({(editData.images || []).length})</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.length) uploadVehicleImages(editingVehicle, e.target.files);
                            e.target.value = "";
                          }}
                          data-testid="vehicle-images-input"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          data-testid="vehicle-upload-images-btn"
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                        >
                          <Upload size={14} />
                          {uploading ? "Envoi..." : "Ajouter des photos"}
                        </button>
                      </div>
                      {(editData.images || []).length === 0 ? (
                        <div className="border border-dashed border-[#333333] rounded p-8 text-center">
                          <ImageIcon size={32} className="mx-auto text-[#555] mb-3" />
                          <p className="text-[#A0A0A0] text-sm">Aucune image. JPG / PNG — max 5 MB chacune.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-3">
                          {(editData.images || []).map((url, i) => (
                            <div key={url + i} className="relative group aspect-[4/3] overflow-hidden border border-[#333]">
                              <img src={url} alt={`${editData.name} ${i + 1}`} className="w-full h-full object-cover" />
                              {editData.image === url && (
                                <div className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 bg-[#D4AF37] text-[#0B0B0B] text-[0.55rem] uppercase tracking-wider font-semibold rounded-sm">
                                  <Star size={10} fill="currentColor" /> Principale
                                </div>
                              )}
                              <div className="absolute inset-0 bg-[#0B0B0B]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                {editData.image !== url && (
                                  <button
                                    type="button"
                                    onClick={() => setMainVehicleImage(editingVehicle, url)}
                                    title="Définir comme image principale"
                                    className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                    data-testid={`set-main-image-${i}`}
                                  >
                                    <Star size={14} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => deleteVehicleImage(editingVehicle, url)}
                                  title="Supprimer cette image"
                                  className="p-2 text-red-400 hover:bg-red-400/10"
                                  data-testid={`delete-image-${i}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={saveVehicle} data-testid="save-vehicle-btn" className="btn-gold py-2 px-6 text-xs">Enregistrer</button>
                    <button onClick={() => setEditingVehicle(null)} className="btn-outline-gold py-2 px-6 text-xs">Fermer</button>
                  </div>
                  {editingVehicle === "new" && (
                    <p className="text-[#A0A0A0] text-[0.7rem] mt-3">
                      Astuce : enregistrez le véhicule puis rouvrez-le pour ajouter des photos.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-[#111111] border border-[#333333] p-4 flex items-center gap-4" data-testid={`vehicle-row-${vehicle.id}`}>
                    <img src={vehicle.image} alt={vehicle.name} className="w-20 h-14 object-cover" />
                    <div className="flex-1">
                      <p className="text-[#F5F5F5] text-sm font-medium">{vehicle.name}</p>
                      <p className="text-[#A0A0A0] text-xs">{vehicle.year} | CHF {vehicle.price_day}/jour</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingVehicle(vehicle.id); setEditData(vehicle); }}
                        data-testid={`vehicle-edit-btn-${vehicle.id}`}
                        aria-label="Modifier"
                        className="p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle.id)}
                        data-testid={`vehicle-delete-btn-${vehicle.id}`}
                        aria-label="Supprimer"
                        className="p-2 text-[#A0A0A0] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <div className="space-y-6">
              <h2 className="font-cinzel text-2xl text-[#F5F5F5] tracking-widest mb-8">RESERVATIONS</h2>
              {reservations.length === 0 ? (
                <p className="text-[#A0A0A0] text-center py-12">Aucune reservation pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {reservations.map(res => (
                    <div key={res.id} className="bg-[#111111] border border-[#333333] p-5" data-testid={`reservation-row-${res.id}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[#F5F5F5] font-medium">{res.prenom} {res.nom}</p>
                          <p className="text-[#A0A0A0] text-xs">{res.email} | {res.telephone}</p>
                        </div>
                        <span className={`text-xs uppercase tracking-widest px-3 py-1 ${
                          res.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                          res.status === "confirmed" ? "bg-green-500/10 text-green-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {res.status}
                        </span>
                      </div>
                      <div className="text-sm text-[#A0A0A0] space-y-1">
                        <p>Vehicule: <span className="text-[#F5F5F5]">{res.vehicule}</span></p>
                        <p>Dates: <span className="text-[#F5F5F5]">{res.date_debut} - {res.date_fin}</span></p>
                        {res.message && <p>Message: <span className="text-[#F5F5F5]">{res.message}</span></p>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => updateReservationStatus(res.id, "confirmed")} className="text-xs text-green-400 hover:bg-green-400/10 px-3 py-1 transition-colors">Confirmer</button>
                        <button onClick={() => updateReservationStatus(res.id, "rejected")} className="text-xs text-red-400 hover:bg-red-400/10 px-3 py-1 transition-colors">Refuser</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === "theme" && (
            <div className="text-[#F5F5F5]">
              <ThemeEditor
                api={`${process.env.REACT_APP_BACKEND_URL}/api/easyloc`}
                contentEndpoint="content"
                adminEndpoint="admin/content"
                token={token}
                defaults={ELC_DEFAULT_THEME}
                accent="#D4AF37"
                label="EasyLoc"
              />
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === "sections" && (
            <div className="text-[#F5F5F5]">
              <SectionsVisibilityEditor
                api={`${process.env.REACT_APP_BACKEND_URL}/api/easyloc`}
                contentEndpoint="content"
                adminEndpoint="admin/content"
                token={token}
                defaults={ELC_DEFAULT_SECTIONS}
                sections={ELC_SECTIONS}
                accent="#D4AF37"
                label="EasyLoc"
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="font-cinzel text-2xl text-[#F5F5F5] tracking-widest mb-8">PARAMETRES</h2>
              <div className="bg-[#111111] border border-[#333333] p-6">
                <h3 className="font-cinzel text-[#D4AF37] tracking-widest text-sm mb-4">INTEGRATIONS</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">URL Typeform (Formulaire de reservation)</Label>
                    <Input
                      data-testid="typeform-url-input"
                      value={content?.reservation_form?.embed_url || ""}
                      onChange={(e) => setContent({
                        ...content,
                        reservation_form: { ...content.reservation_form, embed_url: e.target.value }
                      })}
                      placeholder="https://votre-typeform-url.typeform.com/to/..."
                      className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">URL Calendly (Prise de rendez-vous)</Label>
                    <Input
                      data-testid="calendly-url-input"
                      value={content?.appointment?.embed_url || ""}
                      onChange={(e) => setContent({
                        ...content,
                        appointment: { ...content.appointment, embed_url: e.target.value }
                      })}
                      placeholder="https://calendly.com/votre-lien"
                      className="mt-1 bg-[#0B0B0B] border-[#333333] text-[#F5F5F5] rounded-none focus:border-[#D4AF37] focus:ring-0 text-sm"
                    />
                  </div>
                  <button
                    data-testid="save-settings-button"
                    onClick={async () => {
                      try {
                        await Promise.all([
                          axios.put(`${API}/admin/content/reservation_form`, content.reservation_form, { headers }),
                          axios.put(`${API}/admin/content/appointment`, content.appointment, { headers })
                        ]);
                        alert("Parametres enregistres");
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="btn-gold py-2 px-6 text-xs"
                  >
                    Enregistrer les integrations
                  </button>
                </div>
              </div>
              <div className="bg-[#111111] border border-[#333333] p-6">
                <h3 className="font-cinzel text-[#D4AF37] tracking-widest text-sm mb-4">ADMINISTRATION</h3>
                <p className="text-[#A0A0A0] text-sm">Login unifié pour EasyLoc + EasyLeaz :</p>
                <p className="text-[#A0A0A0] text-sm mt-2">Email : <span className="text-[#F5F5F5]">admin@easyleaz.ch</span></p>
                <p className="text-[#A0A0A0] text-sm mt-1">Mot de passe : <span className="text-[#F5F5F5]">easyleaz2024</span></p>
                <p className="text-[#A0A0A0] text-[0.65rem] mt-3 italic">Le mot de passe peut être modifié directement dans la base de données.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
