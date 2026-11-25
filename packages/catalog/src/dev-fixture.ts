import type { CatalogProvider, Plan, DestinationSummary } from "./index";

/**
 * DEV FIXTURE — deterministic sandbox catalog so the product can be built end to end
 * before a supplier contract exists. Prices, coverage and operators here are placeholders
 * and must never be presented as real commercial offers.
 */
export const DEV_COVERAGE = (
  "JP MA US GB FR ES IT DE PT NL BE CH AT GR TR AE SA QA EG TN ZA KE NG TH VN ID MY SG PH KR CN HK TW IN AU NZ CA MX BR AR CL CO PE " +
  "IE DK SE NO FI PL CZ HU RO BG HR SI SK EE LV LT LU MT CY IS RS ME AL BA MK"
).split(" ");

const REGION_MEMBERS: Record<string, string[]> = {
  europe: "FR ES IT DE PT NL BE CH AT GR IE DK SE NO FI PL CZ HU RO BG HR SI SK EE LV LT LU MT CY IS GB".split(" "),
  asia: "JP KR CN HK TW TH VN ID MY SG PH IN".split(" "),
  africa: "MA EG TN ZA KE NG".split(" "),
  "middle-east": "AE SA QA TR EG".split(" "),
  "north-america": "US CA MX".split(" "),
  "latin-america": "MX BR AR CL CO PE".split(" "),
  oceania: "AU NZ".split(" "),
};

// Deterministic pseudo price factor per country (placeholder, not market data).
const factor = (key: string) => 0.85 + ([...key].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) * 0.08;
const r = (n: number) => Math.round(n * 100) / 100 - 0.01;

function tiers(key: string, scope: Plan["scope"], coverage: string[], base: number): Plan[] {
  const f = factor(key);
  const t: [number | null, number, number][] = [[1, 7, 1], [3, 30, 2.2], [5, 30, 3.2], [10, 30, 5.4], [20, 30, 8.5], [null, 15, 12]];
  return t.map(([gb, days, mult]) => ({
    id: `dev-${key.toLowerCase()}-${gb ?? "unl"}-${days}`,
    scope,
    dataGb: gb,
    fairUsage: gb === null ? "Placeholder fair-use rule (supplier-defined)" : undefined,
    validityDays: days,
    price: { amount: r(base * mult * f + 0.5), currency: "USD" },
    coverage,
    networks: coverage.slice(0, 6).map((iso2) => ({ iso2, operator: "Sandbox Network", tech: ["4G", "5G"] })),
    activation: { policy: "on_first_connection", windowDays: 180 },
    hotspot: true,
    topUp: true,
    kycRequired: false,
    supplierId: "dev-sandbox",
    source: "DEV_FIXTURE",
  }));
}

const delay = <T,>(v: T, ms = 220) => new Promise<T>((res) => setTimeout(() => res(v), ms));

export const devFixtureCatalog: CatalogProvider = {
  async listDestinations() {
    const out: DestinationSummary[] = DEV_COVERAGE.map((iso2) => {
      const p = tiers(iso2, { kind: "country", iso2 }, [iso2], 3);
      return { iso2, fromPrice: p[0]!.price, planCount: p.length, source: "DEV_FIXTURE" };
    });
    return delay(out, 0);
  },
  async plansForCountry(iso2) {
    return delay(DEV_COVERAGE.includes(iso2) ? tiers(iso2, { kind: "country", iso2 }, [iso2], 3) : []);
  },
  async plansForRegion(id) {
    const m = REGION_MEMBERS[id];
    return delay(m ? tiers(id, { kind: "region", id }, m, 4.2) : []);
  },
  async globalPlans() {
    return delay(tiers("global", { kind: "global" }, DEV_COVERAGE, 6.5));
  },
};
export const regionCoverage = (id: string) => REGION_MEMBERS[id] ?? [];
