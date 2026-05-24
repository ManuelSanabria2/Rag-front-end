import { useState } from 'react';
import type { UserRole } from "../../../App";
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
  FileText,
  Menu,
  X,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

import ChatModule from '../../chat/components/ChatModule';
import DocumentSearchModule from '../../documents/components/DocumentSearchModule';
import ProtocolsModule from '../../protocols/components/ProtocolsModule';
import FavoritesModule from '../../favorites/components/FavoritesModule';
import HistoryModule from '../../history/components/HistoryModule';
import AnalyticsModule from '../../analytics/components/AnalyticsModule';
import ClearCacheModule from '../../cache/components/ClearCacheModule';
import { useDocuments } from '../../../hooks/useDocuments';
import { getDocumentViewUrl, deleteDocument } from '../../../services/chatService';

interface DashboardScreenProps {
  role: UserRole;
  onLogout: () => void;
  onOpenDocuments: () => void;
  onOpenAnalytics?: () => void;
  docsRefreshTrigger?: number;
}

export default function DashboardScreen({
  role,
  onLogout,
  onOpenDocuments,
  docsRefreshTrigger,
}: DashboardScreenProps) {
  const [activeMenu, setActiveMenu] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const { documents, loading: docsLoading, refresh: refreshDocs } = useDocuments(docsRefreshTrigger);

  // Los 3 más recientes para la barra lateral (ya vienen ordenados por fecha desc)
  const recentDocuments = documents.slice(0, 3);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const handleDeleteDoc = async (filename: string) => {
    setDeleteError('');
    setDeletingDoc(filename);
    try {
      await deleteDocument(filename);
      refreshDocs();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el documento.');
    } finally {
      setDeletingDoc(null);
    }
  };

  const renderModule = () => {
    switch (activeMenu) {
      case 'chat':
        return <ChatModule docsCount={documents.length} />;

      case 'search':
        return <DocumentSearchModule documents={documents} loading={docsLoading} />;

      case 'protocols':
        return <ProtocolsModule />;

      case 'favorites':
        return <FavoritesModule />;

      case 'history':
        return <HistoryModule />;

      case 'analytics':
        if (role !== 'admin') return <ChatModule />;
        return <AnalyticsModule />;

      case 'cache':
        return <ClearCacheModule />;

      default:
        return <ChatModule />;
    }
  };

  const menuItems = [
    {
      key: 'chat',
      icon: <MessageSquare size={20} />,
      label: 'Chat con IA',
      allowedRoles: ['admin', 'doctor'] as UserRole[],
    },
    {
      key: 'search',
      icon: <Search size={20} />,
      label: 'Búsqueda de documentos',
      allowedRoles: ['admin', 'doctor'] as UserRole[],
    },
    {
      key: 'protocols',
      icon: <BookOpen size={20} />,
      label: 'Protocolos y guías',
      allowedRoles: ['admin', 'doctor'] as UserRole[],
    },
    {
      key: 'favorites',
      icon: <Star size={20} />,
      label: 'Favoritos',
      allowedRoles: ['admin', 'doctor'] as UserRole[],
    },
    {
      key: 'history',
      icon: <Clock size={20} />,
      label: 'Historial de consultas',
      allowedRoles: ['admin', 'doctor'] as UserRole[],
    },
    {
      key: 'analytics',
      icon: <BarChart3 size={20} />,
      label: 'Análisis y reportes',
      allowedRoles: ['admin'] as UserRole[],
    },
    {
      key: 'cache',
      icon: <Trash2 size={20} />,
      label: 'Gestión de caché',
      allowedRoles: ['admin'] as UserRole[],
    },
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
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: '#3B2377', color: '#FFFFFF' }}
      >
        {/* Logo Section */}
        <div
          className="p-5 lg:p-6 border-b"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 40 40" className="w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#00B8B3" strokeWidth="2.5" />
                <path d="M20 10 L20 30 M10 20 L30 20" stroke="#00B8B3" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', lineHeight: '1.1' }}>
                <span style={{ color: '#00B8B3' }}>Clā</span>
                <span>ris</span>
              </h2>
            </div>

            {/* Close button - mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
            Asistencia Clínica Inteligente
            <br />
            Hospital San Rafael
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems
              .filter((item) => item.allowedRoles.includes(role))
              .map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleMenuSelect(key)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
                  style={{
                    backgroundColor: activeMenu === key ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    fontWeight: activeMenu === key ? '600' : '400',
                    color: '#FFFFFF',
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
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="px-4 mb-3 flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-white/60 tracking-wider uppercase">
                Documentos Recientes
              </h3>
              <button
                onClick={refreshDocs}
                disabled={docsLoading}
                title="Actualizar lista de documentos"
                className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                <RotateCcw size={13} className={`text-white/50 ${docsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {deleteError && (
              <div className="mx-4 mb-2 flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-2 text-[11px] text-red-300">
                <AlertTriangle size={12} />
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              {docsLoading && (
                <p className="px-4 text-[12px] text-white/40">Cargando...</p>
              )}

              {!docsLoading && recentDocuments.length === 0 && (
                <p className="px-4 text-[12px] text-white/40">
                  No hay documentos indexados
                </p>
              )}

              {!docsLoading && recentDocuments.map((doc) => (
                <div
                  key={doc.filename}
                  className="group px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => window.open(getDocumentViewUrl(doc.filename), '_blank')}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <FileText size={14} style={{ color: '#A8CF44', flexShrink: 0, marginTop: '2px' }} />
                        <p className="text-[12px] leading-tight break-all text-white/90">
                          {doc.filename}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pl-5">
                        <CheckCircle2 size={10} style={{ color: '#A8CF44' }} />
                        <span className="text-[10px] text-white/50">Indexado</span>
                        <span className="text-[10px] text-white/30 ml-auto">
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                    </button>

                    {role === 'admin' && (
                      <button
                        onClick={() => handleDeleteDoc(doc.filename)}
                        disabled={deletingDoc === doc.filename}
                        title="Eliminar documento"
                        className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/30 disabled:opacity-40"
                      >
                        {deletingDoc === doc.filename
                          ? <RotateCcw size={13} className="text-white/50 animate-spin" />
                          : <Trash2 size={13} className="text-red-400" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {role === 'admin' && (
              <button
                onClick={onOpenDocuments}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2B3777] hover:bg-[#1f2858] transition-all text-white text-sm font-semibold"
              >
                <Upload size={18} />
                Cargar Nuevo Protocolo
              </button>
            )}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00B8B3]/20 flex-shrink-0">
                <User size={20} style={{ color: '#00B8B3' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {role === 'admin' ? 'Admin Hospital' : 'Dr. Juan Sandoval'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {role === 'admin' ? 'Administrador' : 'Medicina Interna'}
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
          style={{ backgroundColor: '#3B2377', borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <svg viewBox="0 0 40 40" className="w-7 h-7 flex-shrink-0">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#00B8B3" strokeWidth="2.5" />
              <path d="M20 10 L20 30 M10 20 L30 20" stroke="#00B8B3" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#FFFFFF' }}>
              <span style={{ color: '#00B8B3' }}>Clā</span>ris
            </h2>
          </div>
        </div>

        {renderModule()}
      </main>
    </div>
  );
}
