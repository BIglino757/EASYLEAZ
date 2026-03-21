import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Loader2, Clock, CheckCircle, XCircle, User, Mail, Phone, Car } from "lucide-react";

export const RequestsViewer = ({ token }) => {
  const { API } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const headers = { "x-admin-token": token };

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/leasing-requests`, { headers });
      setRequests(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [API, token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/leasing-requests/${id}?status=${status}`, {}, { headers });
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  const statusColors = {
    pending: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", icon: Clock, label: "En attente" },
    approved: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: CheckCircle, label: "Approuvé" },
    rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: XCircle, label: "Refusé" },
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#22D3EE]" size={32} /></div>;

  return (
    <div data-testid="requests-viewer">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cinzel text-xl font-bold text-[#E6F7FF] uppercase tracking-wide">Demandes de leasing</h2>
        <span className="font-inter text-sm text-[#E6F7FF]/40">{requests.length} demande(s)</span>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="font-inter text-[#E6F7FF]/40">Aucune demande pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const st = statusColors[req.status] || statusColors.pending;
            const StatusIcon = st.icon;
            return (
              <div key={req.id} className="glass-card rounded-xl p-5" data-testid={`request-${req.id}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${st.bg} ${st.border} border`}>
                        <StatusIcon size={12} className={st.text} />
                        <span className={`font-inter text-xs font-medium ${st.text}`}>{st.label}</span>
                      </div>
                      <span className="font-inter text-xs text-[#E6F7FF]/30">{new Date(req.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-[#22D3EE]/60" />
                        <span className="font-inter text-sm text-[#E6F7FF]">{req.first_name} {req.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-[#22D3EE]/60" />
                        <span className="font-inter text-sm text-[#E6F7FF]/70">{req.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-[#22D3EE]/60" />
                        <span className="font-inter text-sm text-[#E6F7FF]/70">{req.phone}</span>
                      </div>
                      {req.desired_vehicle && (
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-[#22D3EE]/60" />
                          <span className="font-inter text-sm text-[#E6F7FF]/70">{req.desired_vehicle}</span>
                        </div>
                      )}
                    </div>

                    {(req.income || req.professional_status) && (
                      <div className="flex gap-3 flex-wrap">
                        {req.income && <span className="font-inter text-xs text-[#E6F7FF]/40 bg-[#0E2F36]/50 px-2 py-1 rounded">{req.income}</span>}
                        {req.professional_status && <span className="font-inter text-xs text-[#E6F7FF]/40 bg-[#0E2F36]/50 px-2 py-1 rounded">{req.professional_status}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(req.id, "approved")}
                      className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-inter hover:bg-green-500/20 transition-colors duration-200"
                      data-testid={`approve-request-${req.id}`}
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-inter hover:bg-red-500/20 transition-colors duration-200"
                      data-testid={`reject-request-${req.id}`}
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
