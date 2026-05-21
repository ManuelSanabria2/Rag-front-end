import { useState } from 'react';
import LoginScreen from './features/auth/components/LoginScreen';
import DashboardScreen from './features/dashboard/components/DashboardScreen';
import DocumentUploadPanel from './features/documents/components/DocumentUploadPanel';
import AnalyticsModule from './features/analytics/components/AnalyticsModule';

type Screen = 'login' | 'dashboard' | 'documents' | 'analytics';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setShowDocumentUpload(false);
  };

  const handleOpenDocuments = () => {
    setShowDocumentUpload(true);
  };

  const handleCloseDocuments = () => {
    setShowDocumentUpload(false);
  };

  const handleBackDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleOpenAnalytics = () => {
    setCurrentScreen('analytics');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'analytics') {
    return (
      <>
        <div className="p-4 bg-white border-b border-gray-200">
          <button
            onClick={handleBackDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Volver al dashboard
          </button>
        </div>

        <AnalyticsModule />
      </>
    );
  }

  return (
    <>
      <DashboardScreen
        onLogout={handleLogout}
        onOpenDocuments={handleOpenDocuments}
        onOpenAnalytics={handleOpenAnalytics}
      />

      {showDocumentUpload && (
        <DocumentUploadPanel onClose={handleCloseDocuments} />
      )}
    </>
  );
}