// backend/src/routes/historyRoutes.js

import express from "express";
import {
  getHistory,
  createHistory,
  deleteHistory,
} from "../controllers/historyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getHistory);
router.post("/", verifyToken, createHistory);
router.delete("/:id", verifyToken, deleteHistory);

export default router;