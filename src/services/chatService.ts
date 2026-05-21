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
 * El proxy de Vite redirige /api → localhost:8000 en desarrollo.
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
 * El backend los guarda en data_local/ e inicia la indexación en background.
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

  // Invalida el cache para que la próxima consulta traiga la lista actualizada
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
 * Limpia tanto el caché en memoria como el persistente en ChromaDB.
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
