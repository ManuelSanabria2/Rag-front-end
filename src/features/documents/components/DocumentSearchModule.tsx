// src/features/documents/components/DocumentSearchModule.tsx

import { useState } from "react";
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
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────
type EstadoDoc = "verificado" | "procesando" | "revision" | "nuevo";

type Documento = {
  id: number;
  nombre: string;
  categoria: string;
  servicio: string;
  estado: EstadoDoc;
  fecha: string;
};

// ─── Datos de ejemplo ─────────────────────────────────────
const documentosIniciales: Documento[] = [
  { id: 1, nombre: "protocolo-uci-2024.pdf",          categoria: "protocolo", servicio: "UCI",            estado: "verificado", fecha: "12 may 2025" },
  { id: 2, nombre: "guia-antibioticos.pdf",          categoria: "guia",      servicio: "Infectología",   estado: "verificado", fecha: "28 abr 2025" },
  { id: 3, nombre: "manual-pediatria.pdf",           categoria: "manual",    servicio: "Pediatría",      estado: "procesando", fecha: "10 may 2025" },
  { id: 4, nombre: "protocolo-cirugia-cardiaca.pdf", categoria: "protocolo", servicio: "Cardiología",    estado: "revision",   fecha: "5 may 2025"  },
  { id: 5, nombre: "guia-anestesia-regional.pdf",    categoria: "guia",      servicio: "Anestesiología", estado: "verificado", fecha: "1 may 2025"  },
  { id: 6, nombre: "formulario-consentimiento.docx", categoria: "manual",    servicio: "Administración", estado: "nuevo",      fecha: "14 may 2025" },
  { id: 7, nombre: "protocolo-urgencias-covid.pdf",  categoria: "protocolo", servicio: "Urgencias",      estado: "verificado", fecha: "20 mar 2025" },
  { id: 8, nombre: "indicadores-calidad-2024.xlsx",  categoria: "manual",    servicio: "Calidad",        estado: "verificado", fecha: "3 abr 2025"  },
];

// ─── Configuración de estados ─────────────────────────────
type EstadoInfo = { label: string; icon: ReactNode; clases: string };

const ESTADO_CONFIG: Record<EstadoDoc, EstadoInfo> = {
  verificado: { label: "Verificado",  icon: <CheckCircle size={12} />, clases: "bg-[#DCFCE7] text-[#166534]" },
  procesando: { label: "Procesando",  icon: <Clock size={12} />,       clases: "bg-[#FEF3C7] text-[#92400E]" },
  revision:   { label: "En revisión", icon: <AlertCircle size={12} />, clases: "bg-[#EFF6FF] text-[#1E40AF]" },
  nuevo:      { label: "Nuevo",       icon: <FileText size={12} />,    clases: "bg-[#F3F4F6] text-[#374151]" },
};

// ─── Filtros ──────────────────────────────────────────────
const FILTROS = [
  { valor: "todos",      label: "Todos"      },
  { valor: "verificado", label: "Verificados" },
  { valor: "procesando", label: "Procesando"  },
  { valor: "protocolo",  label: "Protocolos"  },
  { valor: "guia",       label: "Guías"       },
  { valor: "manual",     label: "Manuales"    },
];

// ─────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function DocumentSearchModule() {
  const [docs]                  = useState<Documento[]>(documentosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro]     = useState("todos");

  const resultado = docs
    .filter((d) =>
      d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.servicio.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((d) => {
      if (filtro === "todos")     return true;
      if (filtro === d.estado)    return true;
      if (filtro === d.categoria) return true;
      return false;
    });

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">
                Hospital San Rafael 
              </p>
              <h1 className="text-2xl font-bold text-[#111827] mt-1">
                Búsqueda de documentos
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Encuentra protocolos, guías y manuales clínicos del hospital.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <FileText size={16} />
              {resultado.length} documento{resultado.length !== 1 ? "s" : ""} encontrado{resultado.length !== 1 ? "s" : ""}
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
                placeholder="Buscar por nombre, servicio o palabra clave..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F8FAFC] transition-all">
              <SlidersHorizontal size={16} />
              Ordenar
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filtro === f.valor
                    ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                    : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Resultados */}
        {resultado.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 shadow-sm text-center">
            <Search size={40} className="mx-auto text-[#D1D5DB] mb-3" />
            <p className="text-[#6B7280] text-sm">No se encontraron documentos</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resultado.map((doc) => (
              <DocumentoCard
                key={doc.id}
                doc={doc}
              />
            ))}
          </section>
        )}

      </div>
    </main>
  );
}

// ─── Tarjeta de documento ─────────────────────────────────
function DocumentoCard({ doc }: { doc: Documento }) {
  const estado = ESTADO_CONFIG[doc.estado];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#2563EB] transition-all cursor-pointer">

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
          <FileText size={20} className="text-[#2563EB]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate" title={doc.nombre}>
            {doc.nombre}
          </p>
          <p className="text-xs text-[#6B7280] mt-0.5">{doc.servicio}</p>
        </div>
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${estado.clases}`}>
          {estado.icon}
          {estado.label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
        <p className="text-xs text-[#9CA3AF]">{doc.fecha}</p>
        <div className="flex gap-1">
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC] transition-all"
          >
            <Download size={14} className="text-[#9CA3AF]" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC] transition-all"
          >
            <Eye size={14} className="text-[#9CA3AF]" />
          </button>
        </div>
      </div>
    </div>
  );
}