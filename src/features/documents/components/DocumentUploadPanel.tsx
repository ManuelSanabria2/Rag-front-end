import { useEffect, useRef, useState } from 'react';
import {
  Upload, X, FileText, Tag, Hash, Award,
  CheckCircle2, XCircle, Loader2, Trash2, Cpu, Sparkles,
} from 'lucide-react';
import { uploadDocuments, getIndexingStatus } from '../../../services/chatService';

interface DocumentUploadPanelProps {
  onClose: () => void;
  onUploaded?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'indexing' | 'success' | 'error';

// ─── Pantalla de indexación ───────────────────────────────────────────────────
function IndexingScreen({ files, onDone }: { files: string[]; onDone: (ok: boolean, msg: string) => void }) {
  const [dots, setDots] = useState('');
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STEPS = [
    'Cargando modelo de embeddings BAAI/bge-m3...',
    'Extrayendo texto de los PDFs...',
    'Dividiendo en chunks semánticos...',
    'Generando vectores de embeddings...',
    'Guardando en ChromaDB...',
  ];

  useEffect(() => {
    // Animar los puntos suspensivos
    dotTimerRef.current = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);

    // Rotar el texto de pasos cada ~4 segundos
    const stepInterval = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 4000);

    // Empezar polling al backend
    const poll = async () => {
      const status = await getIndexingStatus();
      if (status.status === 'done') {
        onDone(true, status.message);
        return;
      }
      if (status.status === 'error') {
        onDone(false, status.message);
        return;
      }
      timerRef.current = setTimeout(poll, 3000);
    };

    timerRef.current = setTimeout(poll, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dotTimerRef.current) clearInterval(dotTimerRef.current);
      clearInterval(stepInterval);
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      {/* Anillo animado */}
      <div className="relative mb-8">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 184, 179, 0.08)', border: '2px solid rgba(0, 184, 179, 0.2)' }}
        >
          <Cpu size={44} style={{ color: '#00B8B3' }} />
        </div>
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: '#00B8B3', borderRightColor: 'rgba(0,184,179,0.3)' }}
        />
      </div>

      <h3
        className="mb-2 text-2xl font-bold"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2B3777' }}
      >
        Generando embeddings{dots}
      </h3>

      <p className="mb-6 text-sm" style={{ color: '#717182' }}>
        {STEPS[step]}
      </p>

      {/* Archivos en proceso */}
      <div
        className="w-full max-w-sm rounded-xl p-4 mb-6 text-left space-y-2"
        style={{ backgroundColor: 'rgba(43, 55, 119, 0.04)', border: '1px solid rgba(43, 55, 119, 0.1)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#2B3777' }}>
          Documentos en proceso
        </p>
        {files.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <Loader2 size={13} className="animate-spin flex-shrink-0" style={{ color: '#00B8B3' }} />
            <span className="text-sm truncate" style={{ color: '#050A0E' }}>{name}</span>
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: '#AAAAB2' }}>
        Este proceso puede tardar 1–5 minutos según el tamaño de los documentos.<br />
        No cierres esta ventana hasta que la indexación finalice.
      </p>
    </div>
  );
}

