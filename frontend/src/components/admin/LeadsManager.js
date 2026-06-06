import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Clock, CheckCircle, XCircle, Search, User, Mail, Phone, Car, MapPin, FileText, Download, Trash2, Calendar, Home, Baby, Briefcase, CreditCard, Flag, Heart, Shield, ChevronLeft, FileDown } from "lucide-react";

const statusConfig = {
  pending: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", icon: Clock, label: "En attente" },
  approved: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: CheckCircle, label: "Approuvé" },
  rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: XCircle, label: "Refusé" },
};

export const LeadsManager = ({ token }) => {
  const { API } = useApp();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeads = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await axios.get(`${API}/leads`, { headers, params });
      setLeads(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [API, token, statusFilter, searchQuery]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/leads/${id}`, { status }, { headers });
      fetchLeads();
      if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, status }));
    } catch (e) { console.error(e); }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Supprimer définitivement cette demande et ses documents ?")) return;
    try {
      await axios.delete(`${API}/leads/${id}`, { headers });
      fetchLeads();
      setDetailOpen(false);
    } catch (e) { console.error(e); }
  };

  const openDetail = async (lead) => {
    try {
      const res = await axios.get(`${API}/leads/${lead.id}`, { headers });
      setSelectedLead(res.data);
      setDetailOpen(true);
    } catch (e) { console.error(e); }
  };

  const downloadDoc = async (leadId, docId, filename) => {
    try {
      const res = await axios.get(
        `${API}/leads/${leadId}/documents/${docId}/download`,
        { headers, responseType: "blob" }
      );
      // Detect JSON error returned as a Blob (when response is 200 with error body — defensive)
      const ct = res.headers["content-type"] || "";
      if (ct.includes("application/json")) {
        const text = await res.data.text();
        try { const j = JSON.parse(text); throw new Error(j.detail || "Téléchargement impossible"); }
        catch (e) { throw e; }
      }
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download error:", e);
      // Try to extract error detail from the blob if response was non-2xx
      let msg = "Erreur lors du téléchargement du document.";
      try {
        if (e.response?.data) {
          const blob = e.response.data;
          if (blob instanceof Blob) {
            const text = await blob.text();
            const j = JSON.parse(text);
            if (j.detail) msg = j.detail;
          }
        }
      } catch (_) { /* keep default */ }
      alert(msg);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      const res = await axios.get(`${API}/leads/export?${params.toString()}`, {
        headers, responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = res.headers["content-disposition"] || "";
      const filename = disposition.match(/filename=(.+)/)?.[1] || "easyleaz_leads.csv";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error("Export error:", e); }
    setExporting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#22D3EE]" size={32} /></div>;

  return (
    <div data-testid="leads-manager">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h2 className="font-cinzel text-xl font-bold text-[#E6F7FF] uppercase tracking-wide">Demandes de leasing</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E6F7FF]/30" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-9 pl-9 w-48 rounded-lg text-sm" data-testid="leads-search" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-9 w-40 rounded-lg text-sm" data-testid="leads-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF]">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvés</SelectItem>
              <SelectItem value="rejected">Refusés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-[#0E2F36]/20 border border-[#22D3EE]/5">
        <span className="font-inter text-xs text-[#E6F7FF]/40 mr-1">Exporter :</span>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-8 w-36 rounded-lg text-xs" placeholder="Du" data-testid="export-date-from" />
        <span className="font-inter text-xs text-[#E6F7FF]/30">au</span>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] h-8 w-36 rounded-lg text-xs" placeholder="Au" data-testid="export-date-to" />
        <button
          onClick={exportCSV}
          disabled={exporting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE] font-inter font-medium hover:bg-[#22D3EE]/20 transition-colors duration-200 disabled:opacity-50"
          data-testid="export-csv-button"
        >
          {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
          Export CSV
        </button>
      </div>

      <span className="font-inter text-xs text-[#E6F7FF]/30 block mb-4">{leads.length} résultat(s)</span>

      {leads.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="font-inter text-[#E6F7FF]/40">Aucune demande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const st = statusConfig[lead.status] || statusConfig.pending;
            const StatusIcon = st.icon;
            const docCount = lead.documents?.length || 0;
            return (
              <div key={lead.id} className="glass-card glass-card-hover rounded-xl p-5 cursor-pointer" onClick={() => openDetail(lead)} data-testid={`lead-row-${lead.id}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#22D3EE]/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-inter text-xs font-bold text-[#22D3EE]">{(lead.first_name || "?")[0]}{(lead.last_name || "?")[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-inter text-sm font-medium text-[#E6F7FF] truncate">{lead.first_name} {lead.last_name}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-inter text-xs text-[#E6F7FF]/40">{lead.email}</span>
                        <span className="font-inter text-xs text-[#E6F7FF]/40">{lead.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {lead.desired_vehicle && <span className="font-inter text-xs text-[#E6F7FF]/30 hidden lg:block">{lead.desired_vehicle}</span>}
                    {docCount > 0 && (
                      <div className="flex items-center gap-1 text-[#E6F7FF]/25">
                        <FileText size={12} />
                        <span className="font-inter text-[10px]">{docCount}</span>
                      </div>
                    )}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${st.bg} ${st.border} border`}>
                      <StatusIcon size={12} className={st.text} />
                      <span className={`font-inter text-xs font-medium ${st.text}`}>{st.label}</span>
                    </div>
                    <span className="font-inter text-[10px] text-[#E6F7FF]/25">{new Date(lead.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#0E2F36] border-[#22D3EE]/20 text-[#E6F7FF] max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="font-cinzel text-lg text-[#E6F7FF] flex items-center gap-3">
                  {selectedLead.first_name} {selectedLead.last_name}
                  {(() => { const st = statusConfig[selectedLead.status] || statusConfig.pending; const Icon = st.icon; return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${st.bg} ${st.border} border ${st.text}`}><Icon size={10} />{st.label}</span>
                  ); })()}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {/* Personal Info */}
                <div>
                  <h4 className="font-cinzel text-xs font-semibold text-[#22D3EE] uppercase tracking-[0.15em] mb-3">Informations personnelles</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <InfoRow icon={User} label="Nom complet" value={`${selectedLead.first_name} ${selectedLead.last_name}`} />
                    <InfoRow icon={Mail} label="Email" value={selectedLead.email} />
                    <InfoRow icon={Phone} label="Téléphone" value={selectedLead.phone} />
                    <InfoRow icon={Calendar} label="Date de naissance" value={selectedLead.birth_date || "—"} />
                    <InfoRow icon={Flag} label="Nationalité" value={selectedLead.nationality || "—"} />
                    <InfoRow icon={Heart} label="État civil" value={selectedLead.marital_status || "—"} />
                    <InfoRow icon={Baby} label="Nombre d'enfants" value={selectedLead.children_count || "—"} />
                    {selectedLead.children_ages && <InfoRow icon={Baby} label="Âge des enfants" value={selectedLead.children_ages} />}
                    <InfoRow icon={MapPin} label="Adresse" value={selectedLead.address || "—"} />
                    {selectedLead.address_since_date && <InfoRow icon={Calendar} label="À cette adresse depuis" value={selectedLead.address_since_date} />}
                    <InfoRow icon={Shield} label="Permis de séjour" value={selectedLead.residence_permit || "—"} />
                    <InfoRow icon={Home} label="Situation logement" value={selectedLead.housing_status || "—"} />
                  </div>
                </div>

                {/* Financial */}
                <div>
                  <h4 className="font-cinzel text-xs font-semibold text-[#22D3EE] uppercase tracking-[0.15em] mb-3">Situation financière</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <InfoRow icon={CreditCard} label="Revenus mensuels bruts" value={selectedLead.monthly_income ? `CHF ${selectedLead.monthly_income}` : (selectedLead.annual_income || "—")} />
                    <InfoRow icon={Briefcase} label="Situation pro." value={selectedLead.professional_status || "—"} />
                    <InfoRow icon={Home} label="Coût logement" value={selectedLead.housing_cost ? `CHF ${selectedLead.housing_cost}/mois` : "—"} />
                    <InfoRow icon={Calendar} label="Date d'embauche" value={selectedLead.employment_date || "—"} />
                  </div>
                </div>

                {/* Vehicle */}
                <div>
                  <h4 className="font-cinzel text-xs font-semibold text-[#22D3EE] uppercase tracking-[0.15em] mb-3">Véhicule</h4>
                  <InfoRow icon={Car} label="Véhicule souhaité" value={selectedLead.desired_vehicle || "—"} />
                </div>

                {/* Documents */}
                {selectedLead.documents && selectedLead.documents.length > 0 && (
                  <div>
                    <h4 className="font-cinzel text-xs font-semibold text-[#22D3EE] uppercase tracking-[0.15em] mb-3">Documents ({selectedLead.documents.length})</h4>
                    <div className="space-y-2">
                      {selectedLead.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-[#071A1F]/50 border border-[#22D3EE]/10 rounded-lg p-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText size={16} className="text-[#22D3EE] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-inter text-sm text-[#E6F7FF]/80 truncate">{doc.original_name}</p>
                              <p className="font-inter text-[10px] text-[#E6F7FF]/30 uppercase">{doc.type === "identity" ? "Pièce d'identité" : "Fiche de paie"}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); downloadDoc(selectedLead.id, doc.id, doc.original_name); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE] font-inter hover:bg-[#22D3EE]/20 transition-colors duration-200 flex-shrink-0"
                            data-testid={`download-doc-${doc.id}`}
                          >
                            <Download size={12} /> Télécharger
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#22D3EE]/10">
                  <button onClick={() => updateStatus(selectedLead.id, "approved")} className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400 font-inter font-medium hover:bg-green-500/20 transition-colors duration-200 flex items-center gap-2" data-testid="detail-approve-btn">
                    <CheckCircle size={14} /> Approuver
                  </button>
                  <button onClick={() => updateStatus(selectedLead.id, "rejected")} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-inter font-medium hover:bg-red-500/20 transition-colors duration-200 flex items-center gap-2" data-testid="detail-reject-btn">
                    <XCircle size={14} /> Refuser
                  </button>
                  <button onClick={() => updateStatus(selectedLead.id, "pending")} className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400 font-inter font-medium hover:bg-yellow-500/20 transition-colors duration-200 flex items-center gap-2" data-testid="detail-pending-btn">
                    <Clock size={14} /> En attente
                  </button>
                  <button onClick={() => deleteLead(selectedLead.id)} className="px-4 py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-sm text-red-400/60 font-inter hover:bg-red-500/15 transition-colors duration-200 flex items-center gap-2 ml-auto" data-testid="detail-delete-btn">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>

                <p className="font-inter text-[10px] text-[#E6F7FF]/20">Soumis le {new Date(selectedLead.created_at).toLocaleString("fr-FR")} • ID: {selectedLead.id}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 py-1.5">
    <Icon size={14} className="text-[#22D3EE]/50 mt-0.5 flex-shrink-0" />
    <div>
      <p className="font-inter text-[10px] text-[#E6F7FF]/30 uppercase tracking-wider">{label}</p>
      <p className="font-inter text-sm text-[#E6F7FF]/80">{value}</p>
    </div>
  </div>
);
