/**
 * chatService.ts — Conexión con el API RAG del Hospital San Rafael
 *
 * Endpoint principal: POST /api/v1/conversations/stream/  (SSE streaming)
 * Endpoint fallback:  POST /api/v1/conversations/         (JSON clásico)
 *
 * Cada pestaña del navegador genera un UUID único (SESSION_UUID) que
 * identifica la sesión en el SingletonStore del RAG. Además, el historial
 * de la conversación activa se envía en cada request para que el RAG
 * tenga contexto correcto incluso tras recargas o al seleccionar una
 * conversación antigua desde el panel de historial.
 */

const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/conversations/`
  : '/api/v1/conversations/';

const STREAM_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/conversations/stream/`
  : '/api/v1/conversations/stream/';

/** UUID único por pestaña — identifica la sesión en el SingletonStore del RAG */
const SESSION_UUID: string =
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
  session_id: string;
  query: string;
  response: string;
  status_code: string; // "1000" = respondido con contexto | "1001" = sin información
}

/** Mensaje condensado que se envía como historial al RAG */
interface RagHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Construye el historial a partir de los mensajes actuales.
 *  Filtra errores y limita a los últimos 20 mensajes (10 intercambios). */
function buildHistory(messages: ChatMessage[]): RagHistoryMessage[] {
  return messages
    .filter((m) => !m.isError)
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));
}

// ============================================================
// STREAMING (función principal usada por handleSend)
// ============================================================

export type StreamEvent =
  | { type: 'chunk'; content: string }
  | { type: 'done'; status_code: string; full_response: string }
  | { type: 'error'; content: string };

/**
 * Envía una pregunta al endpoint SSE y devuelve un async generator
 * que emite eventos conforme el LLM genera tokens.
 * El historial de la conversación activa se incluye en el body para
 * que el RAG mantenga el contexto aunque el servidor se haya reiniciado
 * o se haya seleccionado una conversación antigua.
 */
