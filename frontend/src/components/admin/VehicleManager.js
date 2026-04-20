import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ImageIcon, Upload, X, Star } from "lucide-react";

export const VehicleManager = ({ token }) => {
  const { API } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [filterCondition, setFilterCondition] = useState("all");
  const imageInputRef = useRef(null);
  const [form, setForm] = useState({
    brand: "", model: "", year: 2024, mileage: 0, fuel: "Essence",
    transmission: "Automatique", price: 0, monthly_payment: 0, image_url: "", badge: "", condition: "occasion"
  });

  const headers = token.length > 30 ? { Authorization: `Bearer ${token}` } : { "x-admin-token": token };

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/vehicles/all`, { headers });
      setVehicles(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [API, token]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const resetForm = () => {
    setForm({ brand: "", model: "", year: 2024, mileage: 0, fuel: "Essence", transmission: "Automatique", price: 0, monthly_payment: 0, image_url: "", badge: "", condition: "occasion" });
    setEditing(null);
  };

  const openEdit = (v) => {
    setEditing(v.id);
    setForm({ brand: v.brand, model: v.model, year: v.year, mileage: v.mileage, fuel: v.fuel, transmission: v.transmission, price: v.price, monthly_payment: v.monthly_payment, image_url: v.image_url || "", badge: v.badge || "", condition: v.condition || "occasion" });
    setDialogOpen(true);
  };

  const openNew = () => { resetForm(); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/vehicles/${editing}`, form, { headers });
      } else {
        const res = await axios.post(`${API}/vehicles`, form, { headers });
        setEditing(res.data.id);
      }
      setDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce véhicule et toutes ses photos ?")) return;
    try {
      await axios.delete(`${API}/vehicles/${id}`, { headers });
      fetchVehicles();
    } catch (err) { console.error(err); }
  };

  const handleImageUpload = async (vehicleId, files) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      await axios.post(`${API}/vehicles/${vehicleId}/images`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      fetchVehicles();
    } catch (e) { console.error(e); }
    setUploadingImages(false);
  };

  const handleImageDelete = async (vehicleId, imageId) => {
    try {
      await axios.delete(`${API}/vehicles/${vehicleId}/images/${imageId}`, { headers });
      fetchVehicles();
    } catch (e) { console.error(e); }
  };

  const setMainImage = async (vehicleId, imageId) => {
    try {
      await axios.post(`${API}/vehicles/${vehicleId}/main-image`, { image_id: imageId }, { headers });
      fetchVehicles();
    } catch (e) { console.error(e); }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API.replace('/api', '')}${url}`;
  };

  const filteredVehicles = filterCondition === "all" ? vehicles : vehicles.filter(v => v.condition === filterCondition);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#22D3EE]" size={32} /></div>;

  return (
    <div data-testid="vehicle-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-cinzel text-xl font-bold text-[#E6F7FF] uppercase tracking-wide">Gestion des véhicules</h2>
        <div className="flex gap-3">
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-9 w-36 rounded-lg text-sm" data-testid="vehicle-filter-condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="occasion">Occasion</SelectItem>
              <SelectItem value="neuf">Neuf</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <button onClick={openNew} className="btn-primary-easyleaz px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2" data-testid="add-vehicle-button">
                <Plus size={16} /> Ajouter
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-cinzel text-lg text-[#E6F7FF]">{editing ? "Modifier le véhicule" : "Nouveau véhicule"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Marque *</Label>
                    <Input required value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} placeholder="Ex: Mercedes-AMG" className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-brand" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Modèle *</Label>
                    <Input required value={form.model} onChange={(e) => handleChange("model", e.target.value)} placeholder="Ex: GT 63 S" className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-model" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Année *</Label>
                    <Input type="number" required value={form.year} onChange={(e) => handleChange("year", parseInt(e.target.value) || 0)} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-year" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Kilométrage *</Label>
                    <Input type="number" required value={form.mileage} onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)} placeholder="Ex: 12000" className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-mileage" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Carburant *</Label>
                    <Select value={form.fuel} onValueChange={(v) => handleChange("fuel", v)}>
                      <SelectTrigger className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                        <SelectItem value="Essence">Essence</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Électrique">Électrique</SelectItem>
                        <SelectItem value="Hybride">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Transmission *</Label>
                    <Select value={form.transmission} onValueChange={(v) => handleChange("transmission", v)}>
                      <SelectTrigger className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                        <SelectItem value="Automatique">Automatique</SelectItem>
                        <SelectItem value="Manuelle">Manuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Prix (CHF) *</Label>
                    <Input type="number" required value={form.price} onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-price" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Mensualité (CHF) *</Label>
                    <Input type="number" required value={form.monthly_payment} onChange={(e) => handleChange("monthly_payment", parseInt(e.target.value) || 0)} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-monthly" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Catégorie *</Label>
                    <Select value={form.condition} onValueChange={(v) => handleChange("condition", v)}>
                      <SelectTrigger className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-condition"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                        <SelectItem value="occasion">Occasion</SelectItem>
                        <SelectItem value="neuf">Neuf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#E6F7FF]/60">Badge</Label>
                    <Input value={form.badge} onChange={(e) => handleChange("badge", e.target.value)} placeholder="Ex: Premium, Neuf" className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-badge" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary-easyleaz w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2" data-testid="vehicle-form-submit">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : (editing ? "Mettre à jour" : "Ajouter le véhicule")}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="font-inter text-xs text-[#E6F7FF]/30 mb-4">{filteredVehicles.length} véhicule(s)</p>

      {/* Vehicle grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => (
          <VehicleAdminCard
            key={v.id}
            vehicle={v}
            API={API}
            headers={headers}
            getImageSrc={getImageSrc}
            onEdit={() => openEdit(v)}
            onDelete={() => handleDelete(v.id)}
            onUploadImages={(files) => handleImageUpload(v.id, files)}
            onDeleteImage={(imgId) => handleImageDelete(v.id, imgId)}
            onSetMainImage={(imgId) => setMainImage(v.id, imgId)}
            uploadingImages={uploadingImages}
          />
        ))}
      </div>
    </div>
  );
};

const VehicleAdminCard = ({ vehicle: v, getImageSrc, onEdit, onDelete, onUploadImages, onDeleteImage, onSetMainImage, uploadingImages }) => {
  const imageInputRef = useRef(null);
  const mainSrc = getImageSrc(v.image_url);
  const images = v.images || [];
  const conditionLabel = v.condition === "neuf" ? "Neuf" : "Occasion";

  return (
    <div className="glass-card rounded-xl overflow-hidden" data-testid={`admin-vehicle-${v.id}`}>
      {/* Main image */}
      <div className="h-40 bg-[#0E2F36] relative overflow-hidden">
        {mainSrc ? (
          <img src={mainSrc} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-[#22D3EE]/30" /></div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-inter font-bold uppercase tracking-wider ${v.condition === "neuf" ? "bg-green-500/20 border border-green-500/40 text-green-400" : "bg-[#22D3EE]/20 border border-[#22D3EE]/40 text-[#22D3EE]"}`}>
            {conditionLabel}
          </span>
        </div>
        {v.status !== "active" && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-[10px] text-red-400 font-inter">Inactif</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-cinzel text-sm font-semibold text-[#E6F7FF] uppercase">{v.brand} {v.model}</h3>
        <p className="font-inter text-xs text-[#E6F7FF]/50 mt-1">{v.year} | {v.mileage?.toLocaleString()} km | {v.fuel} | {v.transmission}</p>
        <p className="font-inter text-xs text-[#22D3EE] mt-1 font-semibold">CHF {v.price?.toLocaleString()} — {v.monthly_payment?.toLocaleString()}/mois</p>

        {/* Image gallery */}
        {images.length > 0 && (
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {images.map((img) => {
              const isMain = v.image_url && v.image_url.includes(img.filename);
              const src = `/api/uploads/vehicles/${img.filename}`;
              return (
                <div key={img.id} className={`relative w-14 h-14 rounded-lg overflow-hidden border group ${isMain ? "border-[#22D3EE]/60 ring-1 ring-[#22D3EE]/30" : "border-[#22D3EE]/10"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button onClick={() => onSetMainImage(img.id)} title="Image principale" className="p-1 hover:text-[#22D3EE] text-white/70">
                      <Star size={10} />
                    </button>
                    <button onClick={() => onDeleteImage(img.id)} title="Supprimer" className="p-1 hover:text-red-400 text-white/70">
                      <X size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <input type="file" ref={imageInputRef} accept=".jpg,.jpeg,.png,.pdf" multiple className="hidden" onChange={(e) => { onUploadImages(e.target.files); e.target.value = ""; }} />
          <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImages} className="flex-1 py-2 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE] font-inter font-medium flex items-center justify-center gap-1 hover:bg-[#22D3EE]/20 transition-colors duration-200" data-testid={`upload-images-${v.id}`}>
            {uploadingImages ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Photos
          </button>
          <button onClick={onEdit} className="py-2 px-3 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE] font-inter hover:bg-[#22D3EE]/20 transition-colors duration-200" data-testid={`edit-vehicle-${v.id}`}>
            <Pencil size={12} />
          </button>
          <button onClick={onDelete} className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-inter hover:bg-red-500/20 transition-colors duration-200" data-testid={`delete-vehicle-${v.id}`}>
            <Trash2 size={12} />
          </button>
        </div>
        <p className="font-inter text-[10px] text-[#E6F7FF]/20 mt-2">{images.length} photo(s)</p>
      </div>
    </div>
  );
};
