import bcrypt from "bcrypt";
import { USER } from "../config/user.js";
import { loginSchema } from "../validators/authValidator.js";
import { createToken } from "../utils/jwt.js";

export async function login(req, res) {
  try {
    // Validar input
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }

    const { email, password } = validation.data;

    // Verificar email
    if (email !== USER.email) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Verificar password
    const passwordOk = await bcrypt.compare(
      password,
      USER.passwordHash
    );

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Crear token
    const token = createToken(USER);

    // Cookie segura
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login exitoso",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
}

export function profile(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}

export function logout(req, res) {
  res.clearCookie("token");

  return res.json({
    success: true,
    message: "Sesión cerrada",
  });
}