"use client";
// Client catalog access: the BLEUSIM API when NEXT_PUBLIC_API_URL is set, otherwise the in-browser DEV FIXTURE.
import { devFixtureCatalog, DEV_COVERAGE, regionCoverage } from "@bleusim/catalog";
import { createApiClient } from "@bleusim/api-client";
const API = process.env.NEXT_PUBLIC_API_URL;
export const catalog = API ? createApiClient(API).catalog : devFixtureCatalog;
export { DEV_COVERAGE, regionCoverage };
export const formatPrice = (amount: number, currency: string, locale = "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
