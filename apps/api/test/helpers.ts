import { createDb } from "@bleusim/database";
import { createSandboxProvider } from "@bleusim/provider-adapters";
import { buildApp } from "../src/app";
import { makeSealer } from "../src/crypto";
export const TEST_SECRET = "test-webhook-secret";
export async function makeApp(providerOpts: { failEveryNth?: number } = {}) {
  const db = createDb();
  const app = await buildApp({ db, provider: createSandboxProvider(providerOpts), sealer: makeSealer(Buffer.alloc(32, 7).toString("base64")), webhookSecret: TEST_SECRET });
  return { db, app };
}
