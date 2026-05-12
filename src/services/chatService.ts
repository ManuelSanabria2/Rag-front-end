/**
 * chatService.ts — Conexión con el API RAG del Hospital San Rafael
 *
 * Endpoint: POST /api/v1/conversations/
 *
 * El backend (FastAPI + LangChain) gestiona el historial de conversación
 * de forma interna, identificando cada sesión por el campo `phone_number`.
 * Por eso no necesitamos reenviar el historial desde el frontend.
 *
 * En desarrollo el proxy de Vite redirige /api → http://localhost:8000,
 * evitando problemas de CORS. En producción configura VITE_API_BASE_URL.
 */

/**
 * URL base del API RAG.
 * - Sin VITE_API_BASE_URL → usa proxy de Vite (desarrollo, sin CORS)
 * - Con VITE_API_BASE_URL=https://tu-servidor.com → apunta a producción
 */
const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/conversations/`
  : '/api/v1/conversations/';

/**
 * Identificador único de sesión por pestaña del navegador.
 * Actúa como el `phone_number` que el backend usa para mantener el
 * historial de conversación en su SingletonStore.
 */
const SESSION_ID: string =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ============================================================
// TIPOS
// ============================================================

/** Representa un mensaje en la conversación */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Fuentes consultadas por el RAG (cuando las devuelve la API) */
  sources?: ChatSource[];
  /** Indica si hubo un error al obtener esta respuesta */
  isError?: boolean;
}

/** Fuente documental consultada por el RAG */
export interface ChatSource {
  document: string;
  page?: number;
  confidence?: number;
}

/** Forma exacta de la respuesta de OutputResponse del backend */
interface RagApiResponse {
  phone_number: string;
  query: string;
  response: string;
  status_code: string; // "1000" = respondido con contexto | "1001" = sin información
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

/**
 * Envía una pregunta al servicio RAG y devuelve la respuesta del asistente.
 *
 * El backend administra el historial de la conversación internamente usando
 * SESSION_ID como identificador, así que `conversationHistory` se mantiene
 * en la firma por compatibilidad con ChatModule pero no se envía al servidor.
 */
export async function sendMessage(
  userMessage: string,
  _conversationHistory: ChatMessage[] = []
): Promise<{ content: string; sources?: ChatSource[] }> {

  // Cuerpo que espera el modelo Query del backend
  const body = {
    question: userMessage,
    phone_number: SESSION_ID,
    source: 'local',
  };

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servicio RAG. Verifica que el servidor esté corriendo en http://localhost:8000'
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error del servidor (${response.status}): ${errorText}`);
  }

  const data: RagApiResponse = await response.json();

  // status_code "1001" significa que el backend no encontró información
  // en los documentos indexados. La respuesta ya incluye un mensaje
  // explicativo generado por el LLM, así que la mostramos tal cual.
  return { content: data.response };
}

/**
 * Genera un ID único para cada mensaje del chat.
 */
export function generateMessageId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
