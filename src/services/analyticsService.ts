// src/services/analyticsService.ts

export type AnalyticsEventType =
  | "chat_message_sent"
  | "chat_response_received"
  | "chat_error"
  | "rag_source_used";

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  label: string;
  metadata?: Record<string, unknown>;
};

const STORAGE_KEY = "claris_analytics_events";

export function getAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackAnalyticsEvent(
  type: AnalyticsEventType,
  label: string,
  metadata?: Record<string, unknown>
) {
  const current = getAnalyticsEvents();

  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    label,
    metadata,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([event, ...current].slice(0, 500))
  );
}

export function clearAnalyticsEvents() {
  localStorage.removeItem(STORAGE_KEY);
}