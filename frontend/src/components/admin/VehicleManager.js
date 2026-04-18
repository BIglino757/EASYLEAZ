import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from "lucide-react";

export const VehicleManager = ({ token }) => {
  const { API } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand: "", model: "", year: 2024, mileage: 0, fuel: "Essence",
    transmission: "Automatique", price: 0, monthly_payment: 0, image_url: "", badge: ""
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
    setForm({ brand: "", model: "", year: 2024, mileage: 0, fuel: "Essence", transmission: "Automatique", price: 0, monthly_payment: 0, image_url: "", badge: "" });
    setEditing(null);
  };

  const openEdit = (v) => {
    setEditing(v.id);
    setForm({ brand: v.brand, model: v.model, year: v.year, mileage: v.mileage, fuel: v.fuel, transmission: v.transmission, price: v.price, monthly_payment: v.monthly_payment, image_url: v.image_url || "", badge: v.badge || "" });
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
        await axios.post(`${API}/vehicles`, form, { headers });
      }
      setDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;
    try {
      await axios.delete(`${API}/vehicles/${id}`, { headers });
      fetchVehicles();
    } catch (err) { console.error(err); }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#22D3EE]" size={32} /></div>;

  return (
    <div data-testid="vehicle-manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cinzel text-xl font-bold text-[#E6F7FF] uppercase tracking-wide">Gestion des véhicules</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Label className="text-xs text-[#E6F7FF]/60">Marque</Label>
                  <Input required value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-brand" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Modèle</Label>
                  <Input required value={form.model} onChange={(e) => handleChange("model", e.target.value)} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-model" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Année</Label>
                  <Input type="number" required value={form.year} onChange={(e) => handleChange("year", parseInt(e.target.value))} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-year" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Kilométrage</Label>
                  <Input type="number" required value={form.mileage} onChange={(e) => handleChange("mileage", parseInt(e.target.value))} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-mileage" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Carburant</Label>
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
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Transmission</Label>
                  <Select value={form.transmission} onValueChange={(v) => handleChange("transmission", v)}>
                    <SelectTrigger className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
                      <SelectItem value="Automatique">Automatique</SelectItem>
                      <SelectItem value="Manuelle">Manuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Prix (CHF)</Label>
                  <Input type="number" required value={form.price} onChange={(e) => handleChange("price", parseInt(e.target.value))} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-price" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#E6F7FF]/60">Mensualité (CHF)</Label>
                  <Input type="number" required value={form.monthly_payment} onChange={(e) => handleChange("monthly_payment", parseInt(e.target.value))} className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-monthly" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#E6F7FF]/60">URL de l'image</Label>
                <Input value={form.image_url} onChange={(e) => handleChange("image_url", e.target.value)} placeholder="https://..." className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-image" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#E6F7FF]/60">Badge</Label>
                <Input value={form.badge} onChange={(e) => handleChange("badge", e.target.value)} placeholder="Ex: Neuf, Occasion sélectionnée, Premium" className="bg-[#071A1F]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-10 rounded-lg" data-testid="vehicle-form-badge" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary-easyleaz w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2" data-testid="vehicle-form-submit">
                {saving ? <Loader2 size={18} className="animate-spin" /> : (editing ? "Mettre à jour" : "Ajouter le véhicule")}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="glass-card rounded-xl overflow-hidden" data-testid={`admin-vehicle-${v.id}`}>
            <div className="h-40 bg-[#0E2F36] relative overflow-hidden">
              {v.image_url ? (
                <img src={v.image_url} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-[#22D3EE]/30" /></div>
              )}
              {v.status !== "active" && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs text-red-400 font-inter">Inactif</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-cinzel text-sm font-semibold text-[#E6F7FF] uppercase">{v.brand} {v.model}</h3>
              <p className="font-inter text-xs text-[#E6F7FF]/50 mt-1">{v.year} • {v.mileage?.toLocaleString()} km • CHF {v.price?.toLocaleString()}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(v)} className="flex-1 py-2 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE] font-inter font-medium flex items-center justify-center gap-1 hover:bg-[#22D3EE]/20 transition-colors duration-200" data-testid={`edit-vehicle-${v.id}`}>
                  <Pencil size={12} /> Modifier
                </button>
                <button onClick={() => handleDelete(v.id)} className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-inter hover:bg-red-500/20 transition-colors duration-200" data-testid={`delete-vehicle-${v.id}`}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
