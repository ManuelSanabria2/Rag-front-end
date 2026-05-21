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

export async function getHistoryByUser(email) {
  const history = await readHistory();
  return history.filter((item) => item.userEmail === email);
}

export async function createHistoryItem(email, payload) {
  const history = await readHistory();

  const newItem = {
    id: crypto.randomUUID(),
    userEmail: email,
    pregunta: payload.pregunta,
    respuestaResumen: payload.respuestaResumen,
    tipo: payload.tipo || "clínica",
    estado: payload.estado || "verificada",
    fuentes: payload.fuentes || [],
    servicio: payload.servicio || "Medicina Interna",
    usuario: payload.usuario || "Usuario",
    fecha: new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    hora: new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdAt: new Date().toISOString(),
  };

  history.unshift(newItem);
  await writeHistory(history);

  return newItem;
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