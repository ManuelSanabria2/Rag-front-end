// backend/src/services/favoriteService.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAVORITES_FILE = path.join(__dirname, "../data/favorites.json");

async function readFavorites() {
  try {
    const data = await fs.readFile(FAVORITES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeFavorites(favorites) {
  await fs.writeFile(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

export async function getFavoritesByUser(email) {
  const favorites = await readFavorites();
  return favorites.filter((item) => item.userEmail === email);
}

export async function createFavoriteItem(email, payload) {
  const favorites = await readFavorites();

  const alreadyExists = favorites.find(
    (item) =>
      item.userEmail === email &&
      item.titulo === payload.titulo &&
      item.tipo === payload.tipo
  );

  if (alreadyExists) {
    return alreadyExists;
  }

  const newItem = {
    id: crypto.randomUUID(),
    userEmail: email,
    titulo: payload.titulo,
    descripcion: payload.descripcion,
    tipo: payload.tipo || "consulta",
    servicio: payload.servicio || "Medicina Interna",
    fuente: payload.fuente || "",
    etiquetas: payload.etiquetas || [],
    fecha: new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    createdAt: new Date().toISOString(),
  };

  favorites.unshift(newItem);
  await writeFavorites(favorites);

  return newItem;
}

export async function deleteFavoriteItem(email, id) {
  const favorites = await readFavorites();

  const item = favorites.find(
    (favoriteItem) => favoriteItem.id === id && favoriteItem.userEmail === email
  );

  if (!item) {
    return null;
  }

  const updatedFavorites = favorites.filter(
    (favoriteItem) =>
      !(favoriteItem.id === id && favoriteItem.userEmail === email)
  );

  await writeFavorites(updatedFavorites);

  return item;
}