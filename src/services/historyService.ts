// src/services/historyService.ts

const API_URL = "http://localhost:3001";

export type HistoryItem = {
  id: string;
  pregunta: string;
  respuestaResumen: string;

  tipo:
    | "clínica"
    | "documental"
    | "protocolo"
    | "alerta";

  estado:
    | "verificada"
    | "revision"
    | "sin_fuente";

  fuentes: string[];

  usuario: string;
  servicio: string;

  fecha: string;
  hora: string;

  createdAt?: string;
};

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await fetch(
    `${API_URL}/api/history`,
    {
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Error al obtener historial"
    );
  }

  return data.history;
}

export async function deleteHistory(id: string) {
  const response = await fetch(
    `${API_URL}/api/history/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Error al eliminar historial"
    );
  }

  return data;
}