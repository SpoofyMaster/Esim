import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { makeApp } from "./helpers";

let ctx: Awaited<ReturnType<typeof makeApp>>;
beforeAll(async () => { ctx = await makeApp(); });
afterAll(async () => { await ctx.app.close(); await ctx.db.$disconnect(); });

const email = `t-${randomUUID().slice(0, 8)}@example.com`;
const password = "correct horse battery";
const cookieOf = (r: { cookies: { name: string; value: string }[] }) => { const c = r.cookies.find((x) => x.name === "bs_session"); return c ? `bs_session=${c.value}` : ""; };

describe("auth + account", () => {
  let cookie = "";
  it("registers, sets an httpOnly session cookie, and stores a scrypt hash", async () => {
    const r = await ctx.app.inject({ method: "POST", url: "/v1/auth/register", payload: { email, password, name: "Test" } });
    expect(r.statusCode).toBe(201);
    const c = r.cookies.find((x) => x.name === "bs_session")!;
    expect(c.httpOnly).toBe(true);
    expect(c.sameSite).toBe("Lax");
    cookie = cookieOf(r);
    const u = await ctx.db.user.findUnique({ where: { email } });
    expect(u!.passwordHash).toMatch(/^scrypt\$/);
    expect(u!.passwordHash).not.toContain(password);
  });
  it("rejects duplicate email, weak password, wrong password", async () => {
    expect((await ctx.app.inject({ method: "POST", url: "/v1/auth/register", payload: { email, password } })).statusCode).toBe(409);
    expect((await ctx.app.inject({ method: "POST", url: "/v1/auth/register", payload: { email: "x" + email, password: "short" } })).statusCode).toBe(400);
    expect((await ctx.app.inject({ method: "POST", url: "/v1/auth/login", payload: { email, password: "wrong password!!" } })).statusCode).toBe(401);
  });
  it("/me needs a session", async () => {
    expect((await ctx.app.inject("/v1/me")).statusCode).toBe(401);
    expect((await ctx.app.inject({ url: "/v1/me", headers: { cookie } })).json().user.email).toBe(email);
  });
  it("signed-in purchase shows in My eSIMs with usage; top-up adds data once", async () => {
    const co = await ctx.app.inject({ method: "POST", url: "/v1/checkout", headers: { cookie }, payload: { retailPlanId: "dev-jp-3-30", email, idempotencyKey: randomUUID() } });
    await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${co.json().paymentRef}/complete`, payload: { outcome: "succeeded" } });
    let list = (await ctx.app.inject({ url: "/v1/me/esims", headers: { cookie } })).json().esims;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ dataTotalMb: 3072, dataUsedMb: 0, usageLive: true, isSandbox: true });
    const esimId = list[0].id;

    const key = randomUUID();
    const t = await ctx.app.inject({ method: "POST", url: `/v1/me/esims/${esimId}/topups`, headers: { cookie }, payload: { retailPlanId: "dev-jp-5-30", idempotencyKey: key } });
    expect(t.statusCode).toBe(201);
    const ref = t.json().paymentRef;
    await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${ref}/complete`, payload: { outcome: "succeeded" } });
    await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${ref}/complete`, payload: { outcome: "succeeded" } }); // duplicate
    list = (await ctx.app.inject({ url: "/v1/me/esims", headers: { cookie } })).json().esims;
    expect(list).toHaveLength(1);
    expect(list[0].dataTotalMb).toBe(3072 + 5120);

    const orders = (await ctx.app.inject({ url: "/v1/me/orders", headers: { cookie } })).json().orders;
    expect(orders).toHaveLength(2);
    expect(orders.filter((o: any) => o.isTopUp)).toHaveLength(1);
  });
  it("refuses top-ups from another destination and other users' eSIMs", async () => {
    const list = (await ctx.app.inject({ url: "/v1/me/esims", headers: { cookie } })).json().esims;
    const bad = await ctx.app.inject({ method: "POST", url: `/v1/me/esims/${list[0].id}/topups`, headers: { cookie }, payload: { retailPlanId: "dev-ma-5-30", idempotencyKey: randomUUID() } });
    expect(bad.statusCode).toBe(422);
    const other = await ctx.app.inject({ method: "POST", url: "/v1/auth/register", payload: { email: "o-" + email, password } });
    const otherCookie = cookieOf(other);
    expect((await ctx.app.inject({ url: `/v1/me/esims/${list[0].id}/install`, headers: { cookie: otherCookie } })).statusCode).toBe(404);
    expect((await ctx.app.inject({ url: `/v1/me/esims/${list[0].id}/install`, headers: { cookie } })).json().lpa).toMatch(/^LPA:1/);
  });
  it("logout ends the session", async () => {
    await ctx.app.inject({ method: "POST", url: "/v1/auth/logout", headers: { cookie } });
    expect((await ctx.app.inject({ url: "/v1/me", headers: { cookie } })).statusCode).toBe(401);
  });
});
