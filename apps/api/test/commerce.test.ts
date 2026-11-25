import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { makeApp, TEST_SECRET } from "./helpers";
import { hmac } from "../src/crypto";

let ctx: Awaited<ReturnType<typeof makeApp>>;
beforeAll(async () => { ctx = await makeApp(); });
afterAll(async () => { await ctx.app.close(); await ctx.db.$disconnect(); });

async function checkout(key = randomUUID(), planId = "dev-jp-5-30") {
  const r = await ctx.app.inject({ method: "POST", url: "/v1/checkout", payload: { retailPlanId: planId, email: "buyer@example.com", idempotencyKey: key } });
  return { r, body: r.json(), key };
}
const getOrder = (id: string, t: string) => ctx.app.inject({ url: `/v1/orders/${id}`, headers: { "x-order-token": t } });

describe("sandbox commerce", () => {
  it("checkout is idempotent per key", async () => {
    const a = await checkout();
    expect(a.r.statusCode).toBe(201);
    const b = await checkout(a.key);
    expect(b.r.statusCode).toBe(200);
    expect(b.body).toMatchObject({ orderId: a.body.orderId, replayed: true });
  });

  it("successful payment provisions exactly one sandbox eSIM", async () => {
    const { body } = await checkout();
    const pay = await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${body.paymentRef}/complete`, payload: { outcome: "succeeded" } });
    expect(pay.statusCode).toBe(200);
    // duplicate delivery of the same event
    const again = await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${body.paymentRef}/complete`, payload: { outcome: "succeeded" } });
    expect(again.json()).toMatchObject({ duplicate: true });
    const o = (await getOrder(body.orderId, body.accessToken)).json();
    expect(o.status).toBe("FULFILLED");
    expect(o.items).toHaveLength(1);
    expect(o.items[0].esim).toMatchObject({ isSandbox: true });
    expect(o.items[0].esim.lpa).toMatch(/^LPA:1\$smdp\.sandbox\.bleusim\.invalid\$SBX-/);
    expect(await ctx.db.esimProfile.count({ where: { orderItem: { orderId: body.orderId } } })).toBe(1);
  });

  it("stores activation material encrypted", async () => {
    const e = await ctx.db.esimProfile.findFirst({ orderBy: { createdAt: "desc" } });
    expect(e!.activationEncrypted.startsWith("v1.")).toBe(true);
    expect(e!.activationEncrypted).not.toContain("LPA:");
  });

  it("failed payment does not provision", async () => {
    const { body } = await checkout();
    await ctx.app.inject({ method: "POST", url: `/v1/sandbox/payments/${body.paymentRef}/complete`, payload: { outcome: "failed" } });
    const o = (await getOrder(body.orderId, body.accessToken)).json();
    expect(o.status).toBe("PAYMENT_FAILED");
    expect(o.items[0].esim).toBeNull();
  });

  it("rejects webhooks with a bad signature", async () => {
    const evt = JSON.stringify({ id: "evt_forged", type: "payment.succeeded", data: { paymentRef: "sbxpay_x" } });
    const r = await ctx.app.inject({ method: "POST", url: "/v1/webhooks/sandbox-payments", payload: evt, headers: { "content-type": "application/json", "x-sandbox-signature": hmac("wrong", evt) } });
    expect(r.statusCode).toBe(401);
    void TEST_SECRET;
  });

  it("order lookup needs the access token", async () => {
    const { body } = await checkout();
    expect((await getOrder(body.orderId, "nope")).statusCode).toBe(404);
  });

  it("validates input", async () => {
    const r = await ctx.app.inject({ method: "POST", url: "/v1/checkout", payload: { retailPlanId: "dev-jp-5-30", email: "not-an-email", idempotencyKey: "short" } });
    expect(r.statusCode).toBe(400);
    const nf = await ctx.app.inject({ method: "POST", url: "/v1/checkout", payload: { retailPlanId: "nope-plan", email: "a@b.co", idempotencyKey: randomUUID() } });
    expect(nf.statusCode).toBe(404);
  });
});

describe("provisioning with a failing supplier", () => {
  it("retries 3 times then marks the order PROVISIONING_FAILED", async () => {
    const flaky = await makeApp({ failEveryNth: 1 });
    // every call fails → order must end PROVISIONING_FAILED (not hang, not double-provision)
    const r = await flaky.app.inject({ method: "POST", url: "/v1/checkout", payload: { retailPlanId: "dev-ma-1-7", email: "a@b.co", idempotencyKey: randomUUID() } });
    const b = r.json();
    await flaky.app.inject({ method: "POST", url: `/v1/sandbox/payments/${b.paymentRef}/complete`, payload: { outcome: "succeeded" } });
    const o = (await flaky.app.inject({ url: `/v1/orders/${b.orderId}`, headers: { "x-order-token": b.accessToken } })).json();
    expect(o.status).toBe("PROVISIONING_FAILED");
    await flaky.app.close(); await flaky.db.$disconnect();
  });
});
