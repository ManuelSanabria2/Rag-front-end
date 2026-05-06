import { useState } from 'react';
import { MessageSquare, Search, BookOpen, Star, Clock, BarChart3, Upload, User, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import ChatModule from '../../chat/components/ChatModule';
import DocumentSearchModule from '../../documents/components/DocumentSearchModule';
import ProtocolsModule from '../../protocols/components/ProtocolsModule';
import FavoritesModule from '../../favorites/components/FavoritesModule';
import HistoryModule from '../../history/components/HistoryModule';
import AnalyticsModule from '../../analytics/components/AnalyticsModule';

// Definimos qué "props" (propiedades) va a recibir este componente desde App.tsx
interface DashboardScreenProps {
  onLogout: () => void; // Función a ejecutar cuando el usuario haga clic en "Cerrar sesión"
  onOpenDocuments: () => void; // Función a ejecutar cuando se quiera subir un nuevo documento
}

export default function DashboardScreen({ onLogout, onOpenDocuments }: DashboardScreenProps) {
  // Estado para controlar qué módulo de la barra lateral (sidebar) está activo. Por defecto inicia en 'chat'
  const [activeMenu, setActiveMenu] = useState('chat');

  const recentDocuments = [
    { name: 'protocolo-uci-2024.pdf', status: 'verified', badge: 'purple' },
    { name: 'guia-antibioticos.pdf', status: 'verified', badge: 'lime' },
    { name: 'manual-pediatria.pdf', status: 'processing', badge: 'gray' }
  ];

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'purple':
        return { backgroundColor: 'rgba(59, 35, 119, 0.1)', color: '#3B2377', border: '1px solid rgba(59, 35, 119, 0.2)' };
      case 'lime':
        return { backgroundColor: 'rgba(168, 207, 68, 0.15)', color: '#6B8E23', border: '1px solid rgba(168, 207, 68, 0.3)' };
      case 'gray':
        return { backgroundColor: 'rgba(0, 0, 0, 0.05)', color: '#717182', border: '1px solid rgba(0, 0, 0, 0.1)' };
      default:
        return {};
    }
  };

  // Esta función decide qué vista o componente mostrar en la zona principal
  // basándose en el estado 'activeMenu' (qué botón seleccionó el usuario)
  const renderModule = () => {
    switch (activeMenu) {
      case 'chat':
        return <ChatModule />; // Muestra la pantalla del Chat
      case 'search':
        return <DocumentSearchModule />; // Muestra la pantalla de Documentos
      case 'protocols':
        return <ProtocolsModule />; // Muestra la pantalla de Protocolos
      case 'favorites':
        return <FavoritesModule />; // Muestra la pantalla de Favoritos
      case 'history':
        return <HistoryModule />; // Muestra el Historial
      case 'analytics':
        return <AnalyticsModule />; // Muestra las Analíticas
      default:
        return <ChatModule />; // Por defecto siempre muestra el chat por seguridad
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Sidebar */}
      <aside className="w-80 flex flex-col" style={{ backgroundColor: '#3B2377', color: '#FFFFFF' }}>
        {/* Logo Section */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center gap-3 mb-2">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#00B8B3" strokeWidth="2.5" />
              <path d="M20 10 L20 30 M10 20 L30 20" stroke="#00B8B3" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', lineHeight: '1.1' }}>
                <span style={{ color: '#00B8B3' }}>Clā</span>
                <span>ris</span>
              </h2>
            </div>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
            Asistencia Clínica Inteligente
            <br />
            Hospital San Rafael
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {/* Chat con IA */}
            <button
              onClick={() => setActiveMenu('chat')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{
                backgroundColor: activeMenu === 'chat' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: activeMenu === 'chat' ? '600' : '400',
                color: '#FFFFFF'
              }}
            >
              <MessageSquare size={20} />
              Chat con IA
            </button>

            {/* Búsqueda de documentos */}
            <button
              onClick={() => setActiveMenu('search')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{
                backgroundColor: activeMenu === 'search' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: activeMenu === 'search' ? '600' : '400',
                color: '#FFFFFF'
              }}
            >
              <Search size={20} />
              Búsqueda de documentos
            </button>

            {/* Protocolos y guías */}
            <button
              onClick={() => setActiveMenu('protocols')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{
                backgroundColor: activeMenu === 'protocols' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: activeMenu === 'protocols' ? '600' : '400',
                color: '#FFFFFF'
              }}
            >
              <BookOpen size={20} />
              Protocolos y guías
            </button>

            {/* Favoritos */}
            <button
              onClick={() => setActiveMenu('favorites')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{
                backgroundColor: activeMenu === 'favorites' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: activeMenu === 'favorites' ? '600' : '400',
                color: '#FFFFFF'
              }}
            >
              <Star size={20} />
              Favoritos
            </button>

            {/* Historial de consultas */}
            <button
              onClick={() => setActiveMenu('history')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{
                backgroundColor: activeMenu === 'history' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: activeMenu === 'history' ? '600' : '400',
                color: '#FFFFFF'
              }}
            >
              <Clock size={20} />
              Historial de consultas
            </button>

            {/* Análisis y reportes */}
            <button
              onClick={() => setActiveMenu('analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{
                backgroundColor: activeMenu === 'analytics' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: activeMenu === 'analytics' ? '600' : '400',
                color: '#FFFFFF'
              }}
            >
              <BarChart3 size={20} />
              Análisis y reportes
            </button>
          </div>

          {/* Panel de Documentos */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h3 className="px-4 mb-3 text-[12px] font-semibold text-white/60 tracking-wider uppercase">
              Documentos Recientes
            </h3>

            <div className="space-y-2">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="px-4 py-3 rounded-lg bg-white/5">
                  <div className="flex items-start gap-2 mb-2">
                    {doc.status === 'verified' ? (
                      <CheckCircle2 size={16} style={{ color: '#A8CF44' }} />
                    ) : (
                      <AlertCircle size={16} style={{ color: '#717182' }} />
                    )}
                    <p className="text-[13px] leading-tight">{doc.name}</p>
                  </div>
                  <span className="inline-block px-2 py-1 rounded text-[11px] font-medium" style={getBadgeStyles(doc.badge)}>
                    {doc.status === 'verified' ? 'Verificado' : 'Procesando'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenDocuments}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2B3777] hover:bg-[#1f2858] transition-all text-white text-sm font-semibold"
            >
              <Upload size={18} />
              Cargar Nuevo Protocolo
            </button>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00B8B3]/20">
                <User size={20} style={{ color: '#00B8B3' }} />
              </div>
              <div>
                <p className="text-sm font-semibold">Dr. Juan Sandoval</p>
                <p className="text-xs text-white/70">Medicina Interna</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-lg transition-all" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Área de Contenido Principal */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Aquí es donde se inyecta dinámicamente la pantalla seleccionada */}
        {renderModule()}
      </main>
    </div>
  );
}
