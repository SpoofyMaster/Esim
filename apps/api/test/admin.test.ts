import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { makeApp } from "./helpers";

let ctx: Awaited<ReturnType<typeof makeApp>>;
beforeAll(async () => { ctx = await makeApp(); });
afterAll(async () => { await ctx.app.close(); await ctx.db.$disconnect(); });

const password = "correct horse battery";
const cookieOf = (r: { cookies: { name: string; value: string }[] }) => { const c = r.cookies.find((x) => x.name === "bs_session"); return c ? `bs_session=${c.value}` : ""; };
async function userWithRole(role: "CUSTOMER" | "SUPPORT" | "CATALOG_MANAGER" | "FINANCE" | "ADMIN") {
  const email = `${role.toLowerCase()}-${randomUUID().slice(0, 8)}@example.com`;
  await ctx.app.inject({ method: "POST", url: "/v1/auth/register", payload: { email, password } });
  await ctx.db.user.update({ where: { email }, data: { role } });
  const r = await ctx.app.inject({ method: "POST", url: "/v1/auth/login", payload: { email, password } });
  const u = await ctx.db.user.findUniqueOrThrow({ where: { email } });
  return { cookie: cookieOf(r), id: u.id, email };
}
const get = (url: string, cookie?: string) => ctx.app.inject({ url, headers: cookie ? { cookie } : {} });

describe("admin authorization (server side)", () => {
  it("refuses anonymous (401) and customers (403) on every admin route", async () => {
    const c = await userWithRole("CUSTOMER");
    for (const url of ["/v1/admin/me", "/v1/admin/overview", "/v1/admin/orders", "/v1/admin/esims", "/v1/admin/plans", "/v1/admin/suppliers", "/v1/admin/users", "/v1/admin/audit"]) {
      expect((await get(url)).statusCode, url).toBe(401);
      expect((await get(url, c.cookie)).statusCode, url).toBe(403);
    }
    expect((await ctx.app.inject({ method: "PATCH", url: "/v1/admin/plans/dev-jp-1-7", headers: { cookie: c.cookie }, payload: { active: false } })).statusCode).toBe(403);
  });
  it("support sees orders and eSIMs but not catalog, users or audit", async () => {
    const s = await userWithRole("SUPPORT");
    expect((await get("/v1/admin/orders", s.cookie)).statusCode).toBe(200);
    expect((await get("/v1/admin/esims", s.cookie)).statusCode).toBe(200);
    expect((await get("/v1/admin/plans", s.cookie)).statusCode).toBe(403);
    expect((await get("/v1/admin/users", s.cookie)).statusCode).toBe(403);
    expect((await get("/v1/admin/audit", s.cookie)).statusCode).toBe(403);
    expect((await get("/v1/admin/me", s.cookie)).json().permissions).toEqual(["overview", "orders", "retryProvisioning", "esims"]);
  });
});

