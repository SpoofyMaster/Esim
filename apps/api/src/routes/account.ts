import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Db } from "@bleusim/database";
import type { EsimProvider } from "@bleusim/provider-adapters";
import { requireUser } from "../auth";
import { sha256, token, type Sealer } from "../crypto";

export async function accountRoutes(app: FastifyInstance, opts: { db: Db; provider: EsimProvider; sealer: Sealer }) {
  const { db, provider, sealer } = opts;

  app.get("/me/esims", async (req, reply) => {
    const user = requireUser(req, reply); if (!user) return;
    const esims = await db.esimProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { orderItem: { include: { retailPlan: { include: { destination: true, supplierPlan: true } }, order: true } } },
    });
    const out = await Promise.all(esims.map(async (e) => {
      // Live usage from the supplier; recorded so the dashboard and admin share one history.
      let usedMb = e.dataUsedMb, live = false;
      try {
        const u = await provider.usage(e.iccid);
        usedMb = u.usedMb; live = true;
        await db.usageRecord.create({ data: { esimId: e.id, usedMb: u.usedMb, remainingMb: e.dataTotalMb === null ? null : e.dataTotalMb - u.usedMb } });
      } catch { /* show last known usage */ }
      const rp = e.orderItem.retailPlan;
      return {
        id: e.id, iccid: e.iccid, status: e.status, isSandbox: e.isSandbox,
        destination: { id: rp.destination.id, kind: rp.destination.kind, names: rp.destination.names },
        dataTotalMb: e.dataTotalMb, dataUsedMb: usedMb, usageLive: live,
        validityDays: rp.supplierPlan.validityDays, activatedAt: e.activatedAt, expiresAt: e.expiresAt,
        orderNumber: e.orderItem.order.number, purchasedAt: e.createdAt, topUpAvailable: rp.supplierPlan.topUp,
      };
    }));
    return { esims: out };
  });

  app.get("/me/esims/:id/install", async (req, reply) => {
    const user = requireUser(req, reply); if (!user) return;
    const { id } = z.object({ id: z.string().min(10).max(40) }).parse(req.params);
    const e = await db.esimProfile.findFirst({ where: { id, userId: user.id } });
    if (!e) return reply.status(404).send({ error: "not_found", message: "eSIM not found" });
    reply.header("Cache-Control", "no-store");
    return { iccid: e.iccid, lpa: sealer.open(e.activationEncrypted), isSandbox: e.isSandbox };
  });

  app.get("/me/orders", async (req, reply) => {
    const user = requireUser(req, reply); if (!user) return;
    const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50, include: { items: { include: { retailPlan: { include: { destination: true } } } } } });
    return { orders: orders.map((o) => ({ id: o.id, number: o.number, status: o.status, total: { minor: o.totalMinor, currency: o.currency }, createdAt: o.createdAt, destinations: o.items.map((i) => i.retailPlan.destination.names), isTopUp: o.items.some((i) => !!i.topUpOfEsimId) })) };
  });

  // Top-up: a new order whose item points at an existing eSIM. Payment goes through the same sandbox/webhook path.
  app.post("/me/esims/:id/topups", async (req, reply) => {
    const user = requireUser(req, reply); if (!user) return;
    const { id } = z.object({ id: z.string().min(10).max(40) }).parse(req.params);
    const body = z.object({ retailPlanId: z.string().min(3).max(80), idempotencyKey: z.string().min(16).max(80) }).parse(req.body);
    const esim = await db.esimProfile.findFirst({ where: { id, userId: user.id }, include: { orderItem: { include: { retailPlan: { include: { supplierPlan: true } } } } } });
    if (!esim) return reply.status(404).send({ error: "not_found", message: "eSIM not found" });
    const existing = await db.order.findUnique({ where: { idempotencyKey: body.idempotencyKey }, include: { payments: true } });
    if (existing) return { orderId: existing.id, paymentRef: existing.payments[0]?.providerRef, replayed: true };
    const plan = await db.retailPlan.findFirst({ where: { id: body.retailPlanId, active: true, destinationId: esim.orderItem.retailPlan.destinationId }, include: { supplierPlan: true } });
    if (!plan || plan.supplierPlan.supplierId !== esim.supplierId || !plan.supplierPlan.topUp) return reply.status(422).send({ error: "topup_not_allowed", message: "This plan can’t top up this eSIM" });
    const accessToken = token();
    const paymentRef = "sbxpay_" + token(12);
    const order = await db.order.create({
      data: {
        number: "BS-" + Date.now().toString(36).toUpperCase() + "-" + token(3).toUpperCase(),
        userId: user.id, email: user.email, currency: plan.currency, subtotalMinor: plan.priceMinor, totalMinor: plan.priceMinor,
        idempotencyKey: body.idempotencyKey, accessTokenHash: sha256(accessToken),
        items: { create: { retailPlanId: plan.id, unitPriceMinor: plan.priceMinor, wholesaleMinor: plan.supplierPlan.wholesaleMinor, supplierId: plan.supplierPlan.supplierId, topUpOfEsimId: esim.id } },
        payments: { create: { provider: "sandbox", providerRef: paymentRef, status: "REQUIRES_ACTION", amountMinor: plan.priceMinor, currency: plan.currency } },
      },
    });
    return reply.status(201).send({ orderId: order.id, accessToken, paymentRef, sandbox: true });
  });
}
