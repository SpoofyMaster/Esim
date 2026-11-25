import type { Db } from "@bleusim/database";
import { ProviderError, type EsimProvider } from "@bleusim/provider-adapters";
import type { Sealer } from "./crypto";

/** Provisions every unprovisioned item of a paid order. Safe to call again: items already provisioned are skipped. */
export function createProvisioner({ db, provider, sealer }: { db: Db; provider: EsimProvider; sealer: Sealer }) {
  return async function provisionOrder(orderId: string): Promise<"FULFILLED" | "PROVISIONING_FAILED"> {
    await db.order.update({ where: { id: orderId }, data: { status: "PROVISIONING" } });
    const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: { include: { retailPlan: { include: { supplierPlan: true } }, esim: true } } } });
    try {
      for (const item of order.items) {
        if (item.esim || item.provisionedAt) continue; // never provision twice
        if (item.topUpOfEsimId) {
          const target = await db.esimProfile.findUniqueOrThrow({ where: { id: item.topUpOfEsimId } });
          const sp = item.retailPlan.supplierPlan;
          const r = await provider.topUp(target.iccid, sp.externalId, item.id);
          await db.$transaction([
            db.orderItem.update({ where: { id: item.id }, data: { supplierOrderRef: r.supplierOrderRef, provisionAttempts: 1, provisionedAt: new Date() } }),
            db.esimProfile.update({ where: { id: target.id }, data: { dataTotalMb: target.dataTotalMb === null || sp.dataMb === null ? null : target.dataTotalMb + sp.dataMb } }),
          ]);
          continue;
        }
        const sp = item.retailPlan.supplierPlan;
        let attempt = 0;
        for (;;) {
          attempt++;
          try {
            const r = await provider.provision({ supplierPlanExternalId: sp.externalId, idempotencyKey: item.id, customerRef: order.id });
            await db.$transaction([
              db.orderItem.update({ where: { id: item.id }, data: { supplierOrderRef: r.supplierOrderRef, provisionAttempts: attempt, provisionedAt: new Date() } }),
              db.esimProfile.create({ data: { orderItemId: item.id, userId: order.userId, supplierId: provider.id, iccid: r.iccid, activationEncrypted: sealer.seal(r.lpa), isSandbox: r.isSandbox, dataTotalMb: sp.dataMb } }),
            ]);
            break;
          } catch (e) {
            if (e instanceof ProviderError && e.retryable && attempt < 3) continue;
            throw e;
          }
        }
      }
      await db.order.update({ where: { id: orderId }, data: { status: "FULFILLED" } });
      await db.auditLog.create({ data: { action: "order.fulfilled", target: orderId } });
      return "FULFILLED";
    } catch (e) {
      await db.order.update({ where: { id: orderId }, data: { status: "PROVISIONING_FAILED" } });
      await db.auditLog.create({ data: { action: "order.provisioning_failed", target: orderId, meta: { message: e instanceof Error ? e.message : String(e) } } });
      return "PROVISIONING_FAILED";
    }
  };
}
