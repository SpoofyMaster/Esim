"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COUNTRIES, REGIONS, createSearch, flagEmoji, type SearchHit } from "@bleusim/geospatial";
import { explorer } from "@/lib/store";

const search = createSearch(COUNTRIES, REGIONS);
const POPULAR = ["JP", "US", "MA", "FR", "TR", "TH", "GB", "AE"];
const RECENT_KEY = "bleusim.recent";

function readRecent(): string[] { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; } }
function pushRecent(key: string) { try { const r = [key, ...readRecent().filter((k) => k !== key)].slice(0, 4); localStorage.setItem(RECENT_KEY, JSON.stringify(r)); } catch { /* storage unavailable */ } }

function hitKey(h: SearchHit) { return h.kind === "country" ? `c:${h.iso2}` : h.kind === "region" ? `r:${h.id}` : "g"; }
function keyToHit(k: string): SearchHit | null {
  if (k === "g") return { kind: "global", id: "global", label: "Global", score: 0 };
  if (k.startsWith("r:")) { const r = REGIONS.find((x) => x.id === k.slice(2)); return r ? { kind: "region", id: r.id, label: r.names.en, score: 0 } : null; }
  const c = COUNTRIES.find((x) => x.iso2 === k.slice(2)); return c ? { kind: "country", iso2: c.iso2!, label: c.names.en, score: 0 } : null;
}

export function SearchBox({ autoFocus = false, size = "lg" }: { autoFocus?: boolean; size?: "lg" | "md" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setRecent(readRecent()), [open]);

  const results: { group: string; hits: SearchHit[] }[] = useMemo(() => {
    if (q.trim()) return [{ group: "Destinations", hits: search(q, "en", 8) }];
    const groups = [];
    const rec = recent.map(keyToHit).filter(Boolean) as SearchHit[];
    if (rec.length) groups.push({ group: "Recent", hits: rec });
    groups.push({ group: "Popular", hits: POPULAR.map((i) => keyToHit(`c:${i}`)!).filter(Boolean) });
    groups.push({ group: "Regions & global", hits: [...REGIONS.slice(0, 3).map((r) => keyToHit(`r:${r.id}`)!), keyToHit("g")!] });
    return groups;
  }, [q, recent]);
  const flat = results.flatMap((g) => g.hits);

  function choose(h: SearchHit) {
    pushRecent(hitKey(h));
    if (h.kind === "country") explorer.select({ kind: "country", iso2: h.iso2 });
    else if (h.kind === "region") explorer.select({ kind: "region", id: h.id });
    else explorer.select({ kind: "global" });
    setQ(""); setOpen(false); inputRef.current?.blur();
  }

  const big = size === "lg";
  let idx = -1;
  return (
    <div className="relative w-full" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); const h = flat[active] ?? flat[0]; if (h) choose(h); }}
        className={`glass flex items-center gap-3 rounded-2xl ${big ? "h-16 pl-5 pr-2" : "h-12 pl-4 pr-1.5"} transition-colors focus-within:border-cyan-400/50`}>
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-cyan-300"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        <label htmlFor={`${listId}-input`} className="sr-only">Where are you going?</label>
        <input
          id={`${listId}-input`} ref={inputRef} autoFocus={autoFocus} value={q} autoComplete="off" spellCheck={false}
          role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={open && flat[active] ? `${listId}-${active}` : undefined}
          placeholder="Where are you going?"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setActive(0); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, flat.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Escape") { setOpen(false); }
          }}
          className={`min-w-0 flex-1 bg-transparent ${big ? "text-lg" : "text-base"} text-ice-50 placeholder:text-ice-400 outline-none`}
        />
        <button type="submit" className={`shrink-0 rounded-xl bg-blue-500 font-medium text-white transition hover:bg-blue-400 active:scale-[0.98] ${big ? "h-12 px-5" : "h-9 px-4 text-sm"}`}>
          <span className={big ? "hidden sm:inline" : ""}>Find your eSIM</span>
          {big && <span className="sm:hidden" aria-hidden>Search</span>}
          {big && <span className="sr-only sm:hidden">Find your eSIM</span>}
        </button>
      </form>
      {open && flat.length > 0 && (
        <div className="glass absolute inset-x-0 top-full z-30 mt-2 max-h-[min(60vh,420px)] overflow-auto rounded-2xl p-2" >
          <ul id={listId} role="listbox" aria-label="Destinations">
            {results.map((g) => (
              <li key={g.group} role="presentation">
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ice-400">{g.group}</div>
                <ul role="presentation">
                  {g.hits.map((h) => {
                    idx++;
                    const i = idx;
                    return (
                      <li key={hitKey(h) + g.group} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                        onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(h)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-blue-500/20" : ""}`}>
                        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-space-700/70 text-lg">
                          {h.kind === "country" ? flagEmoji(h.iso2) : h.kind === "region" ? "◎" : "◍"}
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] text-ice-50">{h.label}</span>
                          {(h.sub || h.kind !== "country") && <span className="block text-xs text-ice-400">{h.sub ? `${h.sub}` : h.kind === "region" ? "Regional plans" : "Worldwide plans"}</span>}
                        </span>
                        <span aria-hidden className="text-xs text-ice-400">↵</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