// ─── Pantalla de éxito ────────────────────────────────────────────────────────
function SuccessScreen({ files, message, onClose }: { files: string[]; message: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(168, 207, 68, 0.12)', border: '2px solid rgba(168, 207, 68, 0.4)' }}
      >
        <Sparkles size={40} style={{ color: '#6B9C2A' }} />
      </div>

      <h3
        className="mb-2 text-2xl font-bold"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2B3777' }}
      >
        ¡Indexación completada!
      </h3>

      <p className="mb-6 text-sm" style={{ color: '#717182' }}>
        {message || 'Los documentos ya están disponibles para consultas RAG.'}
      </p>

      <div
        className="w-full max-w-sm rounded-xl p-4 mb-8 text-left space-y-2"
        style={{ backgroundColor: 'rgba(168, 207, 68, 0.08)', border: '1px solid rgba(168, 207, 68, 0.3)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#5a7a22' }}>
          Documentos indexados
        </p>
        {files.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: '#6B9C2A' }} />
            <span className="text-sm truncate" style={{ color: '#050A0E' }}>{name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 rounded-xl font-semibold transition-all shadow-sm"
        style={{ backgroundColor: '#00B8B3', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontSize: '15px' }}
      >
        Cerrar
      </button>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function DocumentUploadPanel({ onClose, onUploaded }: DocumentUploadPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [area, setArea] = useState('');
  const [version, setVersion] = useState('');
  const [keywords, setKeywords] = useState('');
  const [confidence, setConfidence] = useState(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    const rejected = Array.from(incoming).length - pdfs.length;
    if (rejected > 0) {
      setStatusMessage(`${rejected} archivo(s) ignorado(s): solo se aceptan PDFs.`);
      setUploadStatus('error');
    }
    if (pdfs.length > 0) {
      setSelectedFiles((prev) => {
        const names = new Set(prev.map((f) => f.name));
        return [...prev, ...pdfs.filter((f) => !names.has(f.name))];
      });
      if (rejected === 0) { setUploadStatus('idle'); setStatusMessage(''); }
    }
  };

  const removeFile = (name: string) =>
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleIndexingDone = (ok: boolean, msg: string) => {
    if (ok) {
      setUploadStatus('success');
      setStatusMessage(msg);
      onUploaded?.();
    } else {
      setUploadStatus('error');
      setStatusMessage(msg || 'Error al generar embeddings.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setUploadStatus('error');
      setStatusMessage('Debes seleccionar al menos un archivo PDF.');
      return;
    }
    setUploadStatus('uploading');
    setStatusMessage('');
    try {
      const result = await uploadDocuments(selectedFiles);
      setProcessedFiles(result.files ?? selectedFiles.map((f) => f.name));
      setSelectedFiles([]);
      setUploadStatus('indexing');
    } catch (err) {
      setUploadStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Error inesperado al subir los documentos.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'indexing';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{ backgroundColor: '#F7F7F7' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-white px-4 sm:px-8 py-4 sm:py-6 border-b flex items-center justify-between gap-4"
          style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
        >
          <h2
            className="text-xl sm:text-3xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', color: '#2B3777' }}
          >
            Gestión de Fuentes Documentales RAG
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: '#717182' }}
            title={isProcessing ? 'Espera a que termine la indexación' : 'Cerrar'}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-8">

          {/* ── FASE 2: Indexando ── */}
          {uploadStatus === 'indexing' && (
            <IndexingScreen files={processedFiles} onDone={handleIndexingDone} />
          )}

          {/* ── FASE 3: Éxito ── */}
          {uploadStatus === 'success' && (
            <SuccessScreen files={processedFiles} message={statusMessage} onClose={onClose} />
          )}

          {/* ── FASE 1 + idle/error: Formulario ── */}
          {uploadStatus !== 'indexing' && uploadStatus !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="bg-white rounded-lg p-6 sm:p-12 border-2 border-dashed transition-all cursor-pointer"
                style={{
                  borderColor: isDragging ? '#00B8B3' : '#2B3777',
                  backgroundColor: isDragging ? 'rgba(0, 184, 179, 0.05)' : '#FFFFFF',
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(43, 55, 119, 0.1)' }}
                  >
                    <Upload size={36} style={{ color: '#2B3777' }} />
                  </div>
                  <h3
                    className="mb-2"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: '600', color: '#050A0E' }}
                  >
                    Arrastre y suelte su protocolo
                  </h3>
                  <p
                    className="mb-4"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#717182' }}
                  >
                    Solo archivos PDF · Tamaño máximo 50 MB por archivo
                  </p>
                  <span
                    className="px-6 py-3 rounded-lg"
                    style={{ backgroundColor: '#2B3777', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: '600' }}
                  >
                    Buscar archivo
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />

              {/* Archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="bg-white rounded-lg p-4 space-y-2" style={{ border: '1px solid #E8E8F0' }}>
                  <p className="text-sm font-semibold mb-3" style={{ color: '#2B3777' }}>
                    {selectedFiles.length} archivo(s) seleccionado(s)
                  </p>
                  {selectedFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: '#F7F7F7' }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} style={{ color: '#2B3777', flexShrink: 0 }} />
                        <span className="text-sm truncate" style={{ color: '#050A0E' }}>{file.name}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: '#717182' }}>{formatSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                        className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} style={{ color: '#B91C1C' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Campos del formulario */}
              <div className="bg-white rounded-lg p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Tag size={18} style={{ color: '#717182' }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '600', color: '#050A0E' }}>
                        Área Médica
                      </span>
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                    >
                      <option value="">Seleccionar área</option>
                      <option value="uci">UCI - Unidad de Cuidados Intensivos</option>
                      <option value="cardiologia">Cardiología</option>
                      <option value="pediatria">Pediatría</option>
                      <option value="medicina-interna">Medicina Interna</option>
                      <option value="cirugia">Cirugía General</option>
                      <option value="neurologia">Neurología</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Hash size={18} style={{ color: '#717182' }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '600', color: '#050A0E' }}>
                        Versión
                      </span>
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="Ej: v2024.1"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <Tag size={18} style={{ color: '#717182' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '600', color: '#050A0E' }}>
                      Palabras Clave de Indexación
                    </span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Ej: acetaminofén, paracetamol, analgésico, dosis, UCI"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <p className="mt-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#717182' }}>
                    Separar con comas. Mejora la precisión de búsqueda RAG.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-3">
                    <Award size={18} style={{ color: '#717182' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '600', color: '#050A0E' }}>
                      Nivel de Confianza Clínica
                    </span>
                    <span
                      className="ml-auto px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: confidence >= 0.8 ? 'rgba(168, 207, 68, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                        color: confidence >= 0.8 ? '#6B8E23' : '#717182',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {confidence.toFixed(2)}
                    </span>
                  </label>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={confidence}
                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: '#00B8B3' }}
                  />
                  <div className="flex justify-between mt-2">
                    <span style={{ fontSize: '12px', color: '#717182' }}>Baja (0.0)</span>
                    <span style={{ fontSize: '12px', color: '#717182' }}>Alta (1.0)</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {uploadStatus === 'error' && (
                <div
                  className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
                  style={{ backgroundColor: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.25)', color: '#B91C1C' }}
                >
                  <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-lg transition-all border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 0, 0, 0.1)', color: '#050A0E', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: '600' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploadStatus === 'uploading' || selectedFiles.length === 0}
                  className="flex-1 px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#00B8B3', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: '600' }}
                >
                  {uploadStatus === 'uploading' ? (
                    <><Loader2 size={20} className="animate-spin" /> Subiendo archivos...</>
                  ) : (
                    <><Upload size={20} /> Indexar Documento{selectedFiles.length > 1 ? 's' : ''}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
