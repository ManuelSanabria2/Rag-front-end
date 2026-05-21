// src/features/favorites/components/FavoritesModule.tsx

import { useEffect, useMemo, useState } from "react";
import {
  getFavorites,
  deleteFavorite,
  type FavoriteItem,
} from "../../../services/favoriteService";
import {
  Star,
  Search,
  FileText,
  MessageSquare,
  ShieldCheck,
  Eye,
  Download,
  Trash2,
  Tag,
  Filter,
} from "lucide-react";

type FavoritoTipo = "consulta" | "documento" | "protocolo";

const FILTROS = [
  { valor: "todos", label: "Todos" },
  { valor: "consulta", label: "Consultas" },
  { valor: "documento", label: "Documentos" },
  { valor: "protocolo", label: "Protocolos" },
];

const TIPO_CONFIG: Record<
  FavoritoTipo,
  { label: string; icon: React.ReactNode; clases: string }
> = {
  consulta: {
    label: "Consulta",
    icon: <MessageSquare size={13} />,
    clases: "bg-[#EFF6FF] text-[#1E40AF]",
  },
  documento: {
    label: "Documento",
    icon: <FileText size={13} />,
    clases: "bg-[#F3E8FF] text-[#6B21A8]",
  },
  protocolo: {
    label: "Protocolo",
    icon: <ShieldCheck size={13} />,
    clases: "bg-[#ECFDF5] text-[#047857]",
  },
};

