import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import LandingPage from "@/pages/LandingPage";
import AdminDashboard from "@/pages/AdminDashboard";
import CatalogPage from "@/pages/CatalogPage";
import { EasyLocLanding, EasyLocAdmin } from "@/easyloc/EasyLocApp";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AppContext = createContext();

export const useApp = () => useContext(AppContext);

function App() {
  const [cmsData, setCmsData] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCMS = async () => {
    try {
      const res = await axios.get(`${API}/cms`);
      const map = {};
      res.data.forEach(s => { map[s.section_key] = s.content; });
      setCmsData(map);
    } catch (e) {
      console.error("CMS fetch error:", e);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API}/vehicles`);
      setVehicles(res.data);
    } catch (e) {
      console.error("Vehicles fetch error:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await axios.post(`${API}/seed`);
      } catch (e) { /* ignore */ }
      await Promise.all([fetchCMS(), fetchVehicles()]);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AppContext.Provider value={{ cmsData, vehicles, loading, API, fetchCMS, fetchVehicles }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalogue" element={<CatalogPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/easyloc" element={<EasyLocLanding />} />
          <Route path="/easyloc/admin" element={<EasyLocAdmin />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
