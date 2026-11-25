// Back-office API. Every route checks the caller's role on the server; the web UI only hides what the API refuses anyway.
// Activation codes (LPA) are never returned here, and every change writes an audit entry.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { Db } from "@bleusim/database";
import type { AuthUser } from "../auth";

export type Role = "CUSTOMER" | "SUPPORT" | "CATALOG_MANAGER" | "FINANCE" | "ADMIN";
const STAFF: Role[] = ["ADMIN", "SUPPORT", "CATALOG_MANAGER", "FINANCE"];

/** What each staff role may do. ADMIN can do everything. */
export const PERMISSIONS = {
  overview: STAFF,
  orders: ["ADMIN", "SUPPORT", "FINANCE"],
  retryProvisioning: ["ADMIN", "SUPPORT"],
  esims: ["ADMIN", "SUPPORT"],
  catalog: ["ADMIN", "CATALOG_MANAGER"],
  suppliers: ["ADMIN", "CATALOG_MANAGER"],
  toggleSupplier: ["ADMIN"],
  users: ["ADMIN"],
  audit: ["ADMIN"],
} satisfies Record<string, Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export function can(role: string, p: Permission) { return (PERMISSIONS[p] as string[]).includes(role); }

function guard(req: FastifyRequest, reply: FastifyReply, p: Permission): AuthUser | null {
  if (!req.user) { reply.status(401).send({ error: "unauthenticated", message: "Sign in required" }); return null; }
  if (!can(req.user.role, p)) { reply.status(403).send({ error: "forbidden", message: "You don't have access to this" }); return null; }
  return req.user;
}

const Page = z.object({ cursor: z.string().max(40).optional(), take: z.coerce.number().int().min(1).max(100).default(50) });