export default function FavoritesModule() {
  const [favoritos, setFavoritos] = useState<FavoriteItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [favoritoSeleccionado, setFavoritoSeleccionado] =
    useState<FavoriteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        setError("");

        const data = await getFavorites();

        setFavoritos(data);
        setFavoritoSeleccionado(data[0] || null);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los favoritos.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  const favoritosFiltrados = useMemo(() => {
    return favoritos
      .filter((item) => {
        const texto = `
          ${item.titulo}
          ${item.descripcion}
          ${item.servicio}
          ${item.fuente ?? ""}
          ${item.etiquetas.join(" ")}
        `.toLowerCase();

        return texto.includes(busqueda.toLowerCase());
      })
      .filter((item) => {
        if (filtro === "todos") return true;
        return item.tipo === filtro;
      });
  }, [favoritos, busqueda, filtro]);

  const eliminarFavorito = async (id: string) => {
    try {
      await deleteFavorite(id);

      const updated = favoritos.filter((item) => item.id !== id);

      setFavoritos(updated);

      if (favoritoSeleccionado?.id === id) {
        setFavoritoSeleccionado(updated[0] || null);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el favorito.");
    }
  };

  return (
    <main className="h-screen overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                Biblioteca personal del usuario
              </p>

              <h1 className="mt-1 text-3xl font-bold text-[#111827]">
                Favoritos
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-[#6B7280]">
                Accede rápidamente a consultas, documentos y protocolos clínicos
                guardados como relevantes.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm font-semibold text-[#92400E]">
              <Star size={18} className="fill-[#F59E0B] text-[#F59E0B]" />
              {favoritos.length} favorito{favoritos.length !== 1 ? "s" : ""}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ResumenCard
            icon={<MessageSquare size={20} />}
            title="Consultas guardadas"
            value={favoritos.filter((item) => item.tipo === "consulta").length}
            description="Respuestas IA marcadas como útiles"
          />

          <ResumenCard
            icon={<FileText size={20} />}
            title="Documentos favoritos"
            value={favoritos.filter((item) => item.tipo === "documento").length}
            description="Archivos clínicos destacados"
          />

          <ResumenCard
            icon={<ShieldCheck size={20} />}
            title="Protocolos guardados"
            value={favoritos.filter((item) => item.tipo === "protocolo").length}
            description="Protocolos institucionales clave"
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
                placeholder="Buscar por título, servicio, fuente o etiqueta..."
                className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] transition hover:bg-[#F8FAFC]">
              <Filter size={16} />
              Ordenar
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
                Favoritos guardados
              </h2>

              <span className="text-sm text-[#6B7280]">
                {favoritosFiltrados.length} resultado
                {favoritosFiltrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-10 text-center">
                <p className="text-sm text-[#6B7280]">Cargando favoritos...</p>
              </div>
            ) : favoritosFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-10 text-center">
                <Star size={38} className="mx-auto mb-3 text-[#D1D5DB]" />
                <p className="text-sm text-[#6B7280]">
                  No se encontraron favoritos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {favoritosFiltrados.map((item) => (
                  <FavoritoCard
                    key={item.id}
                    item={item}
                    activo={favoritoSeleccionado?.id === item.id}
                    onSelect={() => setFavoritoSeleccionado(item)}
                    onDelete={() => eliminarFavorito(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            {favoritoSeleccionado ? (
              <DetalleFavorito
                item={favoritoSeleccionado}
                onDelete={() => eliminarFavorito(favoritoSeleccionado.id)}
              />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center text-center">
                <div>
                  <Star size={42} className="mx-auto mb-3 text-[#D1D5DB]" />
                  <p className="text-sm text-[#6B7280]">
                    Selecciona un favorito para ver el detalle.
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
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#F59E0B]">
        {icon}
      </div>

      <p className="text-sm text-[#6B7280]">{title}</p>
      <p className="mt-1 text-3xl font-bold text-[#111827]">{value}</p>
      <p className="mt-2 text-xs text-[#9CA3AF]">{description}</p>
    </div>
  );
}

function FavoritoCard({
  item,
  activo,
  onSelect,
  onDelete,
}: {
  item: FavoriteItem;
  activo: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const tipo = TIPO_CONFIG[item.tipo];

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
        activo
          ? "border-[#2563EB] bg-[#EFF6FF]"
          : "border-[#E5E7EB] bg-white hover:border-[#2563EB]"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tipo.clases}`}
          >
            {tipo.icon}
            {tipo.label}
          </span>

          <h3 className="line-clamp-2 text-sm font-semibold text-[#111827]">
            {item.titulo}
          </h3>
        </div>

        <Star
          size={18}
          className="flex-shrink-0 fill-[#F59E0B] text-[#F59E0B]"
        />
      </div>

      <p className="mb-3 line-clamp-3 text-sm text-[#6B7280]">
        {item.descripcion}
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {item.etiquetas.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-1 text-xs text-[#6B7280]"
          >
            <Tag size={11} />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
        <p className="text-xs text-[#9CA3AF]">{item.fecha}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-[#FEE2E2] hover:text-[#991B1B]"
          title="Quitar de favoritos"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function DetalleFavorito({
  item,
  onDelete,
}: {
  item: FavoriteItem;
  onDelete: () => void;
}) {
  const tipo = TIPO_CONFIG[item.tipo];

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2563EB]">
            Detalle de favorito
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#111827]">
            {item.titulo}
          </h2>
        </div>

        <button
          onClick={onDelete}
          className="rounded-xl border border-[#E5E7EB] p-2 text-[#9CA3AF] transition hover:bg-[#FEE2E2] hover:text-[#991B1B]"
          title="Quitar de favoritos"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${tipo.clases}`}
        >
          {tipo.icon}
          {tipo.label}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-medium text-[#92400E]">
          <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
          Guardado
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#111827]">
            Descripción
          </p>

          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm leading-relaxed text-[#374151]">
            {item.descripcion}
          </div>
        </div>

        {item.fuente && (
          <div>
            <p className="mb-2 text-sm font-semibold text-[#111827]">
              Fuente asociada
            </p>

            <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                  <FileText size={18} />
                </div>

                <p className="truncate text-sm font-medium text-[#111827]">
                  {item.fuente}
                </p>
              </div>

              <div className="flex gap-1">
                <button className="rounded-lg border border-[#E5E7EB] p-1.5 transition hover:bg-[#F8FAFC]">
                  <Eye size={15} className="text-[#9CA3AF]" />
                </button>

                <button className="rounded-lg border border-[#E5E7EB] p-1.5 transition hover:bg-[#F8FAFC]">
                  <Download size={15} className="text-[#9CA3AF]" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-[#111827]">Etiquetas</p>

          <div className="flex flex-wrap gap-2">
            {item.etiquetas.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium text-[#6B7280]"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-[#E5E7EB] pt-5 sm:grid-cols-2">
          <InfoMini label="Servicio" value={item.servicio} />
          <InfoMini label="Fecha guardado" value={item.fecha} />
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