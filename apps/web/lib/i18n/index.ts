// Locales, direction, URL helpers and a tiny template formatter. Used by server and client code.
import { LOCALES, type Locale } from "@bleusim/geospatial";
import type { Dict } from "./dict/en";
export { LOCALES, type Locale, type Dict };

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", fr: "Français", es: "Español", de: "Deutsch", ar: "العربية", pt: "Português", it: "Italiano" };
export const isLocale = (s: string | undefined): s is Locale => !!s && (LOCALES as string[]).includes(s);
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
/** Intl locale: Arabic keeps Latin digits for prices and data amounts (common across Morocco and travel UIs). */
export const intlLocale = (l: Locale) => (l === "ar" ? "ar-u-nu-latn" : l);

/** English lives at the root (/esim/japan); other languages are prefixed (/fr/esim/japan). */
export function localePath(l: Locale, path: string) {
  if (l === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${l}` : `/${l}${path}`;
}
/** Strips a locale prefix: "/fr/esim/japan" → "/esim/japan". */
export function stripLocale(pathname: string) {
  const seg = pathname.split("/")[1];
  if (isLocale(seg)) return pathname.slice(seg.length + 1) || "/";
  return pathname;
}
/** "Hello {name}" + { name: "Badr" } → "Hello Badr" */
export const fmt = (t: string, v: Record<string, string | number> = {}) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? `{${k}}`));
