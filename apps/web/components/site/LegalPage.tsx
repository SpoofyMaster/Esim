import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import type { Block, LegalDoc } from "@/lib/legal";
import { fmt, intlLocale, localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

/** Highlights [placeholders] so unfinished legal text is impossible to miss. */
function Text({ s }: { s: string }) {
  return <>{s.split(/(\[[^\]]+\])/).map((p, i) => (p.startsWith("[") ? <mark key={i} className="rounded bg-amber-100 px-1 text-amber-900">{p}</mark> : p))}</>;
}

function BlockView({ b }: { b: Block }) {
  if (typeof b === "string") return <p className="leading-relaxed text-ice-700"><Text s={b} /></p>;
  if ("list" in b) return <ul className="list-disc space-y-2 ps-5 leading-relaxed text-ice-700 marker:text-blue-500">{b.list.map((x) => <li key={x}><Text s={x} /></li>)}</ul>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-ice-200">
      <table className="w-full text-start text-sm">
        <thead className="bg-ice-50 text-ice-900"><tr>{b.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 text-start font-semibold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-ice-100">{b.table.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`px-4 py-3 align-top ${i === 0 ? "font-mono text-[13px] text-ice-900" : "text-ice-700"}`}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function LegalPage({ lang, doc, title, children }: { lang: Locale; doc: LegalDoc; title: string; children?: React.ReactNode }) {
  const t = getDict(lang).legal;
  const date = new Intl.DateTimeFormat(intlLocale(lang), { dateStyle: "long" }).format(new Date(doc.updated));
  const english = lang === "en";
  return (
    <>
      <SiteHeader lang={lang} />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-ice-50 to-white">
          <div aria-hidden className="drift absolute -top-32 end-[-8%] size-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(57,198,255,0.22),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
            <nav aria-label="Breadcrumb" className="text-sm text-ice-600"><a href={localePath(lang, "/")} className="hover:underline">BLEUSIM</a> / <span aria-current="page">{title}</span></nav>
            <h1 className="reveal mt-4 font-display text-[40px] font-semibold tracking-[-0.03em] text-ice-900 md:text-[56px]">{title}</h1>
            <p className="mt-3 text-ice-600">{fmt(t.lastUpdated, { date })}</p>
          </div>
        </section>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 md:px-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <nav aria-label={t.contents} className="sticky top-28">
              <p className="text-sm font-semibold text-ice-900">{t.contents}</p>
              <ol className="mt-4 space-y-1 border-s border-ice-200 text-sm" lang="en" dir="ltr">
                {doc.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-ice-600 transition hover:border-blue-500 hover:text-ice-900">{s.title}</a></li>)}
              </ol>
            </nav>
          </aside>
          <div className="min-w-0">
            <p role="note" className="rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-4 text-sm text-amber-900">{t.draft}</p>
            {!english && <p className="mt-3 rounded-2xl bg-ice-50 px-5 py-4 text-sm text-ice-700">{t.englishOnly}</p>}
            {children}
            <article lang="en" dir="ltr" className="mt-10 max-w-3xl">
              <p className="text-lg leading-relaxed text-ice-700"><Text s={doc.intro} /></p>
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-12 scroll-mt-28">
                  <h2 id={`${s.id}-h`} className="font-display text-2xl font-semibold tracking-tight text-ice-900">{s.title}</h2>
                  <div className="mt-4 space-y-4">{s.blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