export async function adminRoutes(app: FastifyInstance, opts: { db: Db; provisionOrder: (orderId: string) => Promise<string> }) {
  const { db } = opts;
  const audit = (req: FastifyRequest, action: string, target: string, meta?: object) =>
    db.auditLog.create({ data: { actorId: req.user?.id, action, target, meta: meta as never, ip: req.ip } });

  app.addHook("onSend", async (_req, reply) => { reply.header("Cache-Control", "no-store"); });

  app.get("/admin/me", async (req, reply) => {
    const u = guard(req, reply, "overview"); if (!u) return;
    return { user: u, permissions: (Object.keys(PERMISSIONS) as Permission[]).filter((p) => can(u.role, p)) };
  });

  app.get("/admin/overview", async (req, reply) => {
    if (!guard(req, reply, "overview")) return;
    const [byStatus, paid, esims, users, failed, suppliers] = await Promise.all([
      db.order.groupBy({ by: ["status"], _count: true }),
      db.order.findMany({ where: { status: { in: ["PAID", "PROVISIONING", "FULFILLED"] } }, select: { totalMinor: true, currency: true, items: { select: { wholesaleMinor: true } } } }),
      db.esimProfile.groupBy({ by: ["status", "isSandbox"], _count: true }),
      db.user.count({ where: { deletedAt: null } }),
      db.order.count({ where: { status: "PROVISIONING_FAILED" } }),
      db.supplier.findMany({ select: { id: true, isSandbox: true, enabled: true } }),
    ]);
    const revenue: Record<string, { grossMinor: number; wholesaleMinor: number }> = {};
    for (const o of paid) {
      const r = (revenue[o.currency] ??= { grossMinor: 0, wholesaleMinor: 0 });
      r.grossMinor += o.totalMinor; r.wholesaleMinor += o.items.reduce((a, i) => a + i.wholesaleMinor, 0);
    }
    return {
      sandboxOnly: suppliers.filter((s) => s.enabled).every((s) => s.isSandbox),
      orders: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      revenue, esims: esims.map((e) => ({ status: e.status, isSandbox: e.isSandbox, count: e._count })),
      users, provisioningFailures: failed,
    };
  });

  app.get("/admin/orders", async (req, reply) => {
    if (!guard(req, reply, "orders")) return;
    const q = Page.extend({ status: z.string().max(30).optional(), q: z.string().trim().max(120).optional() }).parse(req.query);
    const where = {
      ...(q.status ? { status: q.status as never } : {}),
      ...(q.q ? { OR: [{ number: { contains: q.q, mode: "insensitive" as const } }, { email: { contains: q.q, mode: "insensitive" as const } }] } : {}),
    };
    const rows = await db.order.findMany({
      where, orderBy: { createdAt: "desc" }, take: q.take + 1, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      include: { items: { include: { retailPlan: { include: { destination: true } } } } },
    });
    const more = rows.length > q.take;
    return {
      orders: rows.slice(0, q.take).map((o) => ({ id: o.id, number: o.number, email: o.email, status: o.status, total: { minor: o.totalMinor, currency: o.currency }, createdAt: o.createdAt, destinations: o.items.map((i) => i.retailPlan.destination.names), isTopUp: o.items.some((i) => !!i.topUpOfEsimId) })),
      nextCursor: more ? rows[q.take - 1]!.id : null,
    };
  });

  app.get("/admin/orders/:id", async (req, reply) => {
    if (!guard(req, reply, "orders")) return;
    const { id } = z.object({ id: z.string().min(10).max(40) }).parse(req.params);
    const o = await db.order.findUnique({ where: { id }, include: { payments: true, items: { include: { retailPlan: { include: { destination: true, supplierPlan: true } }, esim: true } } } });
    if (!o) return reply.status(404).send({ error: "not_found", message: "Order not found" });
    const log = await db.auditLog.findMany({ where: { target: o.id }, orderBy: { createdAt: "asc" }, take: 100 });
    return {
      order: {
        id: o.id, number: o.number, email: o.email, userId: o.userId, status: o.status, createdAt: o.createdAt,
        total: { minor: o.totalMinor, currency: o.currency },
        payments: o.payments.map((p) => ({ provider: p.provider, ref: p.providerRef, status: p.status, amountMinor: p.amountMinor, currency: p.currency, createdAt: p.createdAt })),
        items: o.items.map((i) => ({
          id: i.id, plan: i.retailPlan.id, destination: i.retailPlan.destination.names, unitPriceMinor: i.unitPriceMinor, wholesaleMinor: i.wholesaleMinor,
          supplierId: i.supplierId, supplierOrderRef: i.supplierOrderRef, provisionAttempts: i.provisionAttempts, provisionedAt: i.provisionedAt, topUpOfEsimId: i.topUpOfEsimId,
          esim: i.esim ? { id: i.esim.id, iccid: i.esim.iccid, status: i.esim.status, isSandbox: i.esim.isSandbox } : null,
        })),
      },
      audit: log.map((l) => ({ action: l.action, actorId: l.actorId, at: l.createdAt, meta: l.meta })),
    };
  });

  app.post("/admin/orders/:id/retry-provisioning", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (req, reply) => {
    if (!guard(req, reply, "retryProvisioning")) return;
    const { id } = z.object({ id: z.string().min(10).max(40) }).parse(req.params);
    // Only a failed order can be retried; the status flip is atomic so two clicks can't provision twice.
    const moved = await db.order.updateMany({ where: { id, status: "PROVISIONING_FAILED" }, data: { status: "PAID" } });
    if (moved.count !== 1) return reply.status(409).send({ error: "not_retryable", message: "Only orders whose provisioning failed can be retried" });
    await audit(req, "admin.order.retry_provisioning", id);
    return { status: await opts.provisionOrder(id) };
  });

  app.get("/admin/esims", async (req, reply) => {
    if (!guard(req, reply, "esims")) return;
    const q = Page.extend({ q: z.string().trim().max(40).optional() }).parse(req.query);
    const rows = await db.esimProfile.findMany({
      where: q.q ? { iccid: { contains: q.q } } : {}, orderBy: { createdAt: "desc" }, take: q.take + 1, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      include: { orderItem: { include: { order: true, retailPlan: { include: { destination: true } } } } },
    });
    const more = rows.length > q.take;
    return {
      esims: rows.slice(0, q.take).map((e) => ({ id: e.id, iccid: e.iccid, status: e.status, isSandbox: e.isSandbox, supplierId: e.supplierId, dataTotalMb: e.dataTotalMb, dataUsedMb: e.dataUsedMb, destination: e.orderItem.retailPlan.destination.names, orderId: e.orderItem.order.id, orderNumber: e.orderItem.order.number, email: e.orderItem.order.email, createdAt: e.createdAt })),
      nextCursor: more ? rows[q.take - 1]!.id : null,
    };
  });

  app.get("/admin/suppliers", async (req, reply) => {
    if (!guard(req, reply, "suppliers")) return;
    const s = await db.supplier.findMany({ orderBy: { priority: "asc" }, include: { _count: { select: { supplierPlans: true } } } });
    return { suppliers: s.map((x) => ({ id: x.id, name: x.name, adapter: x.adapter, enabled: x.enabled, priority: x.priority, isSandbox: x.isSandbox, plans: x._count.supplierPlans })) };
  });

  app.patch("/admin/suppliers/:id", async (req, reply) => {
    if (!guard(req, reply, "toggleSupplier")) return;
    const { id } = z.object({ id: z.string().min(2).max(60) }).parse(req.params);
    const body = z.object({ enabled: z.boolean() }).parse(req.body);
    const s = await db.supplier.findUnique({ where: { id } });
    if (!s) return reply.status(404).send({ error: "not_found", message: "Supplier not found" });
    await db.supplier.update({ where: { id }, data: { enabled: body.enabled } });
    await audit(req, "admin.supplier.update", `supplier:${id}`, { enabled: { from: s.enabled, to: body.enabled } });
    return { ok: true };
  });

  app.get("/admin/plans", async (req, reply) => {
    if (!guard(req, reply, "catalog")) return;
    const q = Page.extend({ destination: z.string().max(40).optional() }).parse(req.query);
    const rows = await db.retailPlan.findMany({
      where: q.destination ? { destinationId: q.destination } : {}, orderBy: [{ destinationId: "asc" }, { sortOrder: "asc" }], take: q.take + 1, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      include: { supplierPlan: true, destination: true },
    });
    const more = rows.length > q.take;
    return {
      plans: rows.slice(0, q.take).map((p) => ({ id: p.id, destination: { id: p.destination.id, names: p.destination.names }, active: p.active, source: p.source, priceMinor: p.priceMinor, currency: p.currency, wholesaleMinor: p.supplierPlan.wholesaleMinor, dataMb: p.supplierPlan.dataMb, validityDays: p.supplierPlan.validityDays, supplierId: p.supplierPlan.supplierId })),
      nextCursor: more ? rows[q.take - 1]!.id : null,
    };
  });

  app.patch("/admin/plans/:id", async (req, reply) => {
    if (!guard(req, reply, "catalog")) return;
    const { id } = z.object({ id: z.string().min(3).max(80) }).parse(req.params);
    const body = z.object({ active: z.boolean().optional(), priceMinor: z.number().int().min(1).max(10_000_00).optional() }).refine((b) => b.active !== undefined || b.priceMinor !== undefined, "Nothing to change").parse(req.body);
    const p = await db.retailPlan.findUnique({ where: { id }, include: { supplierPlan: true } });
    if (!p) return reply.status(404).send({ error: "not_found", message: "Plan not found" });
    // Never sell below wholesale (same currency only; FX handling comes with multi-currency).
    if (body.priceMinor !== undefined && p.currency === p.supplierPlan.currency && body.priceMinor < p.supplierPlan.wholesaleMinor)
      return reply.status(422).send({ error: "below_wholesale", message: "Price can't be lower than the wholesale cost" });
    await db.retailPlan.update({ where: { id }, data: { ...(body.active !== undefined ? { active: body.active } : {}), ...(body.priceMinor !== undefined ? { priceMinor: body.priceMinor } : {}) } });
    await audit(req, "admin.plan.update", `plan:${id}`, {
      ...(body.active !== undefined ? { active: { from: p.active, to: body.active } } : {}),
      ...(body.priceMinor !== undefined ? { priceMinor: { from: p.priceMinor, to: body.priceMinor } } : {}),
    });
    return { ok: true };
  });

  app.get("/admin/users", async (req, reply) => {
    if (!guard(req, reply, "users")) return;
    const q = Page.extend({ q: z.string().trim().max(120).optional() }).parse(req.query);
    const rows = await db.user.findMany({
      where: { deletedAt: null, ...(q.q ? { email: { contains: q.q, mode: "insensitive" as const } } : {}) }, orderBy: { createdAt: "desc" }, take: q.take + 1, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { orders: true } } },
    });
    const more = rows.length > q.take;
    return { users: rows.slice(0, q.take).map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt, orders: u._count.orders })), nextCursor: more ? rows[q.take - 1]!.id : null };
  });

  app.patch("/admin/users/:id/role", async (req, reply) => {
    const me = guard(req, reply, "users"); if (!me) return;
    const { id } = z.object({ id: z.string().min(10).max(40) }).parse(req.params);
    const { role } = z.object({ role: z.enum(["CUSTOMER", "SUPPORT", "CATALOG_MANAGER", "FINANCE", "ADMIN"]) }).parse(req.body);
    if (id === me.id) return reply.status(422).send({ error: "self_role_change", message: "You can't change your own role" });
    const u = await db.user.findUnique({ where: { id } });
    if (!u || u.deletedAt) return reply.status(404).send({ error: "not_found", message: "User not found" });
    await db.user.update({ where: { id }, data: { role } });
    // A role change ends the user's sessions so the new permissions apply at once.
    await db.session.deleteMany({ where: { userId: id } });
    await audit(req, "admin.user.role", `user:${id}`, { from: u.role, to: role });
    return { ok: true };
  });

  app.get("/admin/audit", async (req, reply) => {
    if (!guard(req, reply, "audit")) return;
    const q = Page.extend({ action: z.string().max(60).optional() }).parse(req.query);
    const rows = await db.auditLog.findMany({
      where: q.action ? { action: { startsWith: q.action } } : {}, orderBy: { createdAt: "desc" }, take: q.take + 1, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      include: { actor: { select: { email: true } } },
    });
    const more = rows.length > q.take;
    return { entries: rows.slice(0, q.take).map((l) => ({ id: l.id, action: l.action, target: l.target, actor: l.actor?.email ?? null, ip: l.ip, meta: l.meta, at: l.createdAt })), nextCursor: more ? rows[q.take - 1]!.id : null };
  });
}
