// src/features/documents/components/DocumentSearchModule.tsx

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
} from "lucide-react";

import {
  getRecentSearches,
  createRecentSearch,
  deleteRecentSearch,
  type RecentSearch,
} from "../../../services/documentSearchService";

type EstadoDoc = "verificado" | "procesando" | "revision" | "nuevo";

type Documento = {
  id: number;
  nombre: string;
  categoria: string;
  servicio: string;
  estado: EstadoDoc;
  fecha: string;
};

const documentosIniciales: Documento[] = [
  { id: 1, nombre: "protocolo-uci-2024.pdf", categoria: "protocolo", servicio: "UCI", estado: "verificado", fecha: "12 may 2025" },
  { id: 2, nombre: "guia-antibioticos.pdf", categoria: "guia", servicio: "Infectología", estado: "verificado", fecha: "28 abr 2025" },
  { id: 3, nombre: "manual-pediatria.pdf", categoria: "manual", servicio: "Pediatría", estado: "procesando", fecha: "10 may 2025" },
  { id: 4, nombre: "protocolo-cirugia-cardiaca.pdf", categoria: "protocolo", servicio: "Cardiología", estado: "revision", fecha: "5 may 2025" },
  { id: 5, nombre: "guia-anestesia-regional.pdf", categoria: "guia", servicio: "Anestesiología", estado: "verificado", fecha: "1 may 2025" },
  { id: 6, nombre: "formulario-consentimiento.docx", categoria: "manual", servicio: "Administración", estado: "nuevo", fecha: "14 may 2025" },
  { id: 7, nombre: "protocolo-urgencias-covid.pdf", categoria: "protocolo", servicio: "Urgencias", estado: "verificado", fecha: "20 mar 2025" },
  { id: 8, nombre: "indicadores-calidad-2024.xlsx", categoria: "manual", servicio: "Calidad", estado: "verificado", fecha: "3 abr 2025" },
];

type EstadoInfo = { label: string; icon: ReactNode; clases: string };

const ESTADO_CONFIG: Record<EstadoDoc, EstadoInfo> = {
  verificado: { label: "Verificado", icon: <CheckCircle size={12} />, clases: "bg-[#DCFCE7] text-[#166534]" },
  procesando: { label: "Procesando", icon: <Clock size={12} />, clases: "bg-[#FEF3C7] text-[#92400E]" },
  revision: { label: "En revisión", icon: <AlertCircle size={12} />, clases: "bg-[#EFF6FF] text-[#1E40AF]" },
  nuevo: { label: "Nuevo", icon: <FileText size={12} />, clases: "bg-[#F3F4F6] text-[#374151]" },
};

const FILTROS = [
  { valor: "todos", label: "Todos" },
  { valor: "verificado", label: "Verificados" },
  { valor: "procesando", label: "Procesando" },
  { valor: "protocolo", label: "Protocolos" },
  { valor: "guia", label: "Guías" },
  { valor: "manual", label: "Manuales" },
];

export default function DocumentSearchModule() {
  const [docs] = useState<Documento[]>(documentosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [error, setError] = useState("");

  const resultado = useMemo(() => {
    return docs
      .filter((d) =>
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.servicio.toLowerCase().includes(busqueda.toLowerCase())
      )
      .filter((d) => {
        if (filtro === "todos") return true;
        if (filtro === d.estado) return true;
        if (filtro === d.categoria) return true;
        return false;
      });
  }, [docs, busqueda, filtro]);

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
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">
                Hospital San Rafael
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#111827]">
                Búsqueda de documentos
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Encuentra protocolos, guías y manuales clínicos del hospital.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <FileText size={16} />
              {resultado.length} documento{resultado.length !== 1 ? "s" : ""} encontrado
              {resultado.length !== 1 ? "s" : ""}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />

              <input
                type="text"
                placeholder="Buscar por nombre, servicio o palabra clave..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    guardarBusqueda();
                  }
                }}
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

            <button className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] transition-all hover:bg-[#F8FAFC]">
              <SlidersHorizontal size={16} />
              Ordenar
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

        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#111827]">
              Búsquedas recientes
            </h2>
            <span className="text-sm text-[#6B7280]">
              {recentSearches.length} registro{recentSearches.length !== 1 ? "s" : ""}
            </span>
          </div>

          {recentSearches.length === 0 ? (
            <p className="text-sm text-[#6B7280]">
              Todavía no tienes búsquedas recientes.
            </p>
          ) : (
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
          )}
        </section>

        {resultado.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <Search size={40} className="mx-auto mb-3 text-[#D1D5DB]" />
            <p className="text-sm text-[#6B7280]">
              No se encontraron documentos
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resultado.map((doc) => (
              <DocumentoCard key={doc.id} doc={doc} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function DocumentoCard({ doc }: { doc: Documento }) {
  const estado = ESTADO_CONFIG[doc.estado];

  return (
    <div className="cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:border-[#2563EB]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <FileText size={20} className="text-[#2563EB]" />
        </div>

        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold text-[#111827]"
            title={doc.nombre}
          >
            {doc.nombre}
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">{doc.servicio}</p>
        </div>
      </div>

      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${estado.clases}`}
        >
          {estado.icon}
          {estado.label}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
        <p className="text-xs text-[#9CA3AF]">{doc.fecha}</p>

        <div className="flex gap-1">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] transition-all hover:bg-[#F8FAFC]"
          >
            <Download size={14} className="text-[#9CA3AF]" />
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] transition-all hover:bg-[#F8FAFC]"
          >
            <Eye size={14} className="text-[#9CA3AF]" />
          </button>
        </div>
      </div>
    </div>
  );
}