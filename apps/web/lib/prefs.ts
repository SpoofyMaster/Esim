// Visitor preferences kept only in this browser. Never sent to BLEUSIM's servers.
const KEY = "bleusim.prefs";
export interface Prefs { functional: boolean }
const DEFAULTS: Prefs = { functional: true };
export function readPrefs(): Prefs {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>) }; } catch { return DEFAULTS; }
}
export function writePrefs(p: Prefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); if (!p.functional) localStorage.removeItem("bleusim.recent"); } catch { /* storage unavailable */ }
}
