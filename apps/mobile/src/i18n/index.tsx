import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import * as Linking from "expo-linking";
import { LOCALES, type Locale } from "@bleusim/geospatial";
import en, { type Dict } from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";
import ar from "./ar";
import pt from "./pt";
import it from "./it";

const DICTS: Record<Locale, Dict> = { en, fr, es, de, ar, pt, it };
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", fr: "Français", es: "Español", de: "Deutsch", ar: "العربية", pt: "Português", it: "Italiano" };
export { LOCALES, type Locale, type Dict };
const KEY = "bleusim.locale";

/** "Hello {name}" + { name: "Badr" } → "Hello Badr" */
export const fmt = (s: string, v: Record<string, string | number> = {}) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? `{${k}}`));
/** Intl locale; Arabic keeps Latin digits for prices and data amounts (as on the website). */
export const intlLocale = (l: Locale) => (l === "ar" ? "ar-u-nu-latn" : l);

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode ?? "en";
  return (LOCALES as string[]).includes(code) ? (code as Locale) : "en";
}

interface Ctx { locale: Locale; t: Dict; rtl: boolean; setLocale: (l: Locale) => Promise<void> }
const I18n = createContext<Ctx>({ locale: "en", t: en, rtl: false, setLocale: async () => {} });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setL] = useState<Locale>(deviceLocale);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v && (LOCALES as string[]).includes(v)) setL(v as Locale); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  // Deep links can pick the language, e.g. bleusim://?lang=ar (used by marketing links and store screenshots).
  const url = Linking.useURL();
  useEffect(() => {
    if (!url) return;
    const l = Linking.parse(url).queryParams?.lang;
    if (typeof l === "string" && (LOCALES as string[]).includes(l)) { AsyncStorage.setItem(KEY, l).catch(() => {}); setL(l as Locale); }
  }, [url]);
  const setLocale = useCallback(async (l: Locale) => { await AsyncStorage.setItem(KEY, l).catch(() => {}); setL(l); }, []);
  const value = useMemo(() => ({ locale, t: DICTS[locale], rtl: locale === "ar", setLocale }), [locale, setLocale]);
  if (!ready) return null;
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}
export const useI18n = () => useContext(I18n);
