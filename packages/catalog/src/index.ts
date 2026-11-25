// Catalog contract shared by web, mobile, admin and API.
// In development all offers come from the DEV FIXTURE provider below. They are NOT real offers:
// the UI must show the `source` badge whenever source === "DEV_FIXTURE".

export type CurrencyCode = "USD" | "EUR" | "GBP" | "MAD" | "AED" | "CAD" | "AUD";
export type NetworkTech = "3G" | "4G" | "LTE" | "5G";

export interface Plan {
  id: string;
  scope: { kind: "country"; iso2: string } | { kind: "region"; id: string } | { kind: "global" };
  dataGb: number | null; // null = unlimited
  fairUsage?: string;
  validityDays: number;
  price: { amount: number; currency: CurrencyCode };
  coverage: string[]; // ISO2
  networks: { iso2: string; operator: string; tech: NetworkTech[] }[];
  activation: { policy: "on_first_connection" | "on_install"; windowDays: number };
  hotspot: boolean;
  topUp: boolean;
  kycRequired: boolean;
  supplierId: string;
  source: "DEV_FIXTURE" | "SUPPLIER";
}

export interface DestinationSummary { iso2: string; fromPrice: { amount: number; currency: CurrencyCode }; planCount: number; source: Plan["source"] }

export interface CatalogProvider {
  listDestinations(): Promise<DestinationSummary[]>;
  plansForCountry(iso2: string): Promise<Plan[]>;
  plansForRegion(id: string): Promise<Plan[]>;
  globalPlans(): Promise<Plan[]>;
}

export { devFixtureCatalog, DEV_COVERAGE, regionCoverage } from "./dev-fixture";
