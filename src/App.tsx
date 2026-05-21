import { useState } from "react";
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

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
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
