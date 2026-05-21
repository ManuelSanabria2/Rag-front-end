import jwt from "jsonwebtoken";

export function createToken(user) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1m",
    }
  );
}