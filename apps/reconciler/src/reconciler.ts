import type { InMemoryGranvilleStore } from "../../../libs/persistence/src/in-memory-store.ts";

const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

export class Reconciler {
  store: InMemoryGranvilleStore;

  constructor(store: InMemoryGranvilleStore) {
    this.store = store;
  }

  runTransactionLevel(): { runId: string; exceptionCount: number } {
    const run = this.store.createReconciliationRun({
      runType: "transaction_level",
      summary: {},
    });
    this.store.updateReconciliationRun(run.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });

    let exceptionCount = 0;
    const staleCutoff = new Date(Date.now() - STALE_THRESHOLD_MS).toISOString();

    // --- Per-order checks ---
    for (const order of this.store.paymentOrders.values()) {
      const attempts = [...this.store.paymentAttempts.values()].filter(
        (attempt) => attempt.paymentOrderId === order.id,
      );
      const providerTransactions = [...this.store.providerTransactions.values()].filter((txn) =>
        attempts.some((attempt) => attempt.id === txn.paymentAttemptId),
      );
      const ledgerPostings = [...this.store.ledgerQueue.values()].filter(
        (posting) => posting.aggregateType === "payment_order" && posting.aggregateId === order.id,
      );

      let orderHasException = false;

      if (order.status === "completed" && providerTransactions.length === 0) {
        exceptionCount += 1;
        orderHasException = true;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          paymentOrderId: order.id,
          category: "missing_provider_transaction",
          severity: "critical",
          description: "Completed payment is missing a provider transaction record",
          evidence: { paymentOrderId: order.id, orderStatus: order.status },
        });
      }

      if (
        order.status === "completed" &&
        !ledgerPostings.some((posting) => posting.status === "posted")
      ) {
        exceptionCount += 1;
        orderHasException = true;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          paymentOrderId: order.id,
          category: "ledger_posting_missing",
          severity: "critical",
          description: "Completed payment is missing a posted ledger effect",
          evidence: {
            paymentOrderId: order.id,
            ledgerPostingCount: ledgerPostings.length,
            pendingPostings: ledgerPostings.filter((p) => p.status !== "posted").length,
          },
        });
      }

      if (
        ["submitted_to_provider", "processing"].includes(order.status) &&
        order.submittedAt &&
        order.submittedAt < staleCutoff
      ) {
        exceptionCount += 1;
        orderHasException = true;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          paymentOrderId: order.id,
          category: "stale_pending_transaction",
          severity: "warning",
          description: `Payment order has been in ${order.status} for over 1 hour`,
          evidence: {
            paymentOrderId: order.id,
            status: order.status,
            submittedAt: order.submittedAt,
          },
        });
      }

      for (const txn of providerTransactions) {
        if (txn.amount !== order.amount.amount) {
          exceptionCount += 1;
          orderHasException = true;
          this.store.createReconciliationException({
            reconciliationRunId: run.id,
            paymentOrderId: order.id,
            paymentAttemptId: txn.paymentAttemptId,
            providerTransactionId: txn.id,
            category: "amount_mismatch",
            severity: "critical",
            description:
              "Provider transaction amount does not match Granville payment order amount",
            evidence: {
              paymentAmount: order.amount.amount,
              providerAmount: txn.amount,
            },
          });
        }

        if (txn.asset !== order.amount.asset) {
          exceptionCount += 1;
          orderHasException = true;
          this.store.createReconciliationException({
            reconciliationRunId: run.id,
            paymentOrderId: order.id,
            paymentAttemptId: txn.paymentAttemptId,
            providerTransactionId: txn.id,
            category: "currency_mismatch",
            severity: "critical",
            description: "Provider transaction asset does not match Granville payment order asset",
            evidence: {
              paymentAsset: order.amount.asset,
              providerAsset: txn.asset,
            },
          });
        }

        if (
          (txn.status === "completed" && order.status !== "completed") ||
          (txn.status === "failed" && order.status !== "failed")
        ) {
          exceptionCount += 1;
          orderHasException = true;
          this.store.createReconciliationException({
            reconciliationRunId: run.id,
            paymentOrderId: order.id,
            paymentAttemptId: txn.paymentAttemptId,
            providerTransactionId: txn.id,
            category: "status_mismatch",
            severity: "warning",
            description:
              "Provider transaction status does not match Granville payment order status",
            evidence: {
              orderStatus: order.status,
              providerStatus: txn.status,
            },
          });
        }
      }

      const hasPostedLedger = ledgerPostings.some((p) => p.status === "posted");
      this.store.createReconciliationRecord({
        reconciliationRunId: run.id,
        paymentOrderId: order.id,
        matchStatus: orderHasException
          ? "exception"
          : providerTransactions.length > 0 && hasPostedLedger
            ? "matched"
            : "unmatched",
        evidence: {
          providerTransactionCount: providerTransactions.length,
          ledgerPostingCount: ledgerPostings.length,
          hasPostedLedger,
        },
      });
    }

    // --- Cross-cutting checks (not tied to a single order) ---

    // missing_internal_transaction: provider txn has no linked payment attempt
    for (const txn of this.store.providerTransactions.values()) {
      if (!txn.paymentAttemptId || !this.store.paymentAttempts.has(txn.paymentAttemptId)) {
        exceptionCount += 1;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          providerTransactionId: txn.id,
          category: "missing_internal_transaction",
          severity: "critical",
          description: "Provider transaction has no matching Granville payment attempt",
          evidence: { providerTransactionId: txn.providerTransactionId },
        });
        this.store.createReconciliationRecord({
          reconciliationRunId: run.id,
          providerTransactionId: txn.id,
          matchStatus: "exception",
          evidence: { reason: "missing_internal_transaction" },
        });
      }
    }

    // duplicate_provider_reference: multiple provider txns share the same providerReference
    const refToIds = new Map<string, string[]>();
    for (const txn of this.store.providerTransactions.values()) {
      if (txn.providerReference) {
        const key = `${txn.providerBindingId}:${txn.providerReference}`;
        const ids = refToIds.get(key) ?? [];
        ids.push(txn.id);
        refToIds.set(key, ids);
      }
    }
    for (const [, ids] of refToIds) {
      if (ids.length > 1) {
        exceptionCount += 1;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          providerTransactionId: ids[0],
          category: "duplicate_provider_reference",
          severity: "critical",
          description: "Multiple provider transactions share the same provider reference",
          evidence: { duplicateTransactionIds: ids },
        });
      }
    }

    this.store.updateReconciliationRun(run.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      summary: {
        exceptionCount,
        paymentOrderCount: this.store.paymentOrders.size,
        providerTransactionCount: this.store.providerTransactions.size,
      },
    });
    this.store.audit("service", "reconciliation.completed", "reconciliation_run", run.id, {
      exceptionCount,
    });

    return { runId: run.id, exceptionCount };
  }
}
