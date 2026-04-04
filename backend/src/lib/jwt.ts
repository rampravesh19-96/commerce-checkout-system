import jwt from "jsonwebtoken";

type AuthTokenPayload = {
  userId: number;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}
