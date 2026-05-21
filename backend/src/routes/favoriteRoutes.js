// backend/src/routes/favoriteRoutes.js

import express from "express";
import {
  getFavorites,
  createFavorite,
  deleteFavorite,
} from "../controllers/favoriteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getFavorites);
router.post("/", verifyToken, createFavorite);
router.delete("/:id", verifyToken, deleteFavorite);

export default router;