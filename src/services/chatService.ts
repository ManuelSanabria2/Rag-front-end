/**
 * chatService.ts — Servicio de conexión con la API del LLM
 *
 * Este archivo centraliza toda la comunicación con el backend de IA.
 * Para conectar tu LLM, solo necesitas cambiar la constante API_URL
 * y, si es necesario, ajustar los headers o el body del request.
 *
 * INSTRUCCIONES PARA CONECTAR TU API:
 * 1. Cambia API_URL por la URL real de tu backend/LLM.
 * 2. Si tu API necesita un token o API key, agrégalo en los headers.
 * 3. Si el formato del body o la respuesta es diferente, ajusta
 *    las funciones sendMessage() y la extracción del campo de respuesta.
 */

// ============================================================
// CONFIGURACIÓN — Cambia estos valores para conectar tu API
// ============================================================

/** URL base de tu API del LLM. Cambia esto por tu endpoint real. */
const API_URL = 'http://localhost:8000/api/chat';

/** Headers de la petición. Agrega aquí tu API key si es necesario. */
const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  // 'Authorization': 'Bearer TU_API_KEY_AQUI',   // Descomenta si necesitas auth
};

// ============================================================
// TIPOS — Estructura de los mensajes del chat
// ============================================================

/** Representa un mensaje en la conversación */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Si la respuesta incluye fuentes/referencias del RAG, se guardan aquí */
  sources?: ChatSource[];
  /** Indica si hubo un error al obtener esta respuesta */
  isError?: boolean;
}

/** Fuente consultada por el RAG (opcional, depende de tu API) */
export interface ChatSource {
  document: string;
  page?: number;
  confidence?: number;
}

// ============================================================
// FUNCIÓN PRINCIPAL — Enviar mensaje al LLM
// ============================================================

/**
 * Envía un mensaje al LLM y devuelve la respuesta.
 *
 * @param userMessage - El texto que escribió el usuario
 * @param conversationHistory - Historial previo de la conversación (opcional)
 * @returns La respuesta del LLM como texto + fuentes opcionales
 *
 * NOTA: Ajusta el body y la lectura de la respuesta según tu API.
 * Ejemplos comunes de formato de body:
 *
 *   OpenAI-compatible:  { messages: [{ role: "user", content: "..." }] }
 *   LangChain:          { input: "...", chat_history: [...] }
 *   Custom RAG:         { query: "...", context: [...] }
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ content: string; sources?: ChatSource[] }> {

  // Construimos el historial en formato que la mayoría de APIs aceptan
  const history = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Cuerpo de la petición — AJUSTA SEGÚN TU API
  const body = {
    message: userMessage,
    history: history,
    // query: userMessage,          // Alternativa si tu API usa "query"
    // chat_history: history,       // Alternativa si tu API usa "chat_history"
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(body),
    });

    // Si la respuesta HTTP no es exitosa, lanzamos error
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      throw new Error(`Error del servidor (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // ============================================================
    // EXTRACCIÓN DE LA RESPUESTA — Ajusta según el formato de tu API
    // ============================================================
    // Intentamos leer el contenido de varios campos comunes.
    // Tu API puede devolver: { response: "..." }, { answer: "..." },
    // { message: "..." }, { choices: [{ message: { content: "..." } }] }, etc.
    const content =
      data.response ||
      data.answer ||
      data.message ||
      data.content ||
      data.text ||
      data.choices?.[0]?.message?.content ||
      data.result ||
      JSON.stringify(data);

    // Si tu API devuelve fuentes del RAG, extráelas aquí
    const sources: ChatSource[] | undefined = data.sources?.map(
      (s: { document?: string; page?: number; confidence?: number; source?: string }) => ({
        document: s.document || s.source || 'Documento',
        page: s.page,
        confidence: s.confidence,
      })
    );

    return { content, sources };

  } catch (error) {
    // Si es un error de red (API no disponible), damos un mensaje claro
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'No se pudo conectar con el servidor. Verifica que la API esté corriendo en: ' + API_URL
      );
    }
    throw error;
  }
}

/**
 * Genera un ID único para cada mensaje.
 * Usa crypto.randomUUID si está disponible, sino un fallback simple.
 */
export function generateMessageId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
