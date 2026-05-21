// src/services/documentSearchService.ts

const API_URL = "http://localhost:3001";

export type RecentSearch = {
  id: string;
  query: string;
  filters: string[];
  resultsCount: number;
  fecha: string;
  hora: string;
};

export async function getRecentSearches() {
  const response = await fetch(
    `${API_URL}/api/document-searches`,
    {
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Error al obtener búsquedas"
    );
  }

  return data.searches as RecentSearch[];
}

export async function createRecentSearch(
  payload: Omit<
    RecentSearch,
    "id" | "fecha" | "hora"
  >
) {
  const response = await fetch(
    `${API_URL}/api/document-searches`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Error al guardar búsqueda"
    );
  }

  return data.search;
}

export async function deleteRecentSearch(id: string) {
  const response = await fetch(
    `${API_URL}/api/document-searches/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Error al eliminar búsqueda"
    );
  }

  return data;
}