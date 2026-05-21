// backend/src/routes/documentSearchRoutes.js

import express from "express";

import {
  getRecentSearches,
  createSearch,
  deleteSearch,
} from "../controllers/documentSearchController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getRecentSearches);

router.post("/", verifyToken, createSearch);

router.delete("/:id", verifyToken, deleteSearch);

export default router;