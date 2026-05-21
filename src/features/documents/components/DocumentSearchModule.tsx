import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  SlidersHorizontal,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";

import type { RagDocument } from "../../../services/chatService";
import { getDocumentViewUrl } from "../../../services/chatService";
import {
  getRecentSearches,
  createRecentSearch,
  deleteRecentSearch,
  type RecentSearch,
} from "../../../services/documentSearchService";

// ─── Props ────────────────────────────────────────────────────
interface DocumentSearchModuleProps {
  documents?: RagDocument[];
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

function getCategoria(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes("protocolo")) return "protocolo";
  if (name.includes("guia") || name.includes("guía")) return "guia";
  if (name.includes("manual")) return "manual";
  return "documento";
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Filtros ──────────────────────────────────────────────────
const FILTROS = [
  { valor: "todos",     label: "Todos"      },
  { valor: "protocolo", label: "Protocolos" },
  { valor: "guia",      label: "Guías"      },
  { valor: "manual",    label: "Manuales"   },
  { valor: "documento", label: "Otros"      },
];

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function DocumentSearchModule({
  documents = [],
  loading = false,
}: DocumentSearchModuleProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [sortDesc, setSortDesc] = useState(true);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [error, setError] = useState("");

  const resultado = useMemo(() => {
    return documents
      .filter((d) => d.filename.toLowerCase().includes(busqueda.toLowerCase()))
      .filter((d) => filtro === "todos" || getCategoria(d.filename) === filtro)
      .slice()
      .sort((a, b) => sortDesc ? b.modified - a.modified : a.modified - b.modified);
  }, [documents, busqueda, filtro, sortDesc]);

  useEffect(() => {
    async function loadRecentSearches() {
      try {
        const searches = await getRecentSearches();
        setRecentSearches(searches);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las búsquedas recientes.");
      }
    }
    loadRecentSearches();
  }, []);

  const guardarBusqueda = async () => {
    const cleanQuery = busqueda.trim();
    if (!cleanQuery) return;
    try {
      const newSearch = await createRecentSearch({
        query: cleanQuery,
        filters: filtro === "todos" ? [] : [filtro],
        resultsCount: resultado.length,
      });
      setRecentSearches((prev) => [
        newSearch,
        ...prev.filter((item) => item.query !== newSearch.query).slice(0, 9),
      ]);
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la búsqueda reciente.");
    }
  };

  const repetirBusqueda = (search: RecentSearch) => {
    setBusqueda(search.query);
    setFiltro(search.filters[0] || "todos");
  };

  const eliminarBusqueda = async (id: string) => {
    try {
      await deleteRecentSearch(id);
      setRecentSearches((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la búsqueda reciente.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-7xl">

        {/* Encabezado */}
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">Hospital San Rafael</p>
              <h1 className="mt-1 text-2xl font-bold text-[#111827]">Búsqueda de documentos</h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Encuentra protocolos, guías y manuales clínicos indexados en el sistema RAG.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <FileText size={16} />
              {loading ? "..." : `${resultado.length} documento${resultado.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Buscar por nombre de archivo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") guardarBusqueda(); }}
                className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <button
              onClick={guardarBusqueda}
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1D4ED8]"
            >
              <Search size={16} />
              Buscar
            </button>
            <button
              onClick={() => setSortDesc((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] transition-all hover:bg-[#F8FAFC]"
            >
              <SlidersHorizontal size={16} />
              {sortDesc ? "Más recientes" : "Más antiguos"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  filtro === f.valor
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Búsquedas recientes */}
        {recentSearches.length > 0 && (
          <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#111827]">Búsquedas recientes</h2>
              <span className="text-sm text-[#6B7280]">
                {recentSearches.length} registro{recentSearches.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm"
                >
                  <button
                    onClick={() => repetirBusqueda(item)}
                    className="flex items-center gap-2 text-[#374151] hover:text-[#2563EB]"
                    title="Repetir búsqueda"
                  >
                    <RotateCcw size={14} />
                    <span>{item.query}</span>
                    <span className="text-xs text-[#9CA3AF]">
                      {item.resultsCount} resultado{item.resultsCount !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <button
                    onClick={() => eliminarBusqueda(item.id)}
                    className="text-[#9CA3AF] transition hover:text-[#991B1B]"
                    title="Eliminar búsqueda"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resultados */}
        {loading ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 shadow-sm flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#2563EB]" />
            <p className="text-[#6B7280] text-sm">Cargando documentos...</p>
          </div>
        ) : resultado.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <Search size={40} className="mx-auto mb-3 text-[#D1D5DB]" />
            <p className="text-sm text-[#6B7280]">
              {documents.length === 0
                ? 'No hay documentos indexados en el sistema RAG. Carga un PDF desde "Cargar Nuevo Protocolo".'
                : "No se encontraron documentos con ese criterio."}
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

  const handleOpen = () => window.open(viewUrl, "_blank", "noopener,noreferrer");

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = viewUrl;
    a.download = doc.filename;
    a.click();
  };

  return (
    <div
      onClick={handleOpen}
      className="cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:border-[#2563EB] hover:shadow-md"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <FileText size={20} className="text-[#2563EB]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#111827]" title={doc.filename}>
            {doc.filename}
          </p>
          <p className="mt-0.5 text-xs capitalize text-[#6B7280]">
            {getCategoria(doc.filename)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-medium text-[#166534]">
          <CheckCircle size={12} />
          Indexado
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
        <div className="space-y-0.5 text-xs text-[#9CA3AF]">
          <p>{formatDate(doc.modified)}</p>
          <p>{formatSize(doc.size)}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleDownload}
            title="Descargar"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] transition-all hover:bg-[#F8FAFC]"
          >
            <Download size={14} className="text-[#9CA3AF]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpen(); }}
            title="Ver documento"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] transition-all hover:bg-[#EFF6FF]"
          >
            <Eye size={14} className="text-[#2563EB]" />
          </button>
        </div>
      </div>
    </div>
  );
}
