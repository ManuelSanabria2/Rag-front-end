import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import historyRoutes from "./routes/historyRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import documentSearchRoutes from "./routes/documentSearchRoutes.js";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

app.post("/api/verify-recaptcha", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token reCAPTCHA requerido",
      });
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      return res.json({
        success: true,
        message: "¡Verificación reCAPTCHA exitosa!",
      });
    }

    return res.status(400).json({
      success: false,
      message: "reCAPTCHA falló. Inténtalo de nuevo.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
});

// Rutas auth
app.use("/", authRoutes);

// Servidor
app.listen(3001, () => {
  console.log("Backend corriendo en http://localhost:3001");
});

app.use("/api/history", historyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/document-searches", documentSearchRoutes);