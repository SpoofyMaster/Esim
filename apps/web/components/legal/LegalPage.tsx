import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export interface LegalSection { id: string; title: string; body: React.ReactNode }

/** Highlighted placeholder for details only the company can supply (entity, address, law, contacts). */
export const Fill = ({ children }: { children: React.ReactNode }) => <mark className="rounded bg-amber-100 px-1 text-amber-900">[{children}]</mark>;

export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <div className="min-h-dvh bg-white text-ice-900">
      <header className="border-b border-ice-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <a href="/" aria-label="BLEUSIM home"><Logo className="h-7" adaptive /></a>
          <nav aria-label="Legal" className="flex gap-1 text-sm text-ice-600">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"]].map(([l, h]) => <a key={h} href={h} className="rounded-full px-3 py-1.5 hover:bg-ice-50 hover:text-ice-900">{l}</a>)}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-8 text-sm">
            <p className="font-semibold text-ice-900">On this page</p>
            <ol className="mt-3 space-y-2 text-ice-600">{sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`} className="hover:text-blue-600">{i + 1}. {s.title}</a></li>)}</ol>
          </nav>
        </aside>
        <article className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-ice-500">Last updated: {updated}</p>
          <p role="note" className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong className="font-semibold">Draft for review.</strong> This document must be checked by a qualified lawyer and completed with BLEUSIM’s legal details (highlighted) before launch. It is not yet in force.
          </p>
          <div className="legal mt-8 text-[16px] leading-relaxed text-ice-700">{intro}</div>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="legal mt-10 scroll-mt-8 text-[16px] leading-relaxed text-ice-700">
              <h2 id={`${s.id}-h`} className="font-display text-2xl font-semibold tracking-tight text-ice-900">{i + 1}. {s.title}</h2>
              <div className="mt-3">{s.body}</div>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
