// backend/src/services/historyService.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HISTORY_FILE = path.join(__dirname, "../data/history.json");

async function readHistory() {
  try {
    const data = await fs.readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeHistory(history) {
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function formatDate(date) {
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConversationSummary(messages = []) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && !message.isError);

  return {
    pregunta: firstUserMessage?.content || "Nueva conversacion",
    respuestaResumen: lastAssistantMessage?.content || "Sin respuesta registrada",
  };
}

function normalizeHistoryItem(item) {
  if (Array.isArray(item.messages)) {
    const summary = getConversationSummary(item.messages);

    return {
      ...item,
      pregunta: item.pregunta || summary.pregunta,
      respuestaResumen: item.respuestaResumen || summary.respuestaResumen,
      title: item.title || summary.pregunta,
    };
  }

  const messages = [
    item.pregunta && {
      id: `${item.id}-user`,
      role: "user",
      content: item.pregunta,
      timestamp: item.createdAt || new Date().toISOString(),
    },
    item.respuestaResumen && {
      id: `${item.id}-assistant`,
      role: "assistant",
      content: item.respuestaResumen,
      timestamp: item.createdAt || new Date().toISOString(),
    },
  ].filter(Boolean);

  return {
    ...item,
    title: item.title || item.pregunta || "Consulta guardada",
    messages,
  };
}

export async function getHistoryByUser(email) {
  const history = await readHistory();

  return history
    .filter((item) => item.userEmail === email)
    .map(normalizeHistoryItem)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    );
}

export async function createHistoryItem(email, payload) {
  const history = await readHistory();
  const now = new Date();
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const summary = getConversationSummary(messages);

  const newItem = {
    id: crypto.randomUUID(),
    userEmail: email,
    title: payload.title || summary.pregunta,
    messages,
    pregunta: payload.pregunta || summary.pregunta,
    respuestaResumen: payload.respuestaResumen || summary.respuestaResumen,
    tipo: payload.tipo || "clínica",
    estado: payload.estado || "verificada",
    fuentes: payload.fuentes || [],
    servicio: payload.servicio || "Medicina Interna",
    usuario: payload.usuario || "Usuario",
    fecha: formatDate(now),
    hora: formatTime(now),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  history.unshift(newItem);
  await writeHistory(history);

  return newItem;
}

export async function updateHistoryItem(email, id, payload) {
  const history = await readHistory();
  const index = history.findIndex(
    (historyItem) => historyItem.id === id && historyItem.userEmail === email
  );

  if (index === -1) {
    return null;
  }

  const now = new Date();
  const current = normalizeHistoryItem(history[index]);
  const messages = Array.isArray(payload.messages)
    ? payload.messages
    : current.messages;
  const summary = getConversationSummary(messages);

  const updatedItem = {
    ...current,
    ...payload,
    id: current.id,
    userEmail: current.userEmail,
    messages,
    title: payload.title || current.title || summary.pregunta,
    pregunta: payload.pregunta || summary.pregunta,
    respuestaResumen: payload.respuestaResumen || summary.respuestaResumen,
    fecha: formatDate(now),
    hora: formatTime(now),
    updatedAt: now.toISOString(),
  };

  history[index] = updatedItem;
  await writeHistory(history);

  return updatedItem;
}

export async function deleteHistoryItem(email, id) {
  const history = await readHistory();

  const item = history.find(
    (historyItem) => historyItem.id === id && historyItem.userEmail === email
  );

  if (!item) {
    return null;
  }

  const updatedHistory = history.filter(
    (historyItem) => !(historyItem.id === id && historyItem.userEmail === email)
  );

  await writeHistory(updatedHistory);

  return item;
}
