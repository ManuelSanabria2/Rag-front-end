// backend/src/controllers/favoriteController.js

import {
  getFavoritesByUser,
  createFavoriteItem,
  deleteFavoriteItem,
} from "../services/favoriteService.js";

export async function getFavorites(req, res) {
  try {
    const email = req.user.email;
    const favorites = await getFavoritesByUser(email);

    return res.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener favoritos",
    });
  }
}

export async function createFavorite(req, res) {
  try {
    const email = req.user.email;
    const item = await createFavoriteItem(email, req.body);

    return res.status(201).json({
      success: true,
      favorite: item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al guardar favorito",
    });
  }
}

export async function deleteFavorite(req, res) {
  try {
    const email = req.user.email;
    const { id } = req.params;

    const deletedItem = await deleteFavoriteItem(email, id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Favorito no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Favorito eliminado",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar favorito",
    });
  }
}