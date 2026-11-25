"use client";
import { createContext, useContext } from "react";
import type { Dict, Locale } from "./index";
import en from "./dict/en";

const Ctx = createContext<{ locale: Locale; t: Dict }>({ locale: "en", t: en });
export function I18nProvider({ locale, t, children }: { locale: Locale; t: Dict; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, t }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
