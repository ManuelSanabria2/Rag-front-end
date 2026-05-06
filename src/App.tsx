import { useState } from 'react';
import LoginScreen from './features/auth/components/LoginScreen';
import DashboardScreen from './features/dashboard/components/DashboardScreen';
import DocumentUploadPanel from './features/documents/components/DocumentUploadPanel';

type Screen = 'login' | 'dashboard' | 'documents';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const handleOpenDocuments = () => {
    setShowDocumentUpload(true);
  };

  const handleCloseDocuments = () => {
    setShowDocumentUpload(false);
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <DashboardScreen onLogout={handleLogout} onOpenDocuments={handleOpenDocuments} />
      {showDocumentUpload && <DocumentUploadPanel onClose={handleCloseDocuments} />}
    </>
  );
}
