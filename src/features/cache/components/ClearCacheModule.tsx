import { useState } from 'react';
import { Trash2, CheckCircle2, XCircle, DatabaseZap, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import { clearCache } from '../../../services/chatService';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ClearCacheModule() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  const handleClearCache = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const result = await clearCache('local');
      setStatus('success');
      setMessage(result.message);
      setLastCleared(new Date());
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error inesperado al limpiar el caché.');
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="mt-1 text-2xl font-bold text-[#111827]">
            Gestión de Caché
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Administra el caché de respuestas del sistema RAG
          </p>
        </div>

        {/* Info card */}
        <div
          className="rounded-xl p-5 flex gap-4"
          style={{ backgroundColor: 'rgba(0, 184, 179, 0.08)', border: '1px solid rgba(0, 184, 179, 0.25)' }}
        >
          <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#00B8B3' }} />
          <div className="space-y-1 text-sm" style={{ color: '#3B4A6B' }}>
            <p className="font-semibold">¿Qué hace limpiar el caché?</p>
            <ul className="space-y-1 list-disc list-inside" style={{ color: '#555' }}>
              <li>Elimina las respuestas almacenadas en memoria RAM (caché LRU).</li>
              <li>Elimina las respuestas guardadas de forma persistente en ChromaDB.</li>
              <li>Las próximas consultas se procesarán desde cero contra el LLM.</li>
            </ul>
          </div>
        </div>

        {/* Action card */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5" style={{ border: '1px solid #E8E8F0' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(59, 35, 119, 0.08)' }}
            >
              <DatabaseZap size={20} style={{ color: '#3B2377' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>Caché de respuestas RAG</p>
              <p className="text-xs" style={{ color: '#717182' }}>Fuente: local · ChromaDB + memoria</p>
            </div>
          </div>

          {/* Last cleared */}
          {lastCleared && (
            <p className="text-xs" style={{ color: '#717182' }}>
              Último vaciado: <span className="font-medium">{formatDate(lastCleared)}</span>
            </p>
          )}

          {/* Feedback banner */}
          {status === 'success' && (
            <div
              className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(168, 207, 68, 0.12)', border: '1px solid rgba(168, 207, 68, 0.4)', color: '#4A6B1A' }}
            >
              <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#6B9C2A' }} />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div
              className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.25)', color: '#B91C1C' }}
            >
              <XCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Button with confirmation dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3B2377', color: '#FFFFFF' }}
              >
                <Trash2 size={16} />
                {status === 'loading' ? 'Limpiando...' : 'Limpiar Caché'}
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Limpiar el caché del sistema?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todas las respuestas almacenadas en memoria y en ChromaDB.
                  Las próximas consultas serán procesadas directamente por el LLM y pueden tardar más.
                  Esta acción no puede deshacerse.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearCache}
                  style={{ backgroundColor: '#3B2377', color: '#FFFFFF' }}
                >
                  Sí, limpiar caché
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </div>
    </div>
  );
}

