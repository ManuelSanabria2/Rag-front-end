import { useState } from 'react';
import LoginScreen from './features/auth/components/LoginScreen';
import DashboardScreen from './features/dashboard/components/DashboardScreen';
import DocumentUploadPanel from './features/documents/components/DocumentUploadPanel';

// Definimos los nombres de las pantallas principales disponibles en la aplicación
type Screen = 'login' | 'dashboard' | 'documents';

export default function App() {
  // Estado: 'currentScreen' guarda la pantalla en la que estamos actualmente
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  
  // Estado: 'showDocumentUpload' controla si se muestra el panel modal para subir documentos
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Función que se ejecuta cuando el usuario inicia sesión correctamente
  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  // Función que se ejecuta cuando el usuario cierra sesión
  const handleLogout = () => {
    setCurrentScreen('login');
  };

  // Muestra la ventana flotante (modal) de carga de documentos
  const handleOpenDocuments = () => {
    setShowDocumentUpload(true);
  };

  // Oculta la ventana flotante (modal) de carga de documentos
  const handleCloseDocuments = () => {
    setShowDocumentUpload(false);
  };

  // Control de Rutas Básico: Si la pantalla actual es 'login', solo mostramos el LoginScreen
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Si no estamos en login, mostramos el Dashboard principal.
  // El fragmento <> ... </> permite renderizar el dashboard y, opcionalmente, el panel flotante
  return (
    <>
      <DashboardScreen onLogout={handleLogout} onOpenDocuments={handleOpenDocuments} />
      {/* Si showDocumentUpload es true, renderizamos el panel. Si es false, no se renderiza. */}
      {showDocumentUpload && <DocumentUploadPanel onClose={handleCloseDocuments} />}
    </>
  );
}