export async function* streamMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  sessionId?: string,
): AsyncGenerator<StreamEvent> {
  const filteredHistory = buildHistory(conversationHistory);
  const body = {
    question: userMessage,
    session_id: sessionId ?? SESSION_UUID,
    source: 'local',
    history: filteredHistory,
    conversation_history: filteredHistory,
  };

  let response: Response;
  try {
    response = await fetch(STREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servicio RAG. Verifica que el servidor esté corriendo en http://localhost:8000',
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error del servidor (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error('El servidor no devolvió un cuerpo de respuesta para streaming.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Los eventos SSE están separados por \n\n
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const line = part.trim();
        if (line.startsWith('data: ')) {
          const json = line.slice(6).trim();
          if (json) {
            try {
              yield JSON.parse(json) as StreamEvent;
            } catch {
              // ignorar JSON malformado
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================
// SEND CLÁSICO (usado por handleRetry)
// ============================================================

/**
 * Envía una pregunta al endpoint JSON (sin streaming) y devuelve la respuesta.
 * Incluye el historial para que el RAG tenga contexto en reintentos.
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  sessionId?: string,
): Promise<{ content: string; sources?: ChatSource[] }> {
  const filteredHistory = buildHistory(conversationHistory);
  const body = {
    question: userMessage,
    session_id: sessionId ?? SESSION_UUID,
    source: 'local',
    history: filteredHistory,
    conversation_history: filteredHistory,
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
      'No se pudo conectar con el servicio RAG. Verifica que el servidor esté corriendo en http://localhost:8000',
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error del servidor (${response.status}): ${errorText}`);
  }

  const data: RagApiResponse = await response.json();
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

// ============================================================
// DOCUMENTOS
// ============================================================

const DOCS_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DOCS_LIST_URL = `${DOCS_BASE_URL}/api/v1/rag/documents/`;
const UPLOAD_URL    = `${DOCS_BASE_URL}/api/v1/rag/load_documents/`;

const SESSION_DOCS_KEY = 'rag_documents_cache';

export interface RagDocument {
  filename: string;
  size: number;
  modified: number; // Unix timestamp en segundos
}

export interface UploadResult {
  status: string;
  files: string[];
  message: string;
  info: string;
}

/** Elimina el caché de documentos de sessionStorage. */
export function invalidateDocumentsCache(): void {
  sessionStorage.removeItem(SESSION_DOCS_KEY);
}

/**
 * Devuelve la URL para abrir o descargar un PDF desde el servicio RAG.
 */
export function getDocumentViewUrl(filename: string): string {
  return `${DOCS_BASE_URL}/api/v1/rag/documents/${encodeURIComponent(filename)}`;
}

/**
 * Obtiene la lista de PDFs indexados en el RAG.
 * Usa sessionStorage como cache; pasa forceRefresh=true para invalidar.
 */
export async function fetchDocuments(forceRefresh = false): Promise<RagDocument[]> {
  if (!forceRefresh) {
    const cached = sessionStorage.getItem(SESSION_DOCS_KEY);
    if (cached) {
      try { return JSON.parse(cached) as RagDocument[]; } catch { /* ignora */ }
    }
  }

  let response: Response;
  try {
    response = await fetch(DOCS_LIST_URL);
  } catch {
    throw new Error('No se pudo conectar con el servicio RAG. Verifica que el servidor esté corriendo en http://localhost:8000.');
  }

  if (!response.ok) {
    throw new Error(`Error al obtener documentos (${response.status})`);
  }

  const data = await response.json().catch(() => ({ documents: [] }));
  const documents: RagDocument[] = (data as { documents: RagDocument[] }).documents ?? [];
  sessionStorage.setItem(SESSION_DOCS_KEY, JSON.stringify(documents));
  return documents;
}

/**
 * Sube uno o más archivos PDF al servicio RAG.
 */
export async function uploadDocuments(files: File[]): Promise<UploadResult> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  let response: Response;
  try {
    response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  } catch {
    throw new Error('No se pudo conectar con el servicio RAG. Verifica que el servidor esté corriendo en http://localhost:8000.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { detail?: string }).detail || `Error del servidor (${response.status})`);
  }

  invalidateDocumentsCache();
  return data as UploadResult;
}

export interface IndexingStatus {
  status: 'idle' | 'processing' | 'done' | 'error';
  files: string[];
  message: string;
}

/** Consulta el estado actual del proceso de indexación (embeddings). */
export async function getIndexingStatus(): Promise<IndexingStatus> {
  try {
    const response = await fetch(`${DOCS_BASE_URL}/api/v1/rag/indexing_status/`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as IndexingStatus;
  } catch {
    return { status: 'idle', files: [], message: '' };
  }
}

/**
 * Elimina un PDF del servicio RAG (disco + vector store).
 */
export async function deleteDocument(filename: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(
      `${DOCS_BASE_URL}/api/v1/rag/documents/${encodeURIComponent(filename)}`,
      { method: 'DELETE' }
    );
  } catch {
    throw new Error('No se pudo conectar con el servicio RAG.');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { detail?: string }).detail || `Error al eliminar (${response.status})`);
  }

  invalidateDocumentsCache();
}

// ============================================================
// CACHÉ
// ============================================================

const CACHE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/rag/clear_cache/`
  : '/api/v1/rag/clear_cache/';

/**
 * Llama al endpoint DELETE /api/v1/rag/clear_cache/ del servicio RAG.
 */
export async function clearCache(source: string = 'local'): Promise<{ success: boolean; message: string }> {
  let response: Response;
  try {
    response = await fetch(`${CACHE_URL}?source=${source}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error('No se pudo conectar con el servicio RAG. Verifica que el servidor esté corriendo en http://localhost:8000.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Error del servidor (${response.status})`);
  }

  return {
    success: (data as { status?: string }).status === 'success',
    message: (data as { message?: string }).message ?? 'Caché limpiado correctamente.',
  };
}

