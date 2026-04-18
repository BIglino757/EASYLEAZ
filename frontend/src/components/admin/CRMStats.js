import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Loader2, Users, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export const CRMStats = ({ token }) => {
  const { API } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/leads/stats`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [API, token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#22D3EE]" size={32} /></div>;
  if (!stats) return null;

  const statCards = [
    { label: "Total demandes", value: stats.total, icon: Users, color: "text-[#22D3EE]", bg: "bg-[#22D3EE]/10", border: "border-[#22D3EE]/20" },
    { label: "En attente", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { label: "Approuvées", value: stats.approved, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Refusées", value: stats.rejected, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  ];

  const statusColors = {
    pending: "text-yellow-400",
    approved: "text-green-400",
    rejected: "text-red-400",
  };
  const statusLabels = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };

  return (
    <div data-testid="crm-dashboard">
      <h2 className="font-cinzel text-xl font-bold text-[#E6F7FF] uppercase tracking-wide mb-6">Dashboard CRM</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`glass-card rounded-xl p-6 border ${s.border}`} data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon size={20} className={s.color} />
                </div>
                <TrendingUp size={14} className="text-[#E6F7FF]/20" />
              </div>
              <p className="font-cinzel text-3xl font-bold text-[#E6F7FF]">{s.value}</p>
              <p className="font-inter text-xs text-[#E6F7FF]/40 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Leads */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-cinzel text-sm font-semibold text-[#E6F7FF] uppercase tracking-wide mb-4">Dernières demandes</h3>
        {stats.recent.length === 0 ? (
          <p className="font-inter text-sm text-[#E6F7FF]/40">Aucune demande récente</p>
        ) : (
          <div className="space-y-3">
            {stats.recent.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3 border-b border-[#22D3EE]/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                    <span className="font-inter text-xs font-bold text-[#22D3EE]">{(lead.first_name || "?")[0]}{(lead.last_name || "?")[0]}</span>
                  </div>
                  <div>
                    <p className="font-inter text-sm text-[#E6F7FF]">{lead.first_name} {lead.last_name}</p>
                    <p className="font-inter text-xs text-[#E6F7FF]/40">{lead.desired_vehicle || "Véhicule non spécifié"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-inter text-xs font-medium ${statusColors[lead.status] || "text-[#E6F7FF]/40"}`}>
                    {statusLabels[lead.status] || lead.status}
                  </span>
                  <span className="font-inter text-[10px] text-[#E6F7FF]/25">{new Date(lead.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
