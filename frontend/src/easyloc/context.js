import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/easyloc`;

export const EasyLocContext = createContext();
export const useApp = () => useContext(EasyLocContext);

export function EasyLocProvider({ children }) {
  const [content, setContent] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const [contentRes, vehiclesRes] = await Promise.all([
        axios.get(`${API}/content`),
        axios.get(`${API}/vehicles`),
      ]);
      setContent(contentRes.data);
      setVehicles(vehiclesRes.data);
    } catch (e) {
      console.error("EasyLoc fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="easyloc-scope" data-testid="easyloc-loading">
        <div className="fixed inset-0 bg-[#0A0A0C] flex items-center justify-center z-50 loading-screen">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-[rgba(201,162,39,0.15)] border-t-[#C9A227] rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#C9A227] opacity-10 blur-xl" />
            </div>
            <span className="font-cinzel text-[#FAFAFA] text-sm font-semibold tracking-[0.3em]">EASYLOC</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EasyLocContext.Provider value={{ content, vehicles, API, fetchContent }}>
      {children}
    </EasyLocContext.Provider>
  );
}
