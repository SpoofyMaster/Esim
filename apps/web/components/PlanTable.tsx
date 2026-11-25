import type { Plan } from "@bleusim/catalog";
import { formatPrice } from "@/lib/catalog-format";

export function PlanTable({ plans, title }: { plans: Plan[]; title: string }) {
  const fixture = plans.some((p) => p.source === "DEV_FIXTURE");
  return (
    <section aria-labelledby="plans-h" className="mt-10">
      <h2 id="plans-h" className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {fixture && <p role="note" className="mt-2 text-sm text-amber-900 dark:text-amber-200">Sandbox catalog: these plans and prices are development fixtures, not real offers.</p>}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-[var(--bg-subtle)] text-[var(--fg-muted)]"><tr><th scope="col" className="px-4 py-3 font-medium">Data</th><th scope="col" className="font-medium">Validity</th><th scope="col" className="font-medium">Price</th><th scope="col" className="sr-only">Buy</th></tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3.5 font-display text-base font-semibold">{p.dataGb === null ? "Unlimited" : `${p.dataGb} GB`}{p.fairUsage && <span className="block text-xs font-normal text-[var(--fg-muted)]">Fair use applies</span>}</th>
                <td>{p.validityDays} days</td>
                <td className="font-medium">{formatPrice(p.price.amount, p.price.currency)}</td>
                <td className="pr-4 text-right"><a href={`/checkout?plan=${p.id}`} className="inline-flex h-9 items-center rounded-lg bg-blue-500 px-4 font-medium text-white hover:bg-blue-400">Buy<span className="sr-only"> {p.dataGb === null ? "unlimited" : `${p.dataGb} GB`} plan</span></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
