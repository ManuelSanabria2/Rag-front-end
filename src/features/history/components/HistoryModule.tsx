// src/features/history/components/HistoryModule.tsx

import { useEffect, useMemo, useState } from "react";
import {
  getHistory,
  deleteHistory,
  type HistoryItem,
} from "../../../services/historyService";
import {
  Clock,
  Search,
  MessageSquare,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  CalendarDays,
  Filter,
} from "lucide-react";

const ESTADO_CONFIG: Record<
  HistoryItem["estado"],
  { label: string; icon: React.ReactNode; clases: string }
> = {
  verificada: {
    label: "Verificada",
    icon: <ShieldCheck size={13} />,
    clases: "bg-[#DCFCE7] text-[#166534]",
  },
  revision: {
    label: "Requiere revisión",
    icon: <AlertTriangle size={13} />,
    clases: "bg-[#FEF3C7] text-[#92400E]",
  },
  sin_fuente: {
    label: "Sin fuente validada",
    icon: <AlertTriangle size={13} />,
    clases: "bg-[#FEE2E2] text-[#991B1B]",
  },
};

const TIPO_CONFIG: Record<
  HistoryItem["tipo"],
  { label: string; clases: string }
> = {
  clínica: {
    label: "Clínica",
    clases: "bg-[#EFF6FF] text-[#1E40AF]",
  },
  documental: {
    label: "Documental",
    clases: "bg-[#F3E8FF] text-[#6B21A8]",
  },
  protocolo: {
    label: "Protocolo",
    clases: "bg-[#ECFDF5] text-[#047857]",
  },
  alerta: {
    label: "Alerta",
    clases: "bg-[#FEF2F2] text-[#B91C1C]",
  },
};

const FILTROS = [
  { valor: "todos", label: "Todas" },
  { valor: "verificada", label: "Verificadas" },
  { valor: "revision", label: "En revisión" },
  { valor: "sin_fuente", label: "Sin fuente" },
];

