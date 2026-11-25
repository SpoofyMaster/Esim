import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Db } from "@bleusim/database";
import type { Plan, DestinationSummary } from "@bleusim/catalog";

const DestId = z.string().regex(/^([a-z]{2}|region:[a-z-]+|global)$/);
const Currency = z.enum(["USD", "EUR", "GBP", "MAD", "AED", "CAD", "AUD"]).default("USD");

export async function catalogRoutes(app: FastifyInstance, opts: { db: Db }) {
  const { db } = opts;

  app.get("/destinations", async (req, reply) => {
    const { currency } = z.object({ currency: Currency }).parse(req.query);
    if (currency !== "USD") return reply.status(422).send({ error: "currency_unavailable", message: "Only USD is priced in the sandbox catalog" });
    const rows = await db.destination.findMany({ where: { active: true }, include: { plans: { where: { active: true }, select: { priceMinor: true, currency: true, source: true } } } });
    const out: (DestinationSummary & { id: string; kind: string })[] = rows
      .filter((d) => d.plans.length)
      .map((d) => {
        const cheapest = d.plans.reduce((a, b) => (b.priceMinor < a.priceMinor ? b : a));
        return { id: d.id, kind: d.kind, iso2: d.kind === "COUNTRY" ? d.id.toUpperCase() : "", fromPrice: { amount: cheapest.priceMinor / 100, currency: cheapest.currency as "USD" }, planCount: d.plans.length, source: cheapest.source };
      });
    reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return { destinations: out };
  });

  app.get("/destinations/:id/plans", async (req, reply) => {
    const { id } = z.object({ id: DestId }).parse(req.params);
    const dest = await db.destination.findUnique({ where: { id } });
    if (!dest) return reply.status(404).send({ error: "not_found", message: "Unknown destination" });
    const rows = await db.retailPlan.findMany({
      where: { destinationId: id, active: true },
      orderBy: { sortOrder: "asc" },
      include: { supplierPlan: { include: { coverages: true } } },
    });
    const plans: Plan[] = rows.map((r) => {
      const sp = r.supplierPlan;
      return {
        id: r.id,
        scope: dest.kind === "COUNTRY" ? { kind: "country", iso2: id.toUpperCase() } : dest.kind === "REGION" ? { kind: "region", id: id.slice(7) } : { kind: "global" },
        dataGb: sp.dataMb === null ? null : sp.dataMb / 1024,
        fairUsage: sp.fairUsage ?? undefined,
        validityDays: sp.validityDays,
        price: { amount: r.priceMinor / 100, currency: r.currency as "USD" },
        coverage: sp.coverages.map((c) => c.countryIso2),
        networks: sp.coverages.flatMap((c) => (c.operators as { name: string; tech: Plan["networks"][number]["tech"] }[]).map((o) => ({ iso2: c.countryIso2, operator: o.name, tech: o.tech }))),
        activation: { policy: sp.activationPolicy as Plan["activation"]["policy"], windowDays: sp.activationWindowDays },
        hotspot: sp.hotspot,
        topUp: sp.topUp,
        kycRequired: sp.kycRequired,
        supplierId: sp.supplierId,
        source: r.source,
      };
    });
    reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return { destination: { id: dest.id, kind: dest.kind, names: dest.names }, plans };
  });

  app.get("/plans/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string().regex(/^[a-z0-9-]{3,80}$/) }).parse(req.params);
    const r = await db.retailPlan.findFirst({ where: { id, active: true }, include: { supplierPlan: { include: { coverages: true } }, destination: true } });
    if (!r) return reply.status(404).send({ error: "not_found", message: "Plan not found" });
    const sp = r.supplierPlan;
    return {
      id: r.id, destination: { id: r.destination.id, kind: r.destination.kind, names: r.destination.names },
      dataGb: sp.dataMb === null ? null : sp.dataMb / 1024, fairUsage: sp.fairUsage, validityDays: sp.validityDays,
      price: { amount: r.priceMinor / 100, currency: r.currency }, coverageCount: sp.coverages.length,
      activation: { policy: sp.activationPolicy, windowDays: sp.activationWindowDays }, hotspot: sp.hotspot, kycRequired: sp.kycRequired, source: r.source,
    };
  });
}
