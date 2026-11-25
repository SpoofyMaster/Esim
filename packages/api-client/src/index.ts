import type { CatalogProvider, DestinationSummary, Plan } from "@bleusim/catalog";

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

export function createApiClient(baseUrl: string, fetchImpl: typeof fetch = fetch) {
  async function get<T>(path: string): Promise<T> {
    const r = await fetchImpl(`${baseUrl}${path}`, { headers: { accept: "application/json" } });
    if (!r.ok) throw new ApiError(r.status, `${r.status} ${path}`);
    return r.json() as Promise<T>;
  }
  const plans = (id: string) => get<{ plans: Plan[] }>(`/v1/destinations/${encodeURIComponent(id)}/plans`).then((x) => x.plans).catch((e) => { if (e instanceof ApiError && e.status === 404) return []; throw e; });
  const catalog: CatalogProvider = {
    listDestinations: () => get<{ destinations: (DestinationSummary & { kind: string })[] }>("/v1/destinations").then((x) => x.destinations.filter((d) => d.kind === "COUNTRY")),
    plansForCountry: (iso2) => plans(iso2.toLowerCase()),
    plansForRegion: (id) => plans(`region:${id}`),
    globalPlans: () => plans("global"),
  };
  return { catalog };
}
