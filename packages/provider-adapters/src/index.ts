// Provider-independent eSIM supplier interface (spec §25). Real adapters (eSIM Go, 1GLOBAL, Gigs, ...) are added
// only from official documentation once contracts and credentials exist. Nothing here calls a real network.

export interface ProvisionRequest { supplierPlanExternalId: string; idempotencyKey: string; customerRef: string }
export interface ProvisionResult { iccid: string; lpa: string; smdpAddress: string; matchingId: string; supplierOrderRef: string; isSandbox: boolean }
export interface UsageResult { iccid: string; usedMb: number; totalMb: number | null; status: "NOT_ACTIVE" | "ACTIVE" | "DEPLETED" | "EXPIRED"; observedAt: string }

export interface EsimProvider {
  readonly id: string;
  readonly isSandbox: boolean;
  provision(req: ProvisionRequest): Promise<ProvisionResult>;
  usage(iccid: string): Promise<UsageResult>;
  topUp(iccid: string, supplierPlanExternalId: string, idempotencyKey: string): Promise<{ supplierOrderRef: string }>;
}

export class ProviderError extends Error {
  constructor(public provider: string, public retryable: boolean, message: string) { super(message); }
}

const fnv = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const planGb = (externalId: string) => { const m = /-(\d+)-\d+$/.exec(externalId); return m ? Number(m[1]) : null; };

/**
 * SANDBOX provider. Deterministic and offline. Issues ICCIDs in a clearly fake range and an SM-DP+ address on the
 * reserved `.invalid` TLD, so a sandbox QR code can never install a real profile on a device.
 */
export function createSandboxProvider(opts: { failEveryNth?: number } = {}): EsimProvider {
  const usage = new Map<string, { used: number; total: number | null }>();
  let calls = 0;
  return {
    id: "dev-sandbox",
    isSandbox: true,
    async provision(req) {
      calls++;
      if (opts.failEveryNth && calls % opts.failEveryNth === 0) throw new ProviderError("dev-sandbox", true, "Simulated transient supplier failure");
      // Deterministic per idempotency key, so a retried call returns the same profile.
      const h = fnv(req.idempotencyKey).toString().padStart(10, "0");
      const iccid = ("890000000" + h).slice(0, 19) + "0";
      const matchingId = "SBX-" + h.slice(0, 5) + "-" + h.slice(5, 10);
      const smdpAddress = "smdp.sandbox.bleusim.invalid";
      const lpa = ["LPA:1", smdpAddress, matchingId].join("$");
      const gb = planGb(req.supplierPlanExternalId);
      if (!usage.has(iccid)) usage.set(iccid, { used: 0, total: gb ? gb * 1024 : null });
      return { iccid, lpa, smdpAddress, matchingId, supplierOrderRef: "sbx_" + h, isSandbox: true };
    },
    async usage(iccid) {
      const u = usage.get(iccid) ?? { used: 0, total: null };
      return { iccid, usedMb: u.used, totalMb: u.total, status: "NOT_ACTIVE", observedAt: new Date().toISOString() };
    },
    async topUp(iccid, planId, key) {
      const u = usage.get(iccid);
      const gb = planGb(planId);
      if (u && u.total !== null && gb) u.total += gb * 1024;
      return { supplierOrderRef: "sbx_topup_" + fnv(key) };
    },
  };
}
