import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleManager } from "@/components/admin/VehicleManager";
import { CMSEditor } from "@/components/admin/CMSEditor";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { CRMStats } from "@/components/admin/CRMStats";
import { Lock, Car, FileEdit, Inbox, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const { API } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState("jwt"); // jwt or legacy
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_jwt");
    if (saved) {
      setToken(saved);
      setAuthenticated(true);
      fetchAdminInfo(saved);
    }
  }, []);

  const fetchAdminInfo = async (t) => {
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      setAdminInfo(res.data);
    } catch {
      // token might be expired
      sessionStorage.removeItem("admin_jwt");
      setAuthenticated(false);
      setToken("");
    }
  };

  const handleJWTLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      setToken(res.data.token);
      setAdminInfo(res.data.admin);
      sessionStorage.setItem("admin_jwt", res.data.token);
      setAuthenticated(true);
    } catch {
      setError("Identifiants incorrects");
    }
  };

  const handleLegacyLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      setToken(res.data.token);
      sessionStorage.setItem("admin_jwt", res.data.token);
      setAuthenticated(true);
      fetchAdminInfo(res.data.token);
    } catch {
      setError("Mot de passe incorrect");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_jwt");
    sessionStorage.removeItem("admin_token");
    setAuthenticated(false);
    setToken("");
    setAdminInfo(null);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#071A1F] flex items-center justify-center px-6" data-testid="admin-login-page">
        <div className="glass-card rounded-3xl p-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center mb-4">
              <Lock size={28} className="text-[#22D3EE]" />
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-[#E6F7FF] tracking-wide uppercase">Administration</h1>
            <p className="font-inter text-sm text-[#E6F7FF]/50 mt-2">CRM EasyLeaz</p>
          </div>

          {/* Toggle login mode */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setLoginMode("jwt")} className={`flex-1 py-2 rounded-lg font-inter text-xs tracking-wide transition-colors duration-200 ${loginMode === "jwt" ? "bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE]" : "bg-[#0E2F36]/30 border border-[#22D3EE]/10 text-[#E6F7FF]/40"}`} data-testid="login-mode-jwt">
              Email & Mot de passe
            </button>
            <button onClick={() => setLoginMode("legacy")} className={`flex-1 py-2 rounded-lg font-inter text-xs tracking-wide transition-colors duration-200 ${loginMode === "legacy" ? "bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE]" : "bg-[#0E2F36]/30 border border-[#22D3EE]/10 text-[#E6F7FF]/40"}`} data-testid="login-mode-legacy">
              Mot de passe simple
            </button>
          </div>

          {loginMode === "jwt" ? (
            <form onSubmit={handleJWTLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-inter text-sm text-[#E6F7FF]/70">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@easyleaz.ch" className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 h-12 rounded-xl" data-testid="admin-email-input" />
              </div>
              <div className="space-y-2">
                <Label className="font-inter text-sm text-[#E6F7FF]/70">Mot de passe</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 h-12 rounded-xl" data-testid="admin-password-input" />
              </div>
              {error && <p className="font-inter text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
              <button type="submit" className="btn-primary-easyleaz w-full py-3 rounded-full font-semibold tracking-wide" data-testid="admin-login-button">Connexion</button>
            </form>
          ) : (
            <form onSubmit={handleLegacyLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-inter text-sm text-[#E6F7FF]/70">Mot de passe</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Entrez le mot de passe" className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 h-12 rounded-xl" data-testid="admin-password-input" />
              </div>
              {error && <p className="font-inter text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
              <button type="submit" className="btn-primary-easyleaz w-full py-3 rounded-full font-semibold tracking-wide" data-testid="admin-login-button">Connexion</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071A1F]" data-testid="admin-dashboard">
      <div className="bg-[#071A1F]/80 backdrop-blur-xl border-b border-[#22D3EE]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#E6F7FF]">EASY LEAZ</a>
            <span className="font-inter text-xs text-[#22D3EE] tracking-widest uppercase bg-[#22D3EE]/10 px-3 py-1 rounded-full">CRM</span>
          </div>
          <div className="flex items-center gap-4">
            {adminInfo && <span className="font-inter text-xs text-[#E6F7FF]/50 hidden md:block">{adminInfo.email}</span>}
            <button onClick={logout} className="flex items-center gap-2 font-inter text-sm text-[#E6F7FF]/60 hover:text-[#E6F7FF] transition-colors duration-300" data-testid="admin-logout-button">
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="bg-[#0E2F36]/50 border border-[#22D3EE]/10 p-1 rounded-xl flex-wrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2" data-testid="admin-tab-dashboard">
              <LayoutDashboard size={16} /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2" data-testid="admin-tab-leads">
              <Inbox size={16} /> Demandes
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2" data-testid="admin-tab-vehicles">
              <Car size={16} /> Véhicules
            </TabsTrigger>
            <TabsTrigger value="cms" className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2" data-testid="admin-tab-cms">
              <FileEdit size={16} /> Contenu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <CRMStats token={token} />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsManager token={token} />
          </TabsContent>
          <TabsContent value="vehicles">
            <VehicleManager token={token} />
          </TabsContent>
          <TabsContent value="cms">
            <CMSEditor token={token} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