export default function HistoryModule() {
  const [consultas, setConsultas] = useState<HistoryItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [consultaSeleccionada, setConsultaSeleccionada] =
    useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const history = await getHistory();

        setConsultas(history);
        setConsultaSeleccionada(history[0] || null);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const consultasFiltradas = useMemo(() => {
    return consultas
      .filter((consulta) => {
        const texto = `
          ${consulta.pregunta}
          ${consulta.respuestaResumen}
          ${consulta.servicio}
          ${consulta.usuario}
          ${consulta.fuentes.join(" ")}
        `.toLowerCase();

        return texto.includes(busqueda.toLowerCase());
      })
      .filter((consulta) => {
        if (filtro === "todos") return true;
        return consulta.estado === filtro;
      });
  }, [consultas, busqueda, filtro]);

  const totalVerificadas = consultas.filter(
    (consulta) => consulta.estado === "verificada"
  ).length;

  const totalRevision = consultas.filter(
    (consulta) => consulta.estado === "revision"
  ).length;

  const totalSinFuente = consultas.filter(
    (consulta) => consulta.estado === "sin_fuente"
  ).length;

  const eliminarConsulta = async (id: string) => {
    try {
      await deleteHistory(id);

      const updated = consultas.filter((consulta) => consulta.id !== id);

      setConsultas(updated);

      if (consultaSeleccionada?.id === id) {
        setConsultaSeleccionada(updated[0] || null);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la consulta.");
    }
  };

  return (
    <main className="h-screen overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                Módulo clínico inteligente
              </p>

              <h1 className="mt-1 text-3xl font-bold text-[#111827]">
                Historial de consultas
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-[#6B7280]">
                Revisa las preguntas realizadas al chat IA, respuestas
                generadas, fuentes utilizadas y estado de validación clínica.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]">
              <Download size={18} />
              Exportar historial
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <ResumenCard
            icon={<MessageSquare size={20} />}
            title="Consultas totales"
            value={consultas.length.toString()}
            description="Registros disponibles"
          />

          <ResumenCard
            icon={<ShieldCheck size={20} />}
            title="Verificadas"
            value={totalVerificadas.toString()}
            description="Con fuente documental"
          />

          <ResumenCard
            icon={<AlertTriangle size={20} />}
            title="En revisión"
            value={totalRevision.toString()}
            description="Requieren validación"
          />

          <ResumenCard
            icon={<FileText size={20} />}
            title="Sin fuente"
            value={totalSinFuente.toString()}
            description="Sin documento validado"
          />
        </section>

        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por pregunta, respuesta, servicio, usuario o fuente..."
                className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] transition hover:bg-[#F8FAFC]">
              <Filter size={16} />
              Filtros avanzados
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTROS.map((item) => (
              <button
                key={item.valor}
                onClick={() => setFiltro(item.valor)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  filtro === item.valor
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#111827]">
                Consultas recientes
              </h2>

              <span className="text-sm text-[#6B7280]">
                {consultasFiltradas.length} resultado
                {consultasFiltradas.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-10 text-center">
                <p className="text-sm text-[#6B7280]">
                  Cargando historial...
                </p>
              </div>
            ) : consultasFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-10 text-center">
                <Search size={36} className="mx-auto mb-3 text-[#D1D5DB]" />
                <p className="text-sm text-[#6B7280]">
                  No se encontraron consultas con esos criterios.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultasFiltradas.map((consulta) => (
                  <ConsultaItem
                    key={consulta.id}
                    consulta={consulta}
                    activa={consultaSeleccionada?.id === consulta.id}
                    onSelect={() => setConsultaSeleccionada(consulta)}
                    onEliminar={() => eliminarConsulta(consulta.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            {consultaSeleccionada ? (
              <DetalleConsulta consulta={consultaSeleccionada} />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center text-center">
                <div>
                  <MessageSquare
                    size={40}
                    className="mx-auto mb-3 text-[#D1D5DB]"
                  />
                  <p className="text-sm text-[#6B7280]">
                    Selecciona una consulta para ver el detalle.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ResumenCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
        {icon}
      </div>

      <p className="text-sm text-[#6B7280]">{title}</p>
      <p className="mt-1 text-3xl font-bold text-[#111827]">{value}</p>
      <p className="mt-2 text-xs text-[#9CA3AF]">{description}</p>
    </div>
  );
}

function ConsultaItem({
  consulta,
  activa,
  onSelect,
  onEliminar,
}: {
  consulta: HistoryItem;
  activa: boolean;
  onSelect: () => void;
  onEliminar: () => void;
}) {
  const estado = ESTADO_CONFIG[consulta.estado];
  const tipo = TIPO_CONFIG[consulta.tipo];

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
        activa
          ? "border-[#2563EB] bg-[#EFF6FF]"
          : "border-[#E5E7EB] bg-white hover:border-[#2563EB]"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${estado.clases}`}
            >
              {estado.icon}
              {estado.label}
            </span>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tipo.clases}`}
            >
              {tipo.label}
            </span>
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold text-[#111827]">
            {consulta.pregunta}
          </h3>
        </div>
      </div>

      <p className="mb-3 line-clamp-2 text-sm text-[#6B7280]">
        {consulta.respuestaResumen}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} />
            {consulta.fecha}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            {consulta.hora}
          </span>

          <span>{consulta.servicio}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminar();
          }}
          className="rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-[#FEE2E2] hover:text-[#991B1B]"
          title="Eliminar consulta"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function DetalleConsulta({ consulta }: { consulta: HistoryItem }) {
  const estado = ESTADO_CONFIG[consulta.estado];
  const tipo = TIPO_CONFIG[consulta.tipo];

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#2563EB]">
          Detalle de consulta
        </p>

        <h2 className="mt-1 text-xl font-bold text-[#111827]">
          Registro #{consulta.id}
        </h2>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${estado.clases}`}
        >
          {estado.icon}
          {estado.label}
        </span>

        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${tipo.clases}`}
        >
          {tipo.label}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#111827]">Pregunta</p>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm leading-relaxed text-[#374151]">
            {consulta.pregunta}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-[#111827]">
            Resumen de respuesta IA
          </p>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm leading-relaxed text-[#374151]">
            {consulta.respuestaResumen}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-[#111827]">
            Fuentes consultadas
          </p>

          {consulta.fuentes.length > 0 ? (
            <div className="space-y-2">
              {consulta.fuentes.map((fuente: string) => (
                <div
                  key={fuente}
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                      <FileText size={18} />
                    </div>

                    <p className="truncate text-sm font-medium text-[#111827]">
                      {fuente}
                    </p>
                  </div>

                  <button className="rounded-lg border border-[#E5E7EB] p-1.5 transition hover:bg-[#F8FAFC]">
                    <Eye size={15} className="text-[#9CA3AF]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-5 text-sm text-[#6B7280]">
              No se encontró una fuente documental validada para esta consulta.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-[#E5E7EB] pt-5 sm:grid-cols-2">
          <InfoMini label="Usuario" value={consulta.usuario} />
          <InfoMini label="Servicio" value={consulta.servicio} />
          <InfoMini label="Fecha" value={consulta.fecha} />
          <InfoMini label="Hora" value={consulta.hora} />
        </div>
      </div>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#F8FAFC] p-3">
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}
