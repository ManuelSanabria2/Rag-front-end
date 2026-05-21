import express from "express";

import {
  login,
  profile,
  logout,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Login
router.post("/login", loginLimiter, login);

// Ruta protegida
router.get("/profile", verifyToken, profile);

// Logout
router.post("/logout", verifyToken, logout);

export default router;