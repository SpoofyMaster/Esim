"use client";
// Client catalog access. Phase 1: in-browser DEV FIXTURE provider. Phase 2: @bleusim/api-client → apps/api.
import { devFixtureCatalog, DEV_COVERAGE, regionCoverage } from "@bleusim/catalog";
export const catalog = devFixtureCatalog;
export { DEV_COVERAGE, regionCoverage };
export const formatPrice = (amount: number, currency: string, locale = "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
