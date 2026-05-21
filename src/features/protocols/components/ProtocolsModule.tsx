import { useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Eye,
  Download,
  CheckCircle,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

import type { RagDocument } from "../../../services/chatService";
import { getDocumentViewUrl } from "../../../services/chatService";
import { useDocuments } from "../../../hooks/useDocuments";

const CATEGORIAS = [
  { valor: "todos",     label: "Todos"      },
  { valor: "protocolo", label: "Protocolos" },
  { valor: "guia",      label: "Guías"      },
  { valor: "manual",    label: "Manuales"   },
];

function getCategoria(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes("protocolo")) return "protocolo";
  if (name.includes("guia") || name.includes("guía")) return "guia";
  if (name.includes("manual")) return "manual";
  return "otro";
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

const CATEGORIA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  protocolo: { bg: "bg-[#ECFDF5]", text: "text-[#047857]", label: "Protocolo" },
  guia:      { bg: "bg-[#EFF6FF]", text: "text-[#1E40AF]", label: "Guía clínica" },
  manual:    { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "Manual" },
  otro:      { bg: "bg-[#F3F4F6]", text: "text-[#374151]", label: "Documento" },
};

export default function ProtocolsModule() {
  const { documents, loading } = useDocuments();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [sortDesc, setSortDesc] = useState(true);

  const resultado = useMemo(() => {
    return documents
      .filter((d) => d.filename.toLowerCase().includes(busqueda.toLowerCase()))
      .filter((d) => categoria === "todos" || getCategoria(d.filename) === categoria)
      .slice()
      .sort((a, b) => sortDesc ? b.modified - a.modified : a.modified - b.modified);
  }, [documents, busqueda, categoria, sortDesc]);

  const totalPorCategoria = useMemo(() => ({
    protocolo: documents.filter((d) => getCategoria(d.filename) === "protocolo").length,
    guia:      documents.filter((d) => getCategoria(d.filename) === "guia").length,
    manual:    documents.filter((d) => getCategoria(d.filename) === "manual").length,
  }), [documents]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-7xl">

        {/* Encabezado */}
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">Hospital San Rafael</p>
              <h1 className="mt-1 text-2xl font-bold text-[#111827]">Protocolos y guías</h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Biblioteca clínica institucional indexada en el sistema RAG.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <BookOpen size={16} />
              {loading ? "..." : `${resultado.length} documento${resultado.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </section>

        {/* Tarjetas resumen */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ResumenCard
            icon={<FileText size={20} />}
            label="Protocolos"
            count={totalPorCategoria.protocolo}
            bg="bg-[#ECFDF5]"
            color="text-[#047857]"
          />
          <ResumenCard
            icon={<BookOpen size={20} />}
            label="Guías clínicas"
            count={totalPorCategoria.guia}
            bg="bg-[#EFF6FF]"
            color="text-[#1E40AF]"
          />
          <ResumenCard
            icon={<FileText size={20} />}
            label="Manuales"
            count={totalPorCategoria.manual}
            bg="bg-[#FEF3C7]"
            color="text-[#92400E]"
          />
        </section>

        {/* Barra de búsqueda y filtros */}
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Buscar por nombre de documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <button
              onClick={() => setSortDesc((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] transition-all hover:bg-[#F8FAFC]"
            >
              <SlidersHorizontal size={16} />
              {sortDesc ? "Más recientes" : "Más antiguos"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c.valor}
                onClick={() => setCategoria(c.valor)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  categoria === c.valor
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Resultados */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-12 shadow-sm">
            <Loader2 size={32} className="animate-spin text-[#2563EB]" />
            <p className="text-sm text-[#6B7280]">Cargando documentos...</p>
          </div>
        ) : resultado.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <BookOpen size={40} className="mx-auto mb-3 text-[#D1D5DB]" />
            <p className="text-sm text-[#6B7280]">
              {documents.length === 0
                ? 'No hay documentos indexados. Carga un PDF desde "Cargar Nuevo Protocolo".'
                : "No se encontraron documentos con ese criterio."}
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.map((doc) => (
              <ProtocolCard key={doc.filename} doc={doc} />
            ))}
          </section>
        )}

      </div>
    </main>
  );
}

function ResumenCard({
  icon, label, count, bg, color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  bg: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#111827]">{count}</p>
    </div>
  );
}

function ProtocolCard({ doc }: { doc: RagDocument }) {
  const viewUrl = getDocumentViewUrl(doc.filename);
  const cat = getCategoria(doc.filename);
  const style = CATEGORIA_STYLES[cat];

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
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
          <BookOpen size={20} className={style.text} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#111827]" title={doc.filename}>
            {doc.filename}
          </p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
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
