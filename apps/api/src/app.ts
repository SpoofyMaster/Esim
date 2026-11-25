import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import { installUserResolver, authRoutes } from "./auth";
import { accountRoutes } from "./routes/account";
import type { Db } from "@bleusim/database";
import { ZodError } from "zod";
import { catalogRoutes } from "./routes/catalog";
import { commerceRoutes } from "./routes/commerce";
import type { EsimProvider } from "@bleusim/provider-adapters";
import type { Sealer } from "./crypto";

export interface AppOptions { db: Db; provider: EsimProvider; sealer: Sealer; webhookSecret: string; corsOrigins?: string[]; logger?: boolean }

export async function buildApp({ db, provider, sealer, webhookSecret, corsOrigins = ["http://localhost:3000"], logger = false }: AppOptions) {
  const app = Fastify({ logger, trustProxy: true, bodyLimit: 256 * 1024 });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: corsOrigins, credentials: true });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  await app.register(cookie);
  installUserResolver(app, db);
  app.get("/health", async () => ({ ok: true }));
  app.setErrorHandler((err: FastifyError, _req, reply) => {
    if (err instanceof ZodError) return reply.status(400).send({ error: "invalid_request", issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
    const status = err.statusCode ?? 500;
    if (status >= 500) app.log.error(err);
    reply.status(status).send({ error: status >= 500 ? "internal_error" : err.code ?? "bad_request", message: status >= 500 ? "Something went wrong" : err.message });
  });
  await app.register(catalogRoutes, { prefix: "/v1", db });
  await app.register(commerceRoutes, { prefix: "/v1", db, provider, sealer, webhookSecret });
  await app.register(authRoutes, { prefix: "/v1", db, secureCookies: process.env.NODE_ENV === "production" });
  await app.register(accountRoutes, { prefix: "/v1", db, provider, sealer });
  return app;
}
