// src/services/favoriteService.ts

const API_URL = "http://localhost:3001";

export type FavoriteItem = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "consulta" | "documento" | "protocolo";
  fecha: string;
  servicio: string;
  fuente?: string;
  etiquetas: string[];
};

export async function getFavorites() {
  const response = await fetch(`${API_URL}/api/favorites`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error al obtener favoritos");
  }

  return data.favorites as FavoriteItem[];
}

export async function createFavorite(
  item: Omit<FavoriteItem, "id" | "fecha">
) {
  const response = await fetch(`${API_URL}/api/favorites`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error al guardar favorito");
  }

  return data.favorite as FavoriteItem;
}

export async function deleteFavorite(id: string) {
  const response = await fetch(`${API_URL}/api/favorites/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error al eliminar favorito");
  }

  return data;
}