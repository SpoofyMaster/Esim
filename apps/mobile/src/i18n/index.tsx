// Locale state for the app: device language by default, user choice persisted. Arabic switches the
// whole tree to right-to-left through the root `direction` style (no app reload needed).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { getLocales } from "expo-localization";
import { LOCALES, type Locale } from "@bleusim/geospatial";
import { getItem, setItem } from "../lib/storage";
import en, { type Dict } from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";
import ar from "./ar";
import pt from "./pt";
import it from "./it";

export { LOCALES, type Locale, type Dict };
export const DICTS: Record<Locale, Dict> = { en, fr, es, de, ar, pt, it };
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", fr: "Français", es: "Español", de: "Deutsch", ar: "العربية", pt: "Português", it: "Italiano" };
export const isLocale = (s: unknown): s is Locale => typeof s === "string" && (LOCALES as string[]).includes(s);
/** Arabic keeps Latin digits for prices and data amounts. */
export const intlLocale = (l: Locale) => (l === "ar" ? "ar-u-nu-latn" : l);
export const fmt = (t: string, v: Record<string, string | number> = {}) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? `{${k}}`));

function deviceLocale(): Locale {
  if (Platform.OS === "web" && typeof location !== "undefined") {
    const q = new URLSearchParams(location.search).get("lang");
    if (isLocale(q)) return q;
  }
  for (const l of getLocales()) if (isLocale(l.languageCode)) return l.languageCode;
  return "en";
}

interface I18n { locale: Locale; t: Dict; rtl: boolean; setLocale: (l: Locale) => void; price: (amount: number, currency: string) => string }
const Ctx = createContext<I18n | null>(null);
const KEY = "bleusim.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(deviceLocale);
  useEffect(() => {
    // A ?lang= query (web preview, screenshots) wins over the stored choice.
    const fromQuery = Platform.OS === "web" && typeof location !== "undefined" && isLocale(new URLSearchParams(location.search).get("lang"));
    if (!fromQuery) getItem(KEY).then((v) => { if (isLocale(v)) setLocaleState(v); });
  }, []);
  const setLocale = useCallback((l: Locale) => { setLocaleState(l); void setItem(KEY, l); }, []);
  const rtl = locale === "ar";
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = rtl ? "rtl" : "ltr";
    }
  }, [locale, rtl]);
  const value = useMemo<I18n>(() => ({
    locale, t: DICTS[locale], rtl, setLocale,
    price: (amount, currency) => new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency }).format(amount),
  }), [locale, rtl, setLocale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
