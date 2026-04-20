import "./styles.css";
import { EasyLocProvider } from "./context";
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import { useEffect } from "react";

function EasyLocLayout({ children }) {
  // When mounted on EasyLoc pages, add a class on body so global body styles
  // can be (temporarily) overridden by EasyLoc. We rely on .easyloc-scope wrapper.
  useEffect(() => {
    document.body.classList.add("easyloc-body");
    return () => document.body.classList.remove("easyloc-body");
  }, []);

  return (
    <div className="easyloc-scope" data-testid="easyloc-scope">
      {children}
    </div>
  );
}

export function EasyLocLanding() {
  return (
    <EasyLocProvider>
      <EasyLocLayout>
        <LandingPage />
      </EasyLocLayout>
    </EasyLocProvider>
  );
}

export function EasyLocAdmin() {
  return (
    <EasyLocProvider>
      <EasyLocLayout>
        <AdminPage />
      </EasyLocLayout>
    </EasyLocProvider>
  );
}
