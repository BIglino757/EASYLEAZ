import { useState, useEffect } from "react";
import { useApp } from "@/App";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleManager } from "@/components/admin/VehicleManager";
import { CMSEditor } from "@/components/admin/CMSEditor";
import { RequestsViewer } from "@/components/admin/RequestsViewer";
import { Lock, Car, FileEdit, Inbox, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { API } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      setToken(res.data.token);
      sessionStorage.setItem("admin_token", res.data.token);
      setAuthenticated(true);
    } catch {
      setError("Mot de passe incorrect");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setAuthenticated(false);
    setToken("");
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
            <p className="font-inter text-sm text-[#E6F7FF]/50 mt-2">Accès réservé</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-inter text-sm text-[#E6F7FF]/70">Mot de passe</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
                className="bg-[#0E2F36]/50 border-[#22D3EE]/15 text-[#E6F7FF] placeholder:text-[#E6F7FF]/25 focus:border-[#22D3EE]/60 h-12 rounded-xl"
                data-testid="admin-password-input"
              />
            </div>
            {error && <p className="font-inter text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
            <button
              type="submit"
              className="btn-primary-easyleaz w-full py-3 rounded-full font-semibold tracking-wide"
              data-testid="admin-login-button"
            >
              Connexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071A1F]" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-[#071A1F]/80 backdrop-blur-xl border-b border-[#22D3EE]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#E6F7FF]">EASY LEAZ</a>
            <span className="font-inter text-xs text-[#22D3EE] tracking-widest uppercase bg-[#22D3EE]/10 px-3 py-1 rounded-full">Admin</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 font-inter text-sm text-[#E6F7FF]/60 hover:text-[#E6F7FF] transition-colors duration-300" data-testid="admin-logout-button">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="vehicles" className="space-y-8">
          <TabsList className="bg-[#0E2F36]/50 border border-[#22D3EE]/10 p-1 rounded-xl">
            <TabsTrigger
              value="vehicles"
              className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2"
              data-testid="admin-tab-vehicles"
            >
              <Car size={16} />
              Véhicules
            </TabsTrigger>
            <TabsTrigger
              value="cms"
              className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2"
              data-testid="admin-tab-cms"
            >
              <FileEdit size={16} />
              Contenu (CMS)
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-[#22D3EE]/10 data-[state=active]:text-[#22D3EE] text-[#E6F7FF]/60 rounded-lg px-4 py-2 font-inter text-sm flex items-center gap-2"
              data-testid="admin-tab-requests"
            >
              <Inbox size={16} />
              Demandes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleManager token={token} />
          </TabsContent>
          <TabsContent value="cms">
            <CMSEditor token={token} />
          </TabsContent>
          <TabsContent value="requests">
            <RequestsViewer token={token} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
