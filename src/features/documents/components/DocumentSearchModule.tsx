import { useState } from 'react';
import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import type { RagDocument } from '../../../services/chatService';
import { getDocumentViewUrl } from '../../../services/chatService';

// ─── Props ────────────────────────────────────────────────────
interface DocumentSearchModuleProps {
  documents?: RagDocument[];
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

/** Deriva una categoría desde el nombre del archivo. */
function getCategoria(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes('protocolo')) return 'protocolo';
  if (name.includes('guia') || name.includes('guía')) return 'guia';
  if (name.includes('manual')) return 'manual';
  return 'documento';
}

/** Formatea un timestamp Unix (segundos) a fecha legible. */
function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Filtros ──────────────────────────────────────────────────
const FILTROS = [
  { valor: 'todos',     label: 'Todos'      },
  { valor: 'protocolo', label: 'Protocolos' },
  { valor: 'guia',      label: 'Guías'      },
  { valor: 'manual',    label: 'Manuales'   },
  { valor: 'documento', label: 'Otros'      },
];

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function DocumentSearchModule({
  documents = [],
  loading = false,
}: DocumentSearchModuleProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [sortDesc, setSortDesc] = useState(true);

  const resultado = documents
    .filter((d) => d.filename.toLowerCase().includes(busqueda.toLowerCase()))
    .filter((d) => filtro === 'todos' || getCategoria(d.filename) === filtro)
    .slice()
    .sort((a, b) => sortDesc ? b.modified - a.modified : a.modified - b.modified);

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">Hospital San Rafael</p>
              <h1 className="text-2xl font-bold text-[#111827] mt-1">Búsqueda de documentos</h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Encuentra protocolos, guías y manuales clínicos indexados en el sistema RAG.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <FileText size={16} />
              {loading ? '...' : `${resultado.length} documento${resultado.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </section>

        {/* Barra de búsqueda y filtros */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Buscar por nombre de archivo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setSortDesc((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F8FAFC] transition-all"
            >
              <SlidersHorizontal size={16} />
              {sortDesc ? 'Más recientes' : 'Más antiguos'}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filtro === f.valor
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                    : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Resultados */}
        {loading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 shadow-sm flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#2563EB]" />
            <p className="text-[#6B7280] text-sm">Cargando documentos...</p>
          </div>
        ) : resultado.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 shadow-sm text-center">
            <Search size={40} className="mx-auto text-[#D1D5DB] mb-3" />
            <p className="text-[#6B7280] text-sm">
              {documents.length === 0
                ? 'No hay documentos indexados en el sistema RAG. Carga un PDF desde "Cargar Nuevo Protocolo".'
                : 'No se encontraron documentos con ese criterio.'}
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resultado.map((doc) => (
              <DocumentoCard key={doc.filename} doc={doc} />
            ))}
          </section>
        )}

      </div>
    </main>
  );
}

// ─── Tarjeta de documento ──────────────────────────────────────
function DocumentoCard({ doc }: { doc: RagDocument }) {
  const viewUrl = getDocumentViewUrl(doc.filename);

  const handleOpen = () => window.open(viewUrl, '_blank', 'noopener,noreferrer');

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = viewUrl;
    a.download = doc.filename;
    a.click();
  };

  return (
    <div
      onClick={handleOpen}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
          <FileText size={20} className="text-[#2563EB]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate" title={doc.filename}>
            {doc.filename}
          </p>
          <p className="text-xs text-[#6B7280] mt-0.5 capitalize">
            {getCategoria(doc.filename)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#166534]">
          <CheckCircle size={12} />
          Indexado
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
        <div className="text-xs text-[#9CA3AF] space-y-0.5">
          <p>{formatDate(doc.modified)}</p>
          <p>{formatSize(doc.size)}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleDownload}
            title="Descargar"
            className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC] transition-all"
          >
            <Download size={14} className="text-[#9CA3AF]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpen(); }}
            title="Ver documento"
            className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#EFF6FF] transition-all"
          >
            <Eye size={14} className="text-[#2563EB]" />
          </button>
        </div>
      </div>
    </div>
  );
}
