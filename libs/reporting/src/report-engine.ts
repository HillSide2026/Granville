import type { InMemoryGranvilleStore } from "../../persistence/src/in-memory-store.ts";

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface PaymentHistoryRecord {
  paymentOrderId: string;
  customerId: string;
  paymentAccountId: string;
  amount: string;
  asset: string;
  status: string;
  providerReference?: string;
  providerBindingId?: string;
  attemptCount: number;
  lastError?: string;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface SettlementLine {
  providerBindingId: string;
  asset: string;
  completedCount: number;
  totalAmount: string;
  failedCount: number;
  returnedCount: number;
}

export interface CompliancePaymentRecord {
  paymentOrderId: string;
  customerId: string;
  paymentAccountId: string;
  beneficiaryReference?: string;
  amount: string;
  asset: string;
  status: string;
  providerBindingId?: string;
  providerAdapterKey?: string;
  providerTransactionId?: string;
  providerReference?: string;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface PlatformMetrics {
  // Operational rates and backlogs (ops-ui / internal)
  paymentFailureRate: number;
  webhookFailureCount: number;
  queueBacklog: number;
  ledgerPostingFailures: number;
  reconciliationExceptionCount: number;
  providerOutageStatus: Record<string, string>;
  calculatedAt: string;
  // Count-based fields (portal / dashboard)
  totalCustomers: number;
  totalPaymentAccounts: number;
  totalPaymentOrders: number;
  completedPayments: number;
  failedPayments: number;
  pendingPayments: number;
  openReconciliationExceptions: number;
  activeRoutingRules: number;
  ledgerPostingQueueDepth: number;
}

function inRange(timestamp: string | undefined, filter: DateRangeFilter): boolean {
  if (!timestamp) return true;
  if (filter.from && timestamp < filter.from) return false;
  if (filter.to && timestamp > filter.to) return false;
  return true;
}

export class ReportEngine {
  store: InMemoryGranvilleStore;

  constructor(store: InMemoryGranvilleStore) {
    this.store = store;
  }

  paymentHistory(filter: DateRangeFilter & { status?: string }): PaymentHistoryRecord[] {
    const results: PaymentHistoryRecord[] = [];

    for (const order of this.store.paymentOrders.values()) {
      if (!inRange(order.createdAt, filter)) continue;
      if (filter.status && order.status !== filter.status) continue;

      const attempts = [...this.store.paymentAttempts.values()].filter(
        (a) => a.paymentOrderId === order.id,
      );
      const lastAttempt = attempts.sort((a, b) => b.attemptNumber - a.attemptNumber)[0];

      results.push({
        paymentOrderId: order.id,
        customerId: order.customerId,
        paymentAccountId: order.paymentAccountId,
        amount: order.amount.amount,
        asset: order.amount.asset,
        status: order.status,
        providerReference: order.providerReference,
        providerBindingId: lastAttempt?.providerBindingId,
        attemptCount: attempts.length,
        lastError: lastAttempt?.lastError,
        createdAt: order.createdAt,
        submittedAt: order.submittedAt,
        completedAt: order.completedAt,
      });
    }

    return results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  auditExport(filter: DateRangeFilter): string {
    const lines = this.store.auditEvents
      .filter((e) => inRange(e.createdAt, filter))
      .map((e) => JSON.stringify(e));
    return lines.join("\n");
  }

  settlementSummary(filter: DateRangeFilter): SettlementLine[] {
    const buckets = new Map<string, SettlementLine>();

    for (const order of this.store.paymentOrders.values()) {
      if (!inRange(order.completedAt ?? order.createdAt, filter)) continue;

      const attempts = [...this.store.paymentAttempts.values()].filter(
        (a) => a.paymentOrderId === order.id,
      );
      const lastAttempt = attempts.sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
      if (!lastAttempt) continue;

      const key = `${lastAttempt.providerBindingId}:${order.amount.asset}`;
      const existing = buckets.get(key) ?? {
        providerBindingId: lastAttempt.providerBindingId,
        asset: order.amount.asset,
        completedCount: 0,
        totalAmount: "0",
        failedCount: 0,
        returnedCount: 0,
      };

      if (order.status === "completed") {
        existing.completedCount += 1;
        existing.totalAmount = String(BigInt(existing.totalAmount) + BigInt(order.amount.amount));
      } else if (order.status === "failed") {
        existing.failedCount += 1;
      } else if (order.status === "returned") {
        existing.returnedCount += 1;
      }

      buckets.set(key, existing);
    }

    return [...buckets.values()].sort((a, b) =>
      a.providerBindingId.localeCompare(b.providerBindingId),
    );
  }

  metricsSnapshot(): PlatformMetrics {
    const orders = [...this.store.paymentOrders.values()];
    const terminalOrders = orders.filter((o) =>
      ["completed", "failed", "returned", "cancelled"].includes(o.status),
    );
    const failedOrders = terminalOrders.filter((o) => o.status === "failed");
    const paymentFailureRate =
      terminalOrders.length > 0 ? failedOrders.length / terminalOrders.length : 0;

    const webhookFailureCount = [...this.store.webhooks.values()].filter(
      (w) => w.processingStatus === "failed",
    ).length;

    const pendingProviderCommands = [...this.store.providerCommandQueue.values()].filter(
      (c) => c.status === "pending",
    ).length;
    const queuedWebhooks = [...this.store.webhooks.values()].filter(
      (w) => w.processingStatus === "queued",
    ).length;
    const queueBacklog = pendingProviderCommands + queuedWebhooks;

    const ledgerPostingFailures = [...this.store.ledgerQueue.values()].filter(
      (p) => p.status === "dead_lettered" || p.status === "failed",
    ).length;

    const reconciliationExceptionCount = [...this.store.reconciliationExceptions.values()].filter(
      (e) => e.status === "open",
    ).length;

    const providerOutageStatus: Record<string, string> = {};
    for (const binding of this.store.providerBindings.values()) {
      const health = this.store.providerHealth.get(binding.id);
      providerOutageStatus[binding.adapterKey] = health?.status ?? "unknown";
    }

    const pendingStatuses = new Set(["created", "pending", "submitted", "processing", "provider_accepted", "pending_review"]);

    return {
      paymentFailureRate: Math.round(paymentFailureRate * 10000) / 10000,
      webhookFailureCount,
      queueBacklog,
      ledgerPostingFailures,
      reconciliationExceptionCount,
      providerOutageStatus,
      calculatedAt: new Date().toISOString(),
      totalCustomers: this.store.customers.size,
      totalPaymentAccounts: this.store.paymentAccounts.size,
      totalPaymentOrders: this.store.paymentOrders.size,
      completedPayments: orders.filter((o) => o.status === "completed").length,
      failedPayments: failedOrders.length,
      pendingPayments: orders.filter((o) => pendingStatuses.has(o.status)).length,
      openReconciliationExceptions: reconciliationExceptionCount,
      activeRoutingRules: [...this.store.routingRules.values()].filter((r) => r.active).length,
      ledgerPostingQueueDepth: [...this.store.ledgerQueue.values()].filter(
        (p) => p.status === "pending" || p.status === "queued",
      ).length,
    };
  }

  compliancePaymentsReport(filter: DateRangeFilter): CompliancePaymentRecord[] {
    const results: CompliancePaymentRecord[] = [];

    for (const order of this.store.paymentOrders.values()) {
      if (!inRange(order.createdAt, filter)) continue;

      const attempts = [...this.store.paymentAttempts.values()].filter(
        (a) => a.paymentOrderId === order.id,
      );
      const lastAttempt = attempts.sort((a, b) => b.attemptNumber - a.attemptNumber)[0];

      const binding = lastAttempt?.providerBindingId
        ? this.store.providerBindings.get(lastAttempt.providerBindingId)
        : undefined;

      const providerTxn = lastAttempt
        ? [...this.store.providerTransactions.values()].find(
            (t) => t.paymentAttemptId === lastAttempt.id,
          )
        : undefined;

      results.push({
        paymentOrderId: order.id,
        customerId: order.customerId,
        paymentAccountId: order.paymentAccountId,
        beneficiaryReference: order.beneficiaryReference,
        amount: order.amount.amount,
        asset: order.amount.asset,
        status: order.status,
        providerBindingId: lastAttempt?.providerBindingId,
        providerAdapterKey: binding?.adapterKey,
        providerTransactionId: providerTxn?.providerTransactionId,
        providerReference: order.providerReference,
        createdAt: order.createdAt,
        submittedAt: order.submittedAt,
        completedAt: order.completedAt,
      });
    }

    return results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