describe("admin features", () => {
  it("order detail shows items and payments but never activation codes", async () => {
    const a = await userWithRole("ADMIN");
    const co = (await ctx.app.inject({ method: "POST", url: "/v1/checkout", payload: { retailPlanId: "dev-fr-5-30", email: "buyer@example.com", idempotencyKey: randomUUID() } })).json();
    await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${co.paymentRef}/complete`, payload: { outcome: "succeeded" } });
    const list = (await get("/v1/admin/orders?q=buyer@example.com", a.cookie)).json();
    expect(list.orders.some((o: { id: string }) => o.id === co.orderId)).toBe(true);
    const d = await get(`/v1/admin/orders/${co.orderId}`, a.cookie);
    expect(d.headers["cache-control"]).toBe("no-store");
    const body = d.body;
    expect(d.json().order.status).toBe("FULFILLED");
    expect(d.json().order.items[0].esim.iccid).toMatch(/^89/);
    expect(body).not.toMatch(/LPA:1|activation|smdp/i);
    expect(d.json().audit.map((x: { action: string }) => x.action)).toEqual(expect.arrayContaining(["order.created", "order.fulfilled"]));
    const ov = (await get("/v1/admin/overview", a.cookie)).json();
    expect(ov.sandboxOnly).toBe(true);
    expect(ov.revenue.USD.grossMinor).toBeGreaterThan(0);
  });

  it("retries a failed provisioning once, atomically", async () => {
    const flaky = await makeApp({ failEveryNth: 1 });
    const co = (await flaky.app.inject({ method: "POST", url: "/v1/checkout", payload: { retailPlanId: "dev-ma-1-7", email: "retry@example.com", idempotencyKey: randomUUID() } })).json();
    await flaky.app.inject({ method: "POST", url: `/v1/sandbox/payments/${co.paymentRef}/complete`, payload: { outcome: "succeeded" } });
    await flaky.app.close(); await flaky.db.$disconnect();
    const s = await userWithRole("SUPPORT");
    const r = await ctx.app.inject({ method: "POST", url: `/v1/admin/orders/${co.orderId}/retry-provisioning`, headers: { cookie: s.cookie } });
    expect(r.json()).toEqual({ status: "FULFILLED" });
    expect((await ctx.app.inject({ method: "POST", url: `/v1/admin/orders/${co.orderId}/retry-provisioning`, headers: { cookie: s.cookie } })).statusCode).toBe(409);
    expect(await ctx.db.esimProfile.count({ where: { orderItem: { orderId: co.orderId } } })).toBe(1);
    expect(await ctx.db.auditLog.count({ where: { target: co.orderId, action: "admin.order.retry_provisioning", actorId: s.id } })).toBe(1);
  });

  it("catalog manager changes a price (audited) but never below wholesale", async () => {
    const m = await userWithRole("CATALOG_MANAGER");
    const plan = await ctx.db.retailPlan.findUniqueOrThrow({ where: { id: "dev-jp-10-30" }, include: { supplierPlan: true } });
    expect((await ctx.app.inject({ method: "PATCH", url: "/v1/admin/plans/dev-jp-10-30", headers: { cookie: m.cookie }, payload: { priceMinor: plan.supplierPlan.wholesaleMinor - 1 } })).statusCode).toBe(422);
    const r = await ctx.app.inject({ method: "PATCH", url: "/v1/admin/plans/dev-jp-10-30", headers: { cookie: m.cookie }, payload: { priceMinor: plan.priceMinor + 1 } });
    expect(r.statusCode).toBe(200);
    const log = await ctx.db.auditLog.findFirstOrThrow({ where: { target: "plan:dev-jp-10-30", actorId: m.id }, orderBy: { createdAt: "desc" } });
    expect(log.meta).toEqual({ priceMinor: { from: plan.priceMinor, to: plan.priceMinor + 1 } });
    await ctx.db.retailPlan.update({ where: { id: plan.id }, data: { priceMinor: plan.priceMinor } }); // restore fixture
    expect((await ctx.app.inject({ method: "PATCH", url: "/v1/admin/suppliers/dev-sandbox", headers: { cookie: m.cookie }, payload: { enabled: false } })).statusCode).toBe(403);
  });

  it("admin changes roles of others (ending their sessions) but not their own", async () => {
    const a = await userWithRole("ADMIN");
    const c = await userWithRole("CUSTOMER");
    expect((await ctx.app.inject({ method: "PATCH", url: `/v1/admin/users/${a.id}/role`, headers: { cookie: a.cookie }, payload: { role: "CUSTOMER" } })).statusCode).toBe(422);
    expect((await ctx.app.inject({ method: "PATCH", url: `/v1/admin/users/${c.id}/role`, headers: { cookie: a.cookie }, payload: { role: "SUPPORT" } })).statusCode).toBe(200);
    expect((await get("/v1/me", c.cookie)).statusCode).toBe(401); // old session revoked
    const audit = (await get("/v1/admin/audit?action=admin.user", a.cookie)).json();
    expect(audit.entries[0]).toMatchObject({ action: "admin.user.role", target: `user:${c.id}`, actor: a.email, meta: { from: "CUSTOMER", to: "SUPPORT" } });
  });
});
