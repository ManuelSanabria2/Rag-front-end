import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Usuario de prueba
    const USER = {
      email: "doctor@sanrafael.med",
      password: "123456",
    };

    if (
      email === USER.email &&
      password === USER.password
    ) {
      return res.json({
        success: true,
        message: "Login exitoso",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Correo o contraseña incorrectos",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
});
app.listen(3001, () => {
  console.log("Backend corriendo en http://localhost:3001");
});
