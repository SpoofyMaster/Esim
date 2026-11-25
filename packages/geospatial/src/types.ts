export type Locale = "en" | "fr" | "es" | "de" | "ar" | "pt" | "it";
export const LOCALES: Locale[] = ["en", "fr", "es", "de", "ar", "pt", "it"];

export interface Country {
  index: number; // GPU id-map index (1..n), 0 = ocean
  iso2: string | null;
  iso3: string | null;
  numeric: string | null;
  neName: string;
  names: Record<Locale, string>;
  aliases: string[];
  centroid: [number, number]; // [lng, lat]
  bbox: [number, number, number, number]; // [w, s, e, n]
  areaKm2: number;
  small: boolean;
}

export interface Region {
  id: string; // e.g. "europe"
  names: Record<Locale, string>;
  members: string[]; // ISO2 list (geographic grouping, NOT commercial coverage)
  focus: { lng: number; lat: number; distance: number };
}

export type SearchHit =
  | { kind: "country"; iso2: string; label: string; sub?: string; score: number }
  | { kind: "region"; id: string; label: string; sub?: string; score: number }
  | { kind: "global"; id: "global"; label: string; sub?: string; score: number };
