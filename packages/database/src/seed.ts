// Seeds geography + the DEV FIXTURE sandbox catalog. Never seeds real commercial offers.
import { COUNTRIES, REGIONS } from "@bleusim/geospatial";
import { devFixtureCatalog, DEV_COVERAGE, type Plan } from "@bleusim/catalog";
import { createDb } from "./index";

const db = createDb();
const minor = (n: number) => Math.round(n * 100);

async function upsertPlan(p: Plan, destinationId: string, sort: number) {
  const sp = await db.supplierPlan.upsert({
    where: { supplierId_externalId: { supplierId: "dev-sandbox", externalId: p.id } },
    update: {},
    create: {
      supplierId: "dev-sandbox", externalId: p.id, name: p.id,
      dataMb: p.dataGb === null ? null : p.dataGb * 1024, fairUsage: p.fairUsage, validityDays: p.validityDays,
      wholesaleMinor: Math.round(minor(p.price.amount) * 0.6), currency: p.price.currency,
      hotspot: p.hotspot, topUp: p.topUp, kycRequired: p.kycRequired,
      activationPolicy: p.activation.policy, activationWindowDays: p.activation.windowDays,
      coverages: { create: p.coverage.map((iso2) => ({ countryIso2: iso2, operators: p.networks.filter((n) => n.iso2 === iso2).map((n) => ({ name: n.operator, tech: n.tech })) })) },
    },
  });
  await db.retailPlan.upsert({
    where: { id: p.id },
    update: { priceMinor: minor(p.price.amount) },
    create: { id: p.id, destinationId, supplierPlanId: sp.id, priceMinor: minor(p.price.amount), currency: p.price.currency, source: "DEV_FIXTURE", sortOrder: sort },
  });
}

async function main() {
  for (const c of COUNTRIES) {
    if (!c.iso2) continue;
    await db.country.upsert({ where: { iso2: c.iso2 }, update: { names: c.names }, create: { iso2: c.iso2, iso3: c.iso3, names: c.names, lng: c.centroid[0], lat: c.centroid[1] } });
  }
  await db.supplier.upsert({ where: { id: "dev-sandbox" }, update: {}, create: { id: "dev-sandbox", name: "Development sandbox (not a real network)", adapter: "sandbox", enabled: true, isSandbox: true, priority: 1 } });

  for (const iso2 of DEV_COVERAGE) {
    const c = COUNTRIES.find((x) => x.iso2 === iso2)!;
    const id = iso2.toLowerCase();
    await db.destination.upsert({ where: { id }, update: {}, create: { id, kind: "COUNTRY", slug: c.names.en.toLowerCase().replace(/[^a-z0-9]+/g, "-"), names: c.names } });
    const plans = await devFixtureCatalog.plansForCountry(iso2);
    for (const [i, p] of plans.entries()) await upsertPlan(p, id, i);
  }
  for (const r of REGIONS) {
    const plans = await devFixtureCatalog.plansForRegion(r.id);
    if (!plans.length) continue;
    const id = `region:${r.id}`;
    await db.destination.upsert({ where: { id }, update: {}, create: { id, kind: "REGION", slug: r.id, names: r.names } });
    for (const [i, p] of plans.entries()) await upsertPlan(p, id, i);
  }
  await db.destination.upsert({ where: { id: "global" }, update: {}, create: { id: "global", kind: "GLOBAL", slug: "global", names: { en: "Global", fr: "Monde", es: "Global", de: "Weltweit", ar: "عالمي", pt: "Global", it: "Globale" } } });
  for (const [i, p] of (await devFixtureCatalog.globalPlans()).entries()) await upsertPlan(p, "global", i);

  const counts = { countries: await db.country.count(), destinations: await db.destination.count(), retailPlans: await db.retailPlan.count() };
  console.log("seeded", counts);
}
main().finally(() => db.$disconnect());
