import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  requireAuth,
  AuthRequest,
} from "../lib/auth.js";

const router: IRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["buyer", "seller"]).default("buyer"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toPublicUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isPremium: user.isPremium,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }

  const { name, email, password, role, phone } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email já cadastrado" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash, role, phone })
    .returning();

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await db
    .update(usersTable)
    .set({ refreshToken })
    .where(eq(usersTable.id, user.id));

  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ user: toPublicUser(user), message: "Conta criada com sucesso" });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await db.update(usersTable).set({ refreshToken }).where(eq(usersTable.id, user.id));

  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user: toPublicUser(user), message: "Login realizado com sucesso" });
});

router.post("/logout", (req, res) => {
  clearAuthCookies(res);
  res.json({ message: "Sessão encerrada" });
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.["refresh_token"];
  if (!token) {
    res.status(401).json({ error: "Token de renovação ausente" });
    return;
  }

  const payload = verifyRefreshToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId))
    .limit(1);

  if (!user || user.refreshToken !== token || !user.isActive) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id });

  await db
    .update(usersTable)
    .set({ refreshToken: newRefreshToken })
    .where(eq(usersTable.id, user.id));

  setAuthCookies(res, accessToken, newRefreshToken);
  res.json({ user: toPublicUser(user), message: "Token renovado" });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json(toPublicUser(user));
});

router.put("/me/profile", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.userId))
    .returning();

  res.json(toPublicUser(updated));
});

export default router;
