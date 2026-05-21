// backend/src/controllers/documentSearchController.js

import {
  getRecentSearchesByUser,
  createRecentSearch,
  deleteRecentSearch,
} from "../services/documentSearchService.js";

export async function getRecentSearches(req, res) {
  try {
    const searches = await getRecentSearchesByUser(
      req.user.email
    );

    return res.json({
      success: true,
      searches,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener búsquedas recientes",
    });
  }
}

export async function createSearch(req, res) {
  try {
    const item = await createRecentSearch(
      req.user.email,
      req.body
    );

    return res.status(201).json({
      success: true,
      search: item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al guardar búsqueda",
    });
  }
}

export async function deleteSearch(req, res) {
  try {
    await deleteRecentSearch(
      req.user.email,
      req.params.id
    );

    return res.json({
      success: true,
      message: "Búsqueda eliminada",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar búsqueda",
    });
  }
}