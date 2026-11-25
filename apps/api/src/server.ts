import { createDb } from "@bleusim/database";
import { createSandboxProvider } from "@bleusim/provider-adapters";
import { buildApp } from "./app";
import { makeSealer } from "./crypto";

const required = (k: string, devDefault?: string) => {
  const v = process.env[k] ?? (process.env.NODE_ENV !== "production" ? devDefault : undefined);
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};
const db = createDb();
const app = await buildApp({
  db,
  provider: createSandboxProvider(),
  sealer: makeSealer(required("ESIM_ENC_KEY", "ZGV2LW9ubHktMzItYnl0ZS1rZXktZm9yLWJsZXVzaW0=")),
  webhookSecret: required("SANDBOX_WEBHOOK_SECRET", "dev-sandbox-webhook-secret"),
  logger: true,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
});
await app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" });
