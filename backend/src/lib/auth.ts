import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

const ACCESS_SECRET = process.env["JWT_SECRET"] || "aaagronegocio-access-secret-dev";
const REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] || "aaagronegocio-refresh-secret-dev";
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token", { path: "/api/auth" });
}

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.["access_token"];
  if (!token) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    return;
  }
  req.user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }
    next();
  };
}
