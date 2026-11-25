import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createDb } from "@bleusim/database";
import { buildApp } from "../src/app";

const db = createDb();
let app: Awaited<ReturnType<typeof buildApp>>;
beforeAll(async () => { app = await buildApp({ db }); });
afterAll(async () => { await app.close(); await db.$disconnect(); });

describe("catalog API (requires seeded local Postgres)", () => {
  it("health", async () => {
    const r = await app.inject("/health");
    expect(r.json()).toEqual({ ok: true });
  });
  it("lists destinations with from-prices and sandbox source", async () => {
    const r = await app.inject("/v1/destinations");
    expect(r.statusCode).toBe(200);
    const { destinations } = r.json();
    const jp = destinations.find((d: any) => d.id === "jp");
    expect(jp).toMatchObject({ kind: "COUNTRY", iso2: "JP", planCount: 6, source: "DEV_FIXTURE" });
    expect(destinations.find((d: any) => d.id === "region:europe")).toBeTruthy();
  });
  it("returns plans for Japan in the shared Plan contract", async () => {
    const r = await app.inject("/v1/destinations/jp/plans");
    const { plans } = r.json();
    expect(plans).toHaveLength(6);
    expect(plans[0]).toMatchObject({ scope: { kind: "country", iso2: "JP" }, dataGb: 1, validityDays: 7, coverage: ["JP"], source: "DEV_FIXTURE" });
    expect(plans.at(-1).dataGb).toBeNull();
  });
  it("validates ids and 404s unknown destinations", async () => {
    expect((await app.inject("/v1/destinations/DROP%20TABLE/plans")).statusCode).toBe(400);
    expect((await app.inject("/v1/destinations/zz/plans")).statusCode).toBe(404);
  });
  it("refuses currencies the sandbox does not price", async () => {
    expect((await app.inject("/v1/destinations?currency=MAD")).statusCode).toBe(422);
  });
});
