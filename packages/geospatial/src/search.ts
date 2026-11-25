import Fuse from "fuse.js";
import type { Country, Locale, Region, SearchHit } from "./types";
import { CITIES } from "./cities";
import { EXTRA_ALIASES } from "./aliases";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

interface Entry { kind: "country" | "region" | "global" | "city"; key: string; terms: string[]; exact: string[]; label: (l: Locale) => string; sub?: (l: Locale) => string | undefined }

const GLOBAL_NAMES: Record<Locale, string> = { en: "Global", fr: "Monde", es: "Global", de: "Weltweit", ar: "عالمي", pt: "Global", it: "Globale" };
const GLOBAL_TERMS = ["global", "worldwide", "world", "monde", "mundial", "weltweit", "mondo", "عالمي", "international"];

export function createSearch(countries: Country[], regions: Region[]) {
  const byIso = new Map(countries.filter((c) => c.iso2).map((c) => [c.iso2!, c]));
  const entries: Entry[] = [];
  for (const c of countries) {
    if (!c.iso2) continue;
    const names = Object.values(c.names);
    const extra = EXTRA_ALIASES[c.iso2] ?? [];
    const terms = [...new Set([...names, ...c.aliases, ...extra].map(norm))];
    entries.push({ kind: "country", key: c.iso2, terms, exact: [norm(c.iso2), ...(c.iso3 ? [norm(c.iso3)] : []), ...extra.map(norm)], label: (l) => c.names[l] });
  }
  for (const r of regions) {
    entries.push({ kind: "region", key: r.id, terms: [...new Set(Object.values(r.names).map(norm))], exact: [], label: (l) => r.names[l], sub: () => undefined });
  }
  entries.push({ kind: "global", key: "global", terms: GLOBAL_TERMS.map(norm), exact: [], label: (l) => GLOBAL_NAMES[l] });
  for (const city of CITIES) {
    const c = byIso.get(city.iso2);
    if (!c) continue;
    entries.push({ kind: "city", key: city.iso2, terms: [city.name, ...(city.alt ?? [])].map(norm), exact: [], label: (l) => c.names[l], sub: () => city.name });
  }

  const fuse = new Fuse(entries, { keys: ["terms"], includeScore: true, threshold: 0.34, ignoreLocation: true, minMatchCharLength: 2 });

  return function search(query: string, locale: Locale = "en", limit = 8): SearchHit[] {
    const q = norm(query);
    if (!q) return [];
    const scored = new Map<string, SearchHit>();
    const push = (e: Entry, score: number) => {
      const id = `${e.kind === "city" ? "country" : e.kind}:${e.key}`;
      const prev = scored.get(id);
      if (prev && prev.score <= score) return;
      const label = e.label(locale);
      const sub = e.sub?.(locale);
      const hit: SearchHit = e.kind === "region" ? { kind: "region", id: e.key, label, sub, score }
        : e.kind === "global" ? { kind: "global", id: "global", label, sub, score }
        : { kind: "country", iso2: e.key, label, sub, score };
      scored.set(id, hit);
    };
    for (const e of entries) {
      if (e.exact.includes(q)) push(e, 0);
      else if (e.terms.some((t) => t.startsWith(q))) push(e, 0.05 + (e.kind === "city" ? 0.05 : 0));
    }
    for (const r of fuse.search(q, { limit: 20 })) push(r.item, 0.1 + (r.score ?? 1));
    return [...scored.values()].sort((a, b) => a.score - b.score || a.label.localeCompare(b.label)).slice(0, limit);
  };
}
