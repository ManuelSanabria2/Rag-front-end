// src/features/chat/components/ChatModule.tsx

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  AlertCircle,
  Bot,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  User,
} from 'lucide-react';

import { trackAnalyticsEvent } from '../../../services/analyticsService';
import { createRecentSearch } from '../../../services/documentSearchService';
import {
  generateMessageId,
  sendMessage,
  streamMessage,
  type ChatMessage,
  type ChatSource,
} from '../../../services/chatService';
import {
  createHistory,
  deleteHistory,
  getHistory,
  updateHistory,
  type HistoryItem,
  type HistoryMessage,
} from '../../../services/historyService';

export default function ChatModule() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<HistoryItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    async function loadConversations() {
      try {
        setHistoryLoading(true);
        setHistoryError('');
        const history = await getHistory();
        setConversations(history);

        if (history[0]) {
          setActiveConversationId(history[0].id);
          setMessages(toChatMessages(history[0]));
        }
      } catch (error) {
        console.error('No se pudo cargar historial de conversaciones', error);
        setHistoryError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el historial.'
        );
      } finally {
        setHistoryLoading(false);
      }
    }

    loadConversations();
  }, []);

  const toChatMessages = (conversation: HistoryItem): ChatMessage[] => {
    return (conversation.messages ?? []).map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  };

  const toHistoryMessages = (chatMessages: ChatMessage[]): HistoryMessage[] => {
    return chatMessages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp.toISOString()
          : new Date(message.timestamp).toISOString(),
      sources: message.sources,
      isError: message.isError,
    }));
  };

  const getConversationTitle = (chatMessages: ChatMessage[]) => {
    const firstQuestion = chatMessages.find((message) => message.role === 'user')?.content;
    if (!firstQuestion) return 'Nueva conversacion';
    return firstQuestion.length > 58 ? `${firstQuestion.slice(0, 55)}...` : firstQuestion;
  };

  const persistConversation = async (nextMessages: ChatMessage[]) => {
    if (nextMessages.length === 0) return;
    setHistoryError('');

    const payload = {
      title: getConversationTitle(nextMessages),
      messages: toHistoryMessages(nextMessages),
    };

    if (activeConversationId) {
      const updated = await updateHistory(activeConversationId, payload);
      setConversations((prev) => [
        updated,
        ...prev.filter((conversation) => conversation.id !== updated.id),
      ]);
      return;
    }

    const created = await createHistory(payload);
    setActiveConversationId(created.id);
    setConversations((prev) => [created, ...prev]);
  };

  const handleNewConversation = async () => {
    if (activeConversationId && messages.length === 0) {
      inputRef.current?.focus();
      return;
    }

    try {
      setHistoryError('');
      const created = await createHistory({
        title: 'Nueva conversacion',
        messages: [],
      });

      setConversations((prev) => [created, ...prev]);
      setActiveConversationId(created.id);
      setMessages([]);
      setInputText('');
    } catch (error) {
      console.error('No se pudo crear una nueva conversacion', error);
      setHistoryError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la conversación.'
      );
      setActiveConversationId(null);
      setMessages([]);
      setInputText('');
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleSelectConversation = (conversation: HistoryItem) => {
    setActiveConversationId(conversation.id);
    setMessages(toChatMessages(conversation));
    setInputText('');
  };

  const handleDeleteConversation = async (
    conversationId: string,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    try {
      setHistoryError('');
      setDeletingConversationId(conversationId);
      await deleteHistory(conversationId);
      const remaining = conversations.filter(
        (conversation) => conversation.id !== conversationId
      );

      setConversations(remaining);

      if (activeConversationId === conversationId) {
        const nextConversation = remaining[0];
        setActiveConversationId(nextConversation?.id ?? null);
        setMessages(nextConversation ? toChatMessages(nextConversation) : []);
      }
    } catch (error) {
      console.error('No se pudo eliminar la conversacion', error);
      setHistoryError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar la conversación.'
      );
    } finally {
      setDeletingConversationId(null);
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();

    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    // Snapshot del estado actual para construir nextMessages al final
    const baseMessages = messages;

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    trackAnalyticsEvent('chat_message_sent', 'Consulta enviada al chat IA', {
      question: trimmed,
      messagesBeforeSend: messages.length,
    });

    const assistantMsgId = generateMessageId();
    let accContent = '';
    let streamStarted = false;

    try {
      for await (const event of streamMessage(trimmed)) {
        if (event.type === 'chunk') {
          accContent += event.content;
          if (!streamStarted) {
            streamStarted = true;
            setIsLoading(false);
            setStreamingMessageId(assistantMsgId);
            setMessages((prev) => [
              ...prev,
              { id: assistantMsgId, role: 'assistant', content: accContent, timestamp: new Date() },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: accContent } : m
              )
            );
          }
        } else if (event.type === 'error') {
          throw new Error(event.content);
        }
        // 'done' no requiere acción UI — el contenido ya fue acumulado
      }

      setStreamingMessageId(null);

      trackAnalyticsEvent('chat_response_received', 'Respuesta generada por Claris IA', {
        sourcesCount: 0,
        answerLength: accContent.length,
      });

      await createRecentSearch({
        query: trimmed,
        filters: ['chat-ia'],
        resultsCount: 0,
      });

      const finalAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: accContent,
        timestamp: new Date(),
      };

      await persistConversation([...baseMessages, userMsg, finalAssistantMsg]);
    } catch (error) {
      trackAnalyticsEvent('chat_error', 'Error al consultar Claris IA', {
        message: error instanceof Error ? error.message : 'Error desconocido',
      });

      const errorContent =
        error instanceof Error ? error.message : 'Ocurrio un error inesperado. Intenta de nuevo.';

      if (streamStarted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: errorContent, isError: true } : m
          )
        );
        await persistConversation([
          ...baseMessages,
          userMsg,
          { id: assistantMsgId, role: 'assistant', content: errorContent, timestamp: new Date(), isError: true },
        ]);
      } else {
        const errorMsg: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: errorContent,
          timestamp: new Date(),
          isError: true,
        };
        setMessages([...baseMessages, userMsg, errorMsg]);
        await persistConversation([...baseMessages, userMsg, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      inputRef.current?.focus();
    }
  };

  const handleRetry = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

    if (!lastUserMsg) return;

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return last?.isError ? prev.slice(0, -1) : prev;
    });

    setIsLoading(true);

    try {
      const historyWithoutError = messages.filter((m) => !m.isError);
      const response = await sendMessage(lastUserMsg.content, historyWithoutError);

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

      const nextMessages = [...messages.filter((m) => !m.isError), assistantMsg];
      setMessages(nextMessages);
      await persistConversation(nextMessages);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Ocurrio un error inesperado. Intenta de nuevo.',
        timestamp: new Date(),
        isError: true,
      };

      const nextMessages = [...messages.filter((m) => !m.isError), errorMsg];
      setMessages(nextMessages);
      await persistConversation(nextMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      <header
        className="px-3 sm:px-5 lg:px-8 py-3 lg:py-5 border-b bg-white flex-shrink-0"
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
            <span className="hidden sm:inline">Sistema RAG Hospitalario ·</span>{' '}
            Claris
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
                {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
              </span>
            )}

            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#F7F7F7' }}
            >
              <FileText size={15} style={{ color: '#717182' }} />
              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#717182',
                }}
              >
                3 documentos indexados
              </span>
              <span
                className="sm:hidden"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#717182',
                }}
              >
                3 docs
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Área principal: en mobile apila aside arriba + section abajo; en lg+ lado a lado */}
      <div className="flex-1 min-h-0 overflow-hidden p-2 sm:p-3 lg:p-4">
        <div className="w-full grid h-full gap-2 sm:gap-3
          [grid-template-rows:auto_minmax(0,1fr)] grid-cols-1
          lg:[grid-template-rows:minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_280px]
          xl:grid-cols-[minmax(0,1fr)_300px]">

          {/* Panel historial — sube al top en mobile, lado derecho en lg+ */}
          <aside className="order-1 lg:order-2 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm flex flex-col lg:min-h-0">
            <div className="border-b border-[#E5E7EB] px-3 py-2 lg:p-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#008A86]">Conversaciones</p>
                  <p className="hidden lg:block mt-0.5 text-xs text-[#6B7280]">
                    Historial del chat IA
                  </p>
                </div>
                <button
                  onClick={handleNewConversation}
                  className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg bg-[#00B8B3] text-white shadow-sm transition hover:bg-[#008A86]"
                  title="Nueva conversacion"
                  aria-label="Nueva conversacion"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Lista: scroll horizontal en mobile, vertical en lg+ */}
            <div className="overflow-x-auto overflow-y-hidden lg:overflow-x-hidden lg:overflow-y-auto lg:flex-1 lg:min-h-0 p-2 lg:p-3">
              {historyError && (
                <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-2 py-1.5 text-xs leading-5 text-red-600 lg:mb-3 lg:px-3 lg:py-2">
                  {historyError}
                </div>
              )}

              {historyLoading ? (
                <div className="rounded-xl border border-dashed border-[#E5E7EB] p-2 text-xs text-[#717182] lg:p-4 lg:text-sm whitespace-nowrap">
                  Cargando historial...
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E5E7EB] p-2 text-xs text-[#717182] lg:p-4 lg:text-sm whitespace-nowrap">
                  Sin conversaciones guardadas.
                </div>
              ) : (
                <div className="flex flex-row gap-2 lg:flex-col lg:space-y-2 lg:gap-0 min-w-max lg:min-w-0">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelectConversation(conversation);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`group w-[180px] lg:w-auto flex-shrink-0 lg:flex-shrink rounded-xl border p-2 lg:p-3 text-left shadow-sm transition-all ${
                        activeConversationId === conversation.id
                          ? 'border-[#00B8B3] bg-[#F0FCFB] shadow-[0_0_0_1px_rgba(0,184,179,0.08)]'
                          : 'border-[#E5E7EB] bg-white hover:border-[#00B8B3] hover:bg-[#F8FAFC]'
                      }`}
                      title={conversation.title || conversation.pregunta}
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-1.5 lg:mb-2 lg:gap-2">
                        <div className="min-w-0">
                          <div className="mb-0.5 flex items-center gap-1.5 lg:mb-1 lg:gap-2">
                            <span
                              className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                activeConversationId === conversation.id
                                  ? 'bg-[#00B8B3]'
                                  : 'bg-[#D1D5DB]'
                              }`}
                            />
                            <span className="text-[10px] lg:text-[11px] font-medium text-[#6B7280] truncate">
                              {conversation.fecha}
                            </span>
                          </div>
                          <p
                            className={`line-clamp-2 text-xs lg:text-sm font-semibold ${
                              activeConversationId === conversation.id
                                ? 'text-[#008A86]'
                                : 'text-[#111827]'
                            }`}
                          >
                            {conversation.title || conversation.pregunta}
                          </p>
                        </div>

                        <button
                          onClick={(event) =>
                            handleDeleteConversation(conversation.id, event)
                          }
                          disabled={deletingConversationId === conversation.id}
                          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#FEE2E2] hover:text-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50"
                          title="Eliminar conversacion"
                          aria-label="Eliminar conversacion"
                        >
                          {deletingConversationId === conversation.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-1.5 text-[10px] lg:text-xs">
                        <span
                          className={`rounded-full px-1.5 py-0.5 font-medium lg:px-2 lg:py-1 ${
                            activeConversationId === conversation.id
                              ? 'bg-white text-[#008A86]'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {conversation.messages?.length ?? 0} msg
                        </span>
                        <span className="text-[#9CA3AF] truncate ml-1">{conversation.hora}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Panel principal del chat */}
          <section className="order-2 lg:order-1 min-h-0 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm flex flex-col">
            <div className="border-b border-[#E5E7EB] px-3 py-3 lg:px-5 lg:py-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 lg:gap-3">
                  <div className="flex h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E0F7F6] text-[#00B8B3]">
                    <Bot size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      Chat con IA clinica
                    </p>
                    <p className="hidden sm:block text-xs text-[#6B7280]">
                      Respuestas basadas en documentos indexados
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm text-[#6B7280] sm:flex flex-shrink-0">
                  <MessageSquare size={15} />
                  {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
              <div className="w-full space-y-4 sm:space-y-5">
                {messages.length === 0 && !isLoading && (
                  <EmptyState setInputText={setInputText} inputRef={inputRef} />
                )}

                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    formatTime={formatTime}
                    onRetry={handleRetry}
                    isStreaming={msg.id === streamingMessageId}
                  />
                ))}

                {isLoading && <LoadingMessage />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] bg-white p-2 sm:p-3 lg:p-4 flex-shrink-0">
              <div className="flex gap-2 sm:gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? 'Esperando...' : 'Escribe tu consulta clinica...'}
                  disabled={isLoading}
                  className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5 sm:px-4 sm:py-3 text-[14px] sm:text-[15px] shadow-sm transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-70"
                />

                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputText.trim()}
                  className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      isLoading || !inputText.trim() ? '#A0D4D2' : '#00B8B3',
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  <span className="hidden sm:inline">
                    {isLoading ? 'Enviando...' : 'Enviar'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  setInputText,
  inputRef,
}: {
  setInputText: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="flex min-h-[260px] sm:min-h-[360px] flex-col items-center justify-center text-center px-2">
      <div className="mb-4 sm:mb-6 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-[#BDEBE9] bg-[#EAFBF9] text-[#00B8B3]">
        <Bot size={28} className="sm:hidden" />
        <Bot size={36} className="hidden sm:block" />
      </div>

      <h2 className="mb-2 text-xl sm:text-2xl font-semibold text-[#2B3777]">
        En que puedo ayudarte?
      </h2>

      <p className="max-w-xl text-[14px] sm:text-[15px] leading-6 sm:leading-7 text-[#6B7280]">
        Escribe tu consulta clinica y buscare en los protocolos y documentos del
        hospital para darte una respuesta basada en evidencia.
      </p>

      <div className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-2">
        {[
          'Dosis de Acetaminofen en adultos',
          'Protocolo de manejo UCI',
          'Guia de antibioticos',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setInputText(`¿${suggestion}?`);
              inputRef.current?.focus();
            }}
            className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[#3B2377] transition hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-sm"
          >
            ¿{suggestion}?
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  formatTime,
  onRetry,
  isStreaming = false,
}: {
  msg: ChatMessage;
  formatTime: (date: Date) => string;
  onRetry: () => void;
  isStreaming?: boolean;
}) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'order-2' : ''
        }`}
        style={{ backgroundColor: isUser ? '#3B2377' : '#00B8B3' }}
      >
        {isUser ? (
          <User size={16} style={{ color: '#FFFFFF' }} />
        ) : (
          <Bot size={16} style={{ color: '#FFFFFF' }} />
        )}
      </div>

      <div className={`min-w-0 max-w-[92%] sm:max-w-[85%] space-y-2 sm:space-y-3 ${isUser ? 'order-1' : ''}`}>
        <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : ''}`}>
          <span
            className="text-sm font-semibold"
            style={{ color: isUser ? '#3B2377' : '#00B8B3' }}
          >
            {isUser ? 'Tu' : 'Claris IA'}
          </span>
          <span className="text-xs text-[#9CA3AF]">{formatTime(msg.timestamp)}</span>
        </div>

        {msg.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="text-sm leading-6 text-red-600">{msg.content}</p>
                <button
                  onClick={onRetry}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={14} />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl border px-4 py-3 shadow-sm ${
              isUser
                ? 'rounded-tr-md border-[#D8D1EA] bg-[#F7F4FF]'
                : 'rounded-tl-md border-[#BDEBE9] bg-[#F0FCFB]'
            }`}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#111827]">
              {msg.content}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle bg-[#00B8B3] animate-pulse" />
              )}
            </p>
          </div>
        )}

        {msg.sources && msg.sources.length > 0 && (
          <SourceList sources={msg.sources} />
        )}
      </div>
    </div>
  );
}

function SourceList({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="rounded-2xl border border-[#BDEBE9] bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#008A86]">
        {sources.length === 1 ? 'Fuente consultada' : 'Fuentes consultadas'}
      </p>

      {sources.map((source, idx) => (
        <div
          key={`${source.document}-${idx}`}
          className="rounded-xl bg-[#F0FCFB] px-3 py-2 font-mono text-[13px] leading-6 text-[#008A86]"
        >
          <span>SOURCE: {source.document}</span>
          {source.page != null && <span> · p.{source.page}</span>}
          {source.confidence != null && (
            <span> · confianza {source.confidence.toFixed(2)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#00B8B3]">
        <Bot size={16} style={{ color: '#FFFFFF' }} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 rounded-xl border border-[#BDEBE9] bg-[#F0FCFB] p-4">
          <Loader2 size={18} className="animate-spin text-[#00B8B3]" />
          <span className="text-sm text-[#6B7280]">
            Consultando documentos y generando respuesta...
          </span>
        </div>
      </div>
    </div>
  );
}
