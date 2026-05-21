import { useState } from 'react';
import {
  MessageSquare,
  Search,
  BookOpen,
  Star,
  Clock,
  BarChart3,
  Upload,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

import ChatModule from '../../chat/components/ChatModule';
import DocumentSearchModule from '../../documents/components/DocumentSearchModule';
import ProtocolsModule from '../../protocols/components/ProtocolsModule';
import FavoritesModule from '../../favorites/components/FavoritesModule';
import HistoryModule from '../../history/components/HistoryModule';
import AnalyticsModule from '../../analytics/components/AnalyticsModule';

interface DashboardScreenProps {
  onLogout: () => void;
  onOpenDocuments: () => void;
}

export default function DashboardScreen({
  onLogout,
  onOpenDocuments
}: DashboardScreenProps) {
  const [activeMenu, setActiveMenu] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const recentDocuments = [
    {
      name: 'protocolo-uci-2024.pdf',
      status: 'verified',
      badge: 'purple'
    },
    {
      name: 'guia-antibioticos.pdf',
      status: 'verified',
      badge: 'lime'
    },
    {
      name: 'manual-pediatria.pdf',
      status: 'processing',
      badge: 'gray'
    }
  ];

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'purple':
        return {
          backgroundColor: 'rgba(59, 35, 119, 0.1)',
          color: '#3B2377',
          border: '1px solid rgba(59, 35, 119, 0.2)'
        };

      case 'lime':
        return {
          backgroundColor: 'rgba(168, 207, 68, 0.15)',
          color: '#6B8E23',
          border: '1px solid rgba(168, 207, 68, 0.3)'
        };

      case 'gray':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          color: '#717182',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        };

      default:
        return {};
    }
  };

  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const renderModule = () => {
    switch (activeMenu) {
      case 'chat':
        return <ChatModule />;

      case 'search':
        return <DocumentSearchModule />;

      case 'protocols':
        return <ProtocolsModule />;

      case 'favorites':
        return <FavoritesModule />;

      case 'history':
        return <HistoryModule />;

      case 'analytics':
        return <AnalyticsModule />;

      default:
        return <ChatModule />;
    }
  };

  const menuItems = [
    {
      key: 'chat',
      icon: <MessageSquare size={20} />,
      label: 'Chat con IA'
    },
    {
      key: 'search',
      icon: <Search size={20} />,
      label: 'Búsqueda de documentos'
    },
    {
      key: 'protocols',
      icon: <BookOpen size={20} />,
      label: 'Protocolos y guías'
    },
    {
      key: 'favorites',
      icon: <Star size={20} />,
      label: 'Favoritos'
    },
    {
      key: 'history',
      icon: <Clock size={20} />,
      label: 'Historial de consultas'
    },
    {
      key: 'analytics',
      icon: <BarChart3 size={20} />,
      label: 'Análisis y reportes'
    }
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#F7F7F7' }}
    >
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 lg:w-80 flex-shrink-0 flex flex-col fixed lg:relative left-0 top-0 h-full z-40 lg:z-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: '#3B2377',
          color: '#FFFFFF'
        }}
      >
        {/* Logo Section */}
        <div
          className="p-5 lg:p-6 border-b"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 40 40"
                className="w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#00B8B3"
                  strokeWidth="2.5"
                />

                <path
                  d="M20 10 L20 30 M10 20 L30 20"
                  stroke="#00B8B3"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '26px',
                  lineHeight: '1.1'
                }}
              >
                <span style={{ color: '#00B8B3' }}>Clā</span>
                <span>ris</span>
              </h2>
            </div>

            {/* Close button - mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{
                color: 'rgba(255, 255, 255, 0.7)'
              }}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.4'
            }}
          >
            Asistencia Clínica Inteligente
            <br />
            Hospital San Rafael
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => handleMenuSelect(key)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
                style={{
                  backgroundColor:
                    activeMenu === key
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',

                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  fontWeight:
                    activeMenu === key ? '600' : '400',

                  color: '#FFFFFF'
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Panel de Documentos Recientes */}
          <div
            className="mt-6 pt-6 border-t"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <h3 className="px-4 mb-3 text-[12px] font-semibold text-white/60 tracking-wider uppercase">
              Documentos Recientes
            </h3>

            <div className="space-y-2">
              {recentDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="px-4 py-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-start gap-2 mb-2">
                    {doc.status === 'verified' ? (
                      <CheckCircle2
                        size={16}
                        style={{
                          color: '#A8CF44',
                          flexShrink: 0,
                          marginTop: '1px'
                        }}
                      />
                    ) : (
                      <AlertCircle
                        size={16}
                        style={{
                          color: '#717182',
                          flexShrink: 0,
                          marginTop: '1px'
                        }}
                      />
                    )}

                    <p className="text-[13px] leading-tight break-all">
                      {doc.name}
                    </p>
                  </div>

                  <span
                    className="inline-block px-2 py-1 rounded text-[11px] font-medium"
                    style={getBadgeStyles(doc.badge)}
                  >
                    {doc.status === 'verified'
                      ? 'Verificado'
                      : 'Procesando'}
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
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00B8B3]/20 flex-shrink-0">
                <User
                  size={20}
                  style={{ color: '#00B8B3' }}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  Dr. Juan Sandoval
                </p>

                <p className="text-xs text-white/70 truncate">
                  Medicina Interna
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{
            backgroundColor: '#3B2377',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 40 40"
              className="w-7 h-7 flex-shrink-0"
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#00B8B3"
                strokeWidth="2.5"
              />

              <path
                d="M20 10 L20 30 M10 20 L30 20"
                stroke="#00B8B3"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            <h2
              style={{
                fontFamily:
                  "'Cormorant Garamond', serif",
                fontSize: '22px',
                color: '#FFFFFF'
              }}
            >
              <span style={{ color: '#00B8B3' }}>
                Clā
              </span>
              ris
            </h2>
          </div>
        </div>

        {renderModule()}
      </main>
    </div>
  );
}