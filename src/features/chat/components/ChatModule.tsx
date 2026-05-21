// src/features/chat/components/ChatModule.tsx

import { useState, useRef, useEffect } from 'react';
import {
  User,
  Send,
  AlertCircle,
  FileText,
  Loader2,
  Bot,
  RefreshCw,
} from 'lucide-react';

import { trackAnalyticsEvent } from '../../../services/analyticsService';

import {
  createRecentSearch,
} from '../../../services/documentSearchService';

import {
  sendMessage,
  generateMessageId,
  type ChatMessage,
  type ChatSource,
} from '../../../services/chatService';

/**
 * Módulo de Chat con IA (ChatModule)
 *
 * Renderiza la interfaz conversacional con la IA asistente.
 * Se conecta a una API de LLM a través del servicio chatService.ts.
 *
 * FUNCIONALIDADES:
 * - Envía las preguntas del usuario a la API del LLM
 * - Muestra las respuestas del LLM en burbujas de chat
 * - Indicador de "escribiendo..." mientras espera la respuesta
 * - Scroll automático al último mensaje
 * - Manejo de errores con opción de reintentar
 * - Muestra fuentes del RAG si la API las devuelve
 */
interface ChatModuleProps {
  docsCount?: number;
}

export default function ChatModule({ docsCount }: ChatModuleProps) {
  // Estado: texto que el usuario está escribiendo en el input
  const [inputText, setInputText] = useState('');

  // Estado: lista de todos los mensajes de la conversación (usuario + IA)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Estado: indica si estamos esperando la respuesta del LLM
  const [isLoading, setIsLoading] = useState(false);

  // Referencia al final del contenedor de mensajes para hacer scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Referencia al input para mantener el foco después de enviar
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automático cada vez que cambian los mensajes o el estado de loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * Envía el mensaje del usuario a la API y agrega la respuesta al chat.
   * Si ocurre un error, muestra un mensaje de error con opción de reintentar.
   */
  const handleSend = async () => {
    const trimmed = inputText.trim();

    if (!trimmed || isLoading) return;

    // 1. Crear el mensaje del usuario y agregarlo al historial
    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    trackAnalyticsEvent(
      'chat_message_sent',
      'Consulta enviada al chat IA',
      {
        question: trimmed,
        messagesBeforeSend: messages.length,
      }
    );

    try {
      // 2. Enviar al LLM a través del servicio
      const response = await sendMessage(trimmed, [
        ...messages,
        userMsg,
      ]);

      // Guardar búsqueda reciente
      await createRecentSearch({
        query: trimmed,
        filters: ['chat-ia'],
        resultsCount: response.sources?.length ?? 0,
      });

      trackAnalyticsEvent(
        'chat_response_received',
        'Respuesta generada por Clāris IA',
        {
          sourcesCount: response.sources?.length ?? 0,
          answerLength: response.content.length,
        }
      );

      // Analytics de fuentes RAG
      response.sources?.forEach((source) => {
        trackAnalyticsEvent(
          'rag_source_used',
          'Fuente RAG consultada',
          {
            document: source.document,
            page: source.page,
            confidence: source.confidence,
          }
        );
      });

      // 3. Crear mensaje del asistente y agregarlo al historial
      const assistantMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);

    } catch (error) {
      trackAnalyticsEvent(
        'chat_error',
        'Error al consultar Clāris IA',
        {
          message:
            error instanceof Error
              ? error.message
              : 'Error desconocido',
        }
      );

      // 4. Mensaje de error
      const errorMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado. Intenta de nuevo.',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);

    } finally {
      setIsLoading(false);

      // Devolver foco al input
      inputRef.current?.focus();
    }
  };

  /**
   * Reintentar último mensaje cuando hubo error
   */
  const handleRetry = async () => {
    // Buscar último mensaje del usuario
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === 'user');

    if (!lastUserMsg) return;

    // Eliminar último error
    setMessages((prev) => {
      const last = prev[prev.length - 1];

      if (last?.isError) {
        return prev.slice(0, -1);
      }

      return prev;
    });

    setIsLoading(true);

    try {
      const historyWithoutError = messages.filter(
        (m) => !m.isError
      );

      const response = await sendMessage(
        lastUserMsg.content,
        historyWithoutError
      );

      // Guardar búsqueda reciente del reintento
      await createRecentSearch({
        query: lastUserMsg.content,
        filters: ['chat-ia', 'reintento'],
        resultsCount: response.sources?.length ?? 0,
      });

      const assistantMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [
        ...prev.filter((m) => !m.isError),
        assistantMsg,
      ]);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado. Intenta de nuevo.',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [
        ...prev.filter((m) => !m.isError),
        errorMsg,
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enter para enviar
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Formatea hora
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* ===== HEADER ===== */}
      <header
        className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5 border-b bg-white flex-shrink-0"
        style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center justify-between gap-3">

          <h1
            className="truncate"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '17px',
              fontWeight: '600',
              color: '#2B3777',
            }}
          >
            <span className="hidden sm:inline">
              Sistema RAG Hospitalario ·
            </span>{' '}
            Clāris
          </h1>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

            {messages.length > 0 && (
              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#717182',
                }}
              >
                {messages.length} mensaje
                {messages.length !== 1 ? 's' : ''}
              </span>
            )}

            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#F7F7F7' }}
            >
              <FileText
                size={15}
                style={{ color: '#717182' }}
              />

              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#717182',
                }}
              >
                {docsCount ?? 0} documento{(docsCount ?? 0) !== 1 ? 's' : ''} indexado{(docsCount ?? 0) !== 1 ? 's' : ''}
              </span>

              <span
                className="sm:hidden"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#717182',
                }}
              >
                {docsCount ?? 0} docs
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== ÁREA DE MENSAJES ===== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">

          {/* Estado vacío */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">

              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0, 184, 179, 0.12), rgba(59, 35, 119, 0.08))',
                  border:
                    '1px solid rgba(0, 184, 179, 0.15)',
                }}
              >
                <Bot
                  size={36}
                  style={{ color: '#00B8B3' }}
                />
              </div>

              <h2
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#2B3777',
                  marginBottom: '8px',
                }}
              >
                ¿En qué puedo ayudarte?
              </h2>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: '#717182',
                  maxWidth: '440px',
                  lineHeight: '1.6',
                }}
              >
                Escribe tu consulta clínica y buscaré
                en los protocolos y documentos del
                hospital para darte una respuesta
                basada en evidencia.
              </p>
              <div className="flex flex-wrap gap-2 mt-8 justify-center">
                {[
                  '¿Dosis de Acetaminofén en adultos?',
                  '¿Protocolo de manejo UCI?',
                  '¿Guía de antibióticos?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInputText(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2 rounded-full transition-all hover:shadow-md"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px',
                      color: '#3B2377',
                      backgroundColor: 'rgba(59, 35, 119, 0.06)',
                      border: '1px solid rgba(59, 35, 119, 0.12)',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* MENSAJES */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-4"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    msg.role === 'user'
                      ? '#3B2377'
                      : '#00B8B3',
                }}
              >
                {msg.role === 'user' ? (
                  <User
                    size={16}
                    style={{ color: '#FFFFFF' }}
                  />
                ) : (
                  <Bot
                    size={16}
                    style={{ color: '#FFFFFF' }}
                  />
                )}
              </div>

              <div className="flex-1 space-y-3">

                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily:
                        "'DM Sans', sans-serif",
                      fontSize: '13px',
                      fontWeight: '600',
                      color:
                        msg.role === 'user'
                          ? '#3B2377'
                          : '#00B8B3',
                    }}
                  >
                    {msg.role === 'user'
                      ? 'Tú'
                      : 'Clāris IA'}
                  </span>

                  <span
                    style={{
                      fontFamily:
                        "'DM Sans', sans-serif",
                      fontSize: '12px',
                      color: '#AAAAB2',
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {msg.isError ? (
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor:
                        'rgba(220, 53, 69, 0.06)',
                      border:
                        '1px solid rgba(220, 53, 69, 0.2)',
                    }}
                  >
                    <div className="flex gap-3 items-start">

                      <AlertCircle
                        size={20}
                        style={{
                          color: '#DC3545',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      />

                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily:
                              "'DM Sans', sans-serif",
                            fontSize: '14px',
                            color: '#DC3545',
                            lineHeight: '1.6',
                          }}
                        >
                          {msg.content}
                        </p>

                        <button
                          onClick={handleRetry}
                          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{
                            backgroundColor: '#DC3545',
                            color: '#FFFFFF',
                            fontFamily:
                              "'DM Sans', sans-serif",
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          <RefreshCw size={14} />
                          Reintentar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor:
                        msg.role === 'assistant'
                          ? 'rgba(0, 184, 179, 0.06)'
                          : '#FFFFFF',
                      border:
                        msg.role === 'assistant'
                          ? '1px solid rgba(0, 184, 179, 0.15)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily:
                          "'DM Sans', sans-serif",
                        fontSize: '15px',
                        color: '#050A0E',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                )}

                {msg.sources &&
                  msg.sources.length > 0 && (
                    <div
                      className="bg-white rounded-lg p-4 shadow-sm"
                      style={{
                        border:
                          '1px solid rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <p
                        className="mb-2"
                        style={{
                          fontFamily:
                            "'DM Sans', sans-serif",
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#717182',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {msg.sources.length === 1
                          ? 'Fuente Consultada'
                          : 'Fuentes Consultadas'}
                      </p>

                      {msg.sources.map(
                        (
                          source: ChatSource,
                          idx: number
                        ) => (
                          <p
                            key={idx}
                            style={{
                              fontFamily:
                                "'JetBrains Mono', monospace",
                              fontSize: '13px',
                              color: '#008A86',
                              lineHeight: '1.6',
                            }}
                          >
                            SOURCE: {source.document}
                            {source.page != null
                              ? ` · p.${source.page}`
                              : ''}
                            {source.confidence != null
                              ? ` · confianza ${source.confidence.toFixed(
                                2
                              )}`
                              : ''}
                          </p>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {/* LOADING */}
          {isLoading && (
            <div className="flex gap-4">

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: '#00B8B3',
                }}
              >
                <Bot
                  size={16}
                  style={{ color: '#FFFFFF' }}
                />
              </div>

              <div className="flex-1">

                <div
                  className="rounded-lg p-4 flex items-center gap-3"
                  style={{
                    backgroundColor:
                      'rgba(0, 184, 179, 0.06)',
                    border:
                      '1px solid rgba(0, 184, 179, 0.15)',
                  }}
                >
                  <Loader2
                    size={18}
                    className="animate-spin"
                    style={{ color: '#00B8B3' }}
                  />

                  <span
                    style={{
                      fontFamily:
                        "'DM Sans', sans-serif",
                      fontSize: '14px',
                      color: '#717182',
                    }}
                  >
                    Consultando documentos y
                    generando respuesta...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ===== INPUT ===== */}
      <div
        className="p-3 sm:p-4 lg:p-6 border-t bg-white flex-shrink-0"
        style={{
          borderColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="max-w-4xl mx-auto">

          <div className="flex gap-2 sm:gap-3">

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) =>
                setInputText(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading
                  ? 'Esperando...'
                  : 'Escribe tu consulta clínica...'
              }
              disabled={isLoading}
              className="flex-1 px-3 sm:px-5 py-3 sm:py-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all min-w-0"
              style={{
                fontFamily:
                  "'DM Sans', sans-serif",
                fontSize: '15px',
                borderColor:
                  'rgba(0, 0, 0, 0.1)',
                backgroundColor: isLoading
                  ? '#EFEFEF'
                  : '#F7F7F7',
                opacity: isLoading ? 0.7 : 1,
              }}
            />

            <button
              onClick={handleSend}
              disabled={
                isLoading || !inputText.trim()
              }
              className="px-3 sm:px-6 py-3 sm:py-4 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm flex-shrink-0"
              style={{
                backgroundColor:
                  isLoading || !inputText.trim()
                    ? '#A0D4D2'
                    : '#00B8B3',
                color: '#FFFFFF',
                fontFamily:
                  "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: '600',
                cursor:
                  isLoading || !inputText.trim()
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {isLoading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <Send size={20} />
              )}

              <span className="hidden sm:inline">
                {isLoading
                  ? 'Enviando...'
                  : 'Enviar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}