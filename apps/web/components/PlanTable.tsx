import type { Plan } from "@bleusim/catalog";
import { formatPrice } from "@/lib/catalog-format";
import { fmt, intlLocale, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

export function PlanTable({ plans, title, lang = "en" }: { plans: Plan[]; title: string; lang?: Locale }) {
  const t = getDict(lang);
  const il = intlLocale(lang);
  const fixture = plans.some((p) => p.source === "DEV_FIXTURE");
  const amount = (p: Plan) => (p.dataGb === null ? t.common.unlimited : fmt(t.common.gb, { n: p.dataGb }));
  return (
    <section aria-labelledby="plans-h" className="mt-10">
      <h2 id="plans-h" className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {fixture && <p role="note" className="mt-2 text-sm text-amber-900 dark:text-amber-200">{t.page.sandboxTable}</p>}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full min-w-[520px] text-start text-sm">
          <thead className="bg-[var(--bg-subtle)] text-[var(--fg-muted)]"><tr><th scope="col" className="px-4 py-3 text-start font-medium">{t.page.tableData}</th><th scope="col" className="text-start font-medium">{t.page.tableValidity}</th><th scope="col" className="text-start font-medium">{t.page.tablePrice}</th><th scope="col" className="sr-only">{t.page.buy}</th></tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3.5 text-start font-display text-base font-semibold">{amount(p)}{p.fairUsage && <span className="block text-xs font-normal text-[var(--fg-muted)]">{t.page.fairUseApplies}</span>}</th>
                <td>{fmt(t.common.days, { n: p.validityDays })}</td>
                <td className="font-medium">{formatPrice(p.price.amount, p.price.currency, il)}</td>
                <td className="pe-4 text-end"><a href={`/checkout?plan=${p.id}`} className="inline-flex h-9 items-center rounded-lg bg-blue-500 px-4 font-medium text-white hover:bg-blue-400">{t.page.buy}<span className="sr-only"> {fmt(t.page.buyPlan, { plan: amount(p) })}</span></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
