import countriesData from "../data/countries.json";
import type { Country } from "./types";
export * from "./types";
export { REGIONS } from "./regions";
export { CITIES } from "./cities";
export { createSearch } from "./search";
export const COUNTRIES = countriesData as unknown as Country[];
export const countryByIso2 = (iso2: string) => COUNTRIES.find((c) => c.iso2 === iso2);
export const countryByIndex = (index: number) => COUNTRIES[index - 1];

/** ISO2 → emoji flag (regional indicator symbols). */
export const flagEmoji = (iso2: string) => iso2.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
