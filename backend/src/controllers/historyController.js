// backend/src/controllers/historyController.js

import {
  getHistoryByUser,
  createHistoryItem,
  deleteHistoryItem,
} from "../services/historyService.js";

export async function getHistory(req, res) {
  try {
    const email = req.user.email;
    const history = await getHistoryByUser(email);

    return res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener historial",
    });
  }
}

export async function createHistory(req, res) {
  try {
    const email = req.user.email;
    const item = await createHistoryItem(email, req.body);

    return res.status(201).json({
      success: true,
      historyItem: item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al guardar historial",
    });
  }
}

export async function deleteHistory(req, res) {
  try {
    const email = req.user.email;
    const { id } = req.params;

    const deletedItem = await deleteHistoryItem(email, id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Consulta no encontrada",
      });
    }

    return res.json({
      success: true,
      message: "Consulta eliminada del historial",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar historial",
    });
  }
}