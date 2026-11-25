import { createDb } from "@bleusim/database";
import { buildApp } from "./app";
const db = createDb();
const app = await buildApp({ db, logger: true, corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",") });
await app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" });
