// src/services/historyService.ts

const API_URL = "http://localhost:3001";

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      throw new Error("Sesion expirada. Inicia sesion nuevamente.");
    }

    throw new Error(data.message || "Error al procesar historial");
  }

  return data;
}

export type HistoryMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: {
    document: string;
    page?: number;
    confidence?: number;
  }[];
  isError?: boolean;
};

export type HistoryItem = {
  id: string;
  title?: string;
  messages?: HistoryMessage[];
  pregunta: string;
  respuestaResumen: string;
  tipo: "clínica" | "documental" | "protocolo" | "alerta";
  estado: "verificada" | "revision" | "sin_fuente";
  fuentes: string[];
  usuario: string;
  servicio: string;
  fecha: string;
  hora: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_URL}/api/history`, {
    credentials: "include",
  });

  const data = await readApiResponse(response);

  return data.history;
}

export async function createHistory(payload: {
  title: string;
  messages: HistoryMessage[];
}): Promise<HistoryItem> {
  const response = await fetch(`${API_URL}/api/history`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await readApiResponse(response);

  return data.historyItem;
}

export async function updateHistory(
  id: string,
  payload: {
    title: string;
    messages: HistoryMessage[];
  }
): Promise<HistoryItem> {
  const response = await fetch(`${API_URL}/api/history/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await readApiResponse(response);

  return data.historyItem;
}

export async function deleteHistory(id: string) {
  const response = await fetch(`${API_URL}/api/history/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await readApiResponse(response);

  return data;
}
