// backend/src/services/documentSearchService.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEARCHES_FILE = path.join(
  __dirname,
  "../data/documentSearches.json"
);

async function readSearches() {
  try {
    const data = await fs.readFile(SEARCHES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSearches(searches) {
  await fs.writeFile(
    SEARCHES_FILE,
    JSON.stringify(searches, null, 2)
  );
}

export async function getRecentSearchesByUser(email) {
  const searches = await readSearches();

  return searches
    .filter((item) => item.userEmail === email)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 10);
}

export async function createRecentSearch(email, payload) {
  const searches = await readSearches();

  const newSearch = {
    id: crypto.randomUUID(),
    userEmail: email,
    query: payload.query,
    filters: payload.filters || [],
    resultsCount: payload.resultsCount || 0,
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

  searches.unshift(newSearch);

  await writeSearches(searches);

  return newSearch;
}

export async function deleteRecentSearch(email, id) {
  const searches = await readSearches();

  const updated = searches.filter(
    (item) =>
      !(item.id === id && item.userEmail === email)
  );

  await writeSearches(updated);

  return true;
}