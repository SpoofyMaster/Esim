"use client";
import { useSyncExternalStore } from "react";

export type Selection =
  | { kind: "country"; iso2: string }
  | { kind: "region"; id: string }
  | { kind: "global" }
  | null;

export interface ExplorerState {
  selection: Selection;
  hoverIso: string | null;
  flyRequest: number; // increments when the camera should fly to the current selection
  globeReady: boolean;
  webgl: "unknown" | "ok" | "unavailable";
}

let state: ExplorerState = { selection: null, hoverIso: null, flyRequest: 0, globeReady: false, webgl: "unknown" };
const listeners = new Set<() => void>();
export const explorer = {
  get: () => state,
  set(patch: Partial<ExplorerState>) { state = { ...state, ...patch }; listeners.forEach((l) => l()); },
  select(selection: Selection, fly = true) {
    state = { ...state, selection, flyRequest: fly ? state.flyRequest + 1 : state.flyRequest };
    listeners.forEach((l) => l());
    syncUrl(selection);
  },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};
export function useExplorer<T>(sel: (s: ExplorerState) => T): T {
  return useSyncExternalStore(explorer.subscribe, () => sel(state), () => sel(state));
}

function syncUrl(s: Selection) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("d"); url.searchParams.delete("r"); url.searchParams.delete("g");
  if (s?.kind === "country") url.searchParams.set("d", s.iso2.toLowerCase());
  if (s?.kind === "region") url.searchParams.set("r", s.id);
  if (s?.kind === "global") url.searchParams.set("g", "1");
  window.history.replaceState(null, "", url);
}
export function selectionFromUrl(): Selection {
  const p = new URLSearchParams(window.location.search);
  if (p.get("d")) return { kind: "country", iso2: p.get("d")!.toUpperCase() };
  if (p.get("r")) return { kind: "region", id: p.get("r")! };
  if (p.get("g")) return { kind: "global" };
  return null;
}
