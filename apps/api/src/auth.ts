import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { Db } from "@bleusim/database";
import { sha256, token } from "./crypto";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;
const PARAMS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 32, PARAMS);
  return `scrypt$${PARAMS.N}$${salt.toString("base64")}$${key.toString("base64")}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [alg, n, salt, key] = stored.split("$");
  if (alg !== "scrypt" || !salt || !key) return false;
  const k = await scrypt(pw, Buffer.from(salt, "base64"), 32, { ...PARAMS, N: Number(n) });
  const expected = Buffer.from(key, "base64");
  return expected.length === k.length && timingSafeEqual(expected, k);
}

export const COOKIE = "bs_session";
const SESSION_DAYS = 30;
const Credentials = z.object({ email: z.email().max(254), password: z.string().min(10, "Use at least 10 characters").max(200) });

export interface AuthUser { id: string; email: string; name: string | null; role: string }
declare module "fastify" { interface FastifyRequest { user: AuthUser | null } }

/** Root-level hook: resolves the session cookie into req.user for every route. */
export function installUserResolver(app: FastifyInstance, db: Db) {
  app.decorateRequest("user", null);
  app.addHook("preHandler", async (req) => {
    const raw = req.cookies?.[COOKIE];
    if (!raw) return;
    const s = await db.session.findUnique({ where: { tokenHash: sha256(raw) }, include: { user: true } });
    if (!s || s.expiresAt < new Date() || s.user.deletedAt) return;
    req.user = { id: s.user.id, email: s.user.email, name: s.user.name, role: s.user.role };
  });
}

export async function authRoutes(app: FastifyInstance, opts: { db: Db; secureCookies: boolean }) {
  const { db } = opts;

  async function startSession(req: FastifyRequest, reply: FastifyReply, userId: string) {
    const t = token(32);
    await db.session.create({ data: { userId, tokenHash: sha256(t), userAgent: req.headers["user-agent"]?.slice(0, 200), ip: req.ip, expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5) } });
    reply.setCookie(COOKIE, t, { path: "/", httpOnly: true, sameSite: "lax", secure: opts.secureCookies, maxAge: SESSION_DAYS * 86400 });
  }

  const strict = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

  app.post("/auth/register", strict, async (req, reply) => {
    const body = Credentials.extend({ name: z.string().max(80).optional() }).parse(req.body);
    const email = body.email.toLowerCase();
    if (await db.user.findUnique({ where: { email } })) return reply.status(409).send({ error: "email_taken", message: "An account with this email already exists" });
    const user = await db.user.create({ data: { email, name: body.name, passwordHash: await hashPassword(body.password) } });
    // Orders placed earlier as a guest with this email are linked only after email verification (not built yet).
    await startSession(req, reply, user.id);
    await db.auditLog.create({ data: { actorId: user.id, action: "user.registered", ip: req.ip } });
    return reply.status(201).send({ user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post("/auth/login", strict, async (req, reply) => {
    const body = Credentials.parse(req.body);
    const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
    const ok = user?.passwordHash && !user.deletedAt ? await verifyPassword(body.password, user.passwordHash) : (await hashPassword(body.password), false); // constant-ish time
    if (!user || !ok) return reply.status(401).send({ error: "invalid_credentials", message: "Email or password is incorrect" });
    await startSession(req, reply, user.id);
    await db.auditLog.create({ data: { actorId: user.id, action: "user.login", ip: req.ip } });
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post("/auth/logout", async (req, reply) => {
    const raw = req.cookies?.[COOKIE];
    if (raw) await db.session.deleteMany({ where: { tokenHash: sha256(raw) } });
    reply.clearCookie(COOKIE, { path: "/" });
    return { ok: true };
  });

  app.get("/me", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ error: "unauthenticated", message: "Sign in required" });
    return { user: req.user };
  });
}

export function requireUser(req: FastifyRequest, reply: FastifyReply): AuthUser | null {
  if (!req.user) { reply.status(401).send({ error: "unauthenticated", message: "Sign in required" }); return null; }
  return req.user;
}
