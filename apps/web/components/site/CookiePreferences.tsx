"use client";
import { useEffect, useState } from "react";

const KEY = "bleusim.cookieConsent";
type Prefs = { analytics: boolean; marketing: boolean; savedAt?: string };

function Toggle({ id, label, desc, checked, disabled, onChange }: { id: string; label: string; desc: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-4 py-5">
      <div className="flex-1">
        <label htmlFor={id} className="font-medium text-ice-900">{label}</label>
        <p id={`${id}-d`} className="mt-1 text-sm leading-relaxed text-ice-600">{desc}</p>
      </div>
      <button id={id} role="switch" aria-checked={checked} aria-describedby={`${id}-d`} disabled={disabled} onClick={() => onChange?.(!checked)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors duration-300 disabled:cursor-not-allowed ${checked ? "bg-blue-500" : "bg-ice-300"} ${disabled ? "opacity-60" : ""}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? "start-6" : "start-1"}`} />
      </button>
    </div>
  );
}

// English UI, like the policy it sits on. Choices are stored on this device only.
export function CookiePreferences() {
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false });
  const [saved, setSaved] = useState<string | null>(null);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setPrefs(JSON.parse(raw)); } catch { /* storage unavailable */ }
  }, []);
  function save(p: Prefs) {
    const v = { ...p, savedAt: new Date().toISOString() };
    setPrefs(v);
    try { localStorage.setItem(KEY, JSON.stringify(v)); setSaved("Your cookie preferences are saved."); } catch { setSaved("Your browser blocked saving preferences."); }
  }
  return (
    <section lang="en" dir="ltr" aria-labelledby="prefs-h" className="mt-6 rounded-3xl border border-ice-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(13,21,38,0.5)] md:p-8">
      <h2 id="prefs-h" className="font-display text-2xl font-semibold tracking-tight text-ice-900">Manage your preferences</h2>
      <p className="mt-2 text-ice-600">Choose which optional cookies BLEUSIM may use on this device. Essential storage is always on because the site needs it to work.</p>
      <div className="mt-4 divide-y divide-ice-100">
        <Toggle id="c-essential" label="Essential" desc="Sign-in, security and remembering these choices. Always active." checked disabled />
        <Toggle id="c-analytics" label="Analytics" desc="Would help us understand how the site is used. Not in use today: nothing is loaded even if you allow it." checked={prefs.analytics} onChange={(v) => setPrefs({ ...prefs, analytics: v })} />
        <Toggle id="c-marketing" label="Marketing" desc="Would measure advertising campaigns. Not in use today: nothing is loaded even if you allow it." checked={prefs.marketing} onChange={(v) => setPrefs({ ...prefs, marketing: v })} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => save(prefs)} className="h-11 rounded-full bg-blue-500 px-6 text-[15px] font-medium text-white transition hover:bg-blue-600">Save preferences</button>
        <button onClick={() => save({ analytics: false, marketing: false })} className="h-11 rounded-full border border-ice-300 px-6 text-[15px] font-medium text-ice-900 transition hover:bg-ice-50">Essential only</button>
        <button onClick={() => save({ analytics: true, marketing: true })} className="h-11 rounded-full border border-ice-300 px-6 text-[15px] font-medium text-ice-900 transition hover:bg-ice-50">Allow all</button>
      </div>
      <p role="status" className="mt-4 min-h-5 text-sm text-[#0E7A4A]">{saved}</p>
    </section>
  );
}
