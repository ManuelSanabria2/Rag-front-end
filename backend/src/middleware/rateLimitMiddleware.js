import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Demasiados intentos fallidos. Intenta en 1 minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});