"use client";
import { useEffect, useState } from "react";
import { readPrefs, writePrefs } from "@/lib/prefs";

export function CookieChoices() {
  const [functional, setFunctional] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => setFunctional(readPrefs().functional), []);
  const rows: { name: string; desc: string; state: "always" | "toggle" | "unused" }[] = [
    { name: "Essential", desc: "Keep you signed in and protect your account and checkout. The site cannot work without them.", state: "always" },
    { name: "Functional", desc: "Remember your recent destination searches on this device. Stored only in your browser, never sent to us.", state: "toggle" },
    { name: "Analytics", desc: "We do not use analytics cookies today. If we add them, we will ask you first.", state: "unused" },
    { name: "Advertising", desc: "We do not use advertising or cross-site tracking cookies.", state: "unused" },
  ];
  return (
    <div className="not-legal mt-4 divide-y divide-ice-200 rounded-2xl border border-ice-200">
      {rows.map((r) => (
        <div key={r.name} className="flex items-start gap-4 p-5">
          <div className="flex-1">
            <p className="font-semibold text-ice-900">{r.name}</p>
            <p className="mt-1 text-sm text-ice-600">{r.desc}</p>
          </div>
          {r.state === "always" && <span className="shrink-0 rounded-full bg-ice-100 px-3 py-1 text-xs font-medium text-ice-700">Always on</span>}
          {r.state === "unused" && <span className="shrink-0 rounded-full bg-ice-50 px-3 py-1 text-xs font-medium text-ice-500">Not used</span>}
          {r.state === "toggle" && (
            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" checked={!!functional} disabled={functional === null}
                onChange={(e) => { const v = e.target.checked; setFunctional(v); writePrefs({ functional: v }); setSaved(true); }} />
              <span className="sr-only">Allow functional storage</span>
              <span aria-hidden className="h-7 w-12 rounded-full bg-ice-300 transition peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400" />
              <span aria-hidden className="absolute start-1 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
            </label>
          )}
        </div>
      ))}
      <p role="status" className="px-5 py-3 text-sm text-ice-600">{saved ? "Your choice is saved on this device." : "Changes are saved on this device as soon as you make them."}</p>
    </div>
  );
}
