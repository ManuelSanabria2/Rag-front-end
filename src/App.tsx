import { useState, useEffect } from "react";
import LoginScreen from "./features/auth/components/LoginScreen";
import DashboardScreen from "./features/dashboard/components/DashboardScreen";
import DocumentUploadPanel from "./features/documents/components/DocumentUploadPanel";

export type UserRole = "admin" | "doctor";

type Screen = "login" | "dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [role, setRole] = useState<UserRole>("doctor");
  const [docsRefreshTrigger, setDocsRefreshTrigger] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Al montar, verifica si hay una cookie de sesion valida para no
  // mandar al usuario al login innecesariamente tras recargar la pagina.
  useEffect(() => {
    fetch("http://localhost:3001/profile", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("no session");
      })
      .then((data) => {
        const userRole = data.user?.role as UserRole | undefined;
        setRole(userRole || "doctor");
        setCurrentScreen("dashboard");
      })
      .catch(() => {
        // Sin sesion valida — mostrar login
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setCurrentScreen("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignorar errores de red al cerrar sesion
    }
    setCurrentScreen("login");
    setShowDocumentUpload(false);
    setRole("doctor");
  };

  const handleOpenDocuments = () => {
    if (role !== "admin") return;
    setShowDocumentUpload(true);
  };

  const handleCloseDocuments = () => {
    setShowDocumentUpload(false);
  };

  if (isCheckingSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#3B2377" }}
      >
        <svg viewBox="0 0 64 64" className="w-16 h-16 animate-pulse">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#00B8B3" strokeWidth="3" />
          <path d="M32 16 L32 48 M16 32 L48 32" stroke="#00B8B3" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (currentScreen === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <DashboardScreen
        role={role}
        onLogout={handleLogout}
        onOpenDocuments={handleOpenDocuments}
        docsRefreshTrigger={docsRefreshTrigger}
      />

      {showDocumentUpload && role === "admin" && (
        <DocumentUploadPanel
          onClose={handleCloseDocuments}
          onUploaded={() => setDocsRefreshTrigger((t) => t + 1)}
        />
      )}
    </>
  );
}

