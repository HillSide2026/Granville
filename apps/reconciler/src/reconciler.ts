import { InMemoryGranvilleStore } from "../../../libs/persistence/src/in-memory-store.ts";

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
    for (const order of this.store.paymentOrders.values()) {
      const attempts = [...this.store.paymentAttempts.values()].filter(
        (attempt) => attempt.paymentOrderId === order.id,
      );
      const providerTransactions = [...this.store.providerTransactions.values()].filter(
        (transaction) => attempts.some((attempt) => attempt.id === transaction.paymentAttemptId),
      );
      const ledgerPostings = [...this.store.ledgerQueue.values()].filter(
        (posting) => posting.aggregateType === "payment_order" && posting.aggregateId === order.id,
      );

      if (order.status === "completed" && providerTransactions.length === 0) {
        exceptionCount += 1;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          paymentOrderId: order.id,
          category: "missing_provider_transaction",
          severity: "critical",
          description: "Completed payment is missing a provider transaction record",
          evidence: { paymentOrderId: order.id },
        });
      }

      if (
        order.status === "completed" &&
        !ledgerPostings.some((posting) => posting.status === "posted")
      ) {
        exceptionCount += 1;
        this.store.createReconciliationException({
          reconciliationRunId: run.id,
          paymentOrderId: order.id,
          category: "ledger_posting_missing",
          severity: "critical",
          description: "Completed payment is missing a posted ledger effect",
          evidence: { paymentOrderId: order.id },
        });
      }

      for (const transaction of providerTransactions) {
        if (transaction.amount !== order.amount.amount) {
          exceptionCount += 1;
          this.store.createReconciliationException({
            reconciliationRunId: run.id,
            paymentOrderId: order.id,
            paymentAttemptId: transaction.paymentAttemptId,
            providerTransactionId: transaction.id,
            category: "amount_mismatch",
            severity: "critical",
            description: "Provider transaction amount does not match Granville payment order amount",
            evidence: {
              paymentAmount: order.amount.amount,
              providerAmount: transaction.amount,
            },
          });
        }
        if (transaction.asset !== order.amount.asset) {
          exceptionCount += 1;
          this.store.createReconciliationException({
            reconciliationRunId: run.id,
            paymentOrderId: order.id,
            paymentAttemptId: transaction.paymentAttemptId,
            providerTransactionId: transaction.id,
            category: "currency_mismatch",
            severity: "critical",
            description: "Provider transaction asset does not match Granville payment order asset",
            evidence: {
              paymentAsset: order.amount.asset,
              providerAsset: transaction.asset,
            },
          });
        }
      }
    }

    this.store.updateReconciliationRun(run.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      summary: {
        exceptionCount,
        paymentOrderCount: this.store.paymentOrders.size,
      },
    });
    this.store.audit("service", "reconciliation.completed", "reconciliation_run", run.id, {
      exceptionCount,
    });

    return { runId: run.id, exceptionCount };
  }
}
