// Sandbox commerce: checkout → (sandbox) payment → signed webhook → provisioning → order fulfilled.
// No real money moves: the only payment provider wired here is "sandbox". Stripe test mode plugs into the same
// webhook path once keys exist (BLOCKERS B-4).
import { createProvisioner } from "../provisioning";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Db } from "@bleusim/database";
import type { EsimProvider } from "@bleusim/provider-adapters";
import { hmac, sha256, token, verifyHmac, type Sealer } from "../crypto";

export interface CommerceDeps { db: Db; provider: EsimProvider; sealer: Sealer; webhookSecret: string }

const CheckoutBody = z.object({
  retailPlanId: z.string().min(3).max(80),
  email: z.email().max(254),
  idempotencyKey: z.string().min(16).max(80),
});

export async function commerceRoutes(app: FastifyInstance, deps: CommerceDeps) {
  const provisionOrder = createProvisioner(deps);
  const { db, provider, sealer, webhookSecret } = deps;

  app.post("/checkout", async (req, reply) => {
    const body = CheckoutBody.parse(req.body);
    const existing = await db.order.findUnique({ where: { idempotencyKey: body.idempotencyKey }, include: { payments: true } });
    if (existing) return reply.status(200).send({ orderId: existing.id, paymentRef: existing.payments[0]?.providerRef, replayed: true });

    const plan = await db.retailPlan.findFirst({ where: { id: body.retailPlanId, active: true }, include: { supplierPlan: true } });
    if (!plan) return reply.status(404).send({ error: "plan_not_found", message: "This plan is not available" });

    const accessToken = token();
    const paymentRef = "sbxpay_" + token(12);
    const number = "BS-" + Date.now().toString(36).toUpperCase() + "-" + token(3).toUpperCase();
    const order = await db.order.create({
      data: {
        number, email: body.email.toLowerCase(), currency: plan.currency, userId: req.user?.id ?? null,
        subtotalMinor: plan.priceMinor, totalMinor: plan.priceMinor,
        idempotencyKey: body.idempotencyKey, accessTokenHash: sha256(accessToken),
        items: { create: { retailPlanId: plan.id, unitPriceMinor: plan.priceMinor, wholesaleMinor: plan.supplierPlan.wholesaleMinor, supplierId: plan.supplierPlan.supplierId } },
        payments: { create: { provider: "sandbox", providerRef: paymentRef, status: "REQUIRES_ACTION", amountMinor: plan.priceMinor, currency: plan.currency } },
      },
    });
    await db.auditLog.create({ data: { action: "order.created", target: order.id, meta: { plan: plan.id, sandbox: true } } });
    return reply.status(201).send({ orderId: order.id, orderNumber: number, accessToken, paymentRef, amount: { minor: plan.priceMinor, currency: plan.currency }, sandbox: true });
  });

  // Simulates the payment provider: the customer "pays" in the sandbox UI, the sandbox emits a signed webhook.
  app.post("/sandbox/payments/:ref/complete", async (req, reply) => {
    const { ref } = z.object({ ref: z.string().startsWith("sbxpay_") }).parse(req.params);
    const { outcome } = z.object({ outcome: z.enum(["succeeded", "failed"]) }).parse(req.body);
    const payment = await db.payment.findUnique({ where: { providerRef: ref } });
    if (!payment) return reply.status(404).send({ error: "not_found", message: "Unknown payment" });
    const event = JSON.stringify({ id: "evt_" + sha256(ref + outcome).slice(0, 24), type: "payment." + outcome, data: { paymentRef: ref } });
    const res = await app.inject({ method: "POST", url: "/v1/webhooks/sandbox-payments", payload: event, headers: { "content-type": "application/json", "x-sandbox-signature": hmac(webhookSecret, event) } });
    return reply.status(res.statusCode).send(res.json());
  });

  // Webhook endpoint: signature-verified and idempotent by event id.
  app.post("/webhooks/sandbox-payments", async (req, reply) => {
    const raw = JSON.stringify(req.body);
    if (!verifyHmac(webhookSecret, raw, req.headers["x-sandbox-signature"] as string | undefined)) return reply.status(401).send({ error: "bad_signature", message: "Invalid signature" });
    const evt = z.object({ id: z.string(), type: z.enum(["payment.succeeded", "payment.failed"]), data: z.object({ paymentRef: z.string() }) }).parse(req.body);

    const seen = await db.webhookEvent.findUnique({ where: { id: evt.id } });
    if (seen?.processedAt) return { received: true, duplicate: true };
    await db.webhookEvent.upsert({ where: { id: evt.id }, update: {}, create: { id: evt.id, provider: "sandbox", type: evt.type, payload: evt } });

    const payment = await db.payment.findUnique({ where: { providerRef: evt.data.paymentRef } });
    if (!payment) return reply.status(404).send({ error: "not_found", message: "Unknown payment" });

    if (evt.type === "payment.failed") {
      await db.$transaction([
        db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }),
        db.order.update({ where: { id: payment.orderId }, data: { status: "PAYMENT_FAILED" } }),
        db.webhookEvent.update({ where: { id: evt.id }, data: { processedAt: new Date() } }),
      ]);
      return { received: true };
    }

    // Transition PENDING_PAYMENT → PAID exactly once (guards against concurrent duplicate deliveries).
    const moved = await db.order.updateMany({ where: { id: payment.orderId, status: { in: ["PENDING_PAYMENT", "PAYMENT_FAILED"] } }, data: { status: "PAID" } });
    await db.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });
    if (moved.count === 1) await provisionOrder(payment.orderId);
    await db.webhookEvent.update({ where: { id: evt.id }, data: { processedAt: new Date() } });
    return { received: true };
  });

  // Order status for the buyer: requires the access token returned at checkout (or, later, a signed-in owner).
  app.get("/orders/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string().min(10).max(40) }).parse(req.params);
    const t = (req.headers["x-order-token"] as string | undefined) ?? "";
    const order = await db.order.findUnique({ where: { id }, include: { items: { include: { esim: true, retailPlan: { include: { supplierPlan: true, destination: true } } } } } });
    if (!order || order.accessTokenHash !== sha256(t)) return reply.status(404).send({ error: "not_found", message: "Order not found" });
    reply.header("Cache-Control", "no-store");
    return {
      id: order.id, number: order.number, status: order.status, email: order.email,
      total: { minor: order.totalMinor, currency: order.currency },
      items: order.items.map((i) => ({
        plan: { id: i.retailPlanId, destination: i.retailPlan.destination.names, dataMb: i.retailPlan.supplierPlan.dataMb, validityDays: i.retailPlan.supplierPlan.validityDays, source: i.retailPlan.source },
        esim: i.esim ? { iccid: i.esim.iccid, isSandbox: i.esim.isSandbox, status: i.esim.status, lpa: sealer.open(i.esim.activationEncrypted) } : null,
      })),
    };
  });
}
