import { paymentCompletedPosting } from "../../../libs/ledger-postings/src/payment-postings.ts";
import type {
  InMemoryGranvilleStore,
  ProviderCommandQueueItem,
} from "../../../libs/persistence/src/in-memory-store.ts";
import { ProviderAdapterRegistry } from "../../../libs/provider-adapters/adapter-registry.ts";
import { AirwallexApiError } from "../../../libs/provider-adapters/airwallex/index.ts";
import { providerStatusToPaymentStatus } from "../../../libs/domain/src/provider-status.ts";

export class ProviderRuntime {
  store: InMemoryGranvilleStore;
  registry: ProviderAdapterRegistry;

  constructor(store: InMemoryGranvilleStore, registry = new ProviderAdapterRegistry()) {
    this.store = store;
    this.registry = registry;
  }

  async runOnce(): Promise<boolean> {
    const command = this.store.claimProviderCommand();
    if (!command) {
      return false;
    }

    const health = this.store.providerHealth.get(command.providerBindingId);
    if (health?.status === "disabled") {
      const failed = this.store.markProviderCommandFailed(
        command.id,
        `Provider binding ${command.providerBindingId} is disabled`,
      );
      if (failed.status === "dead_lettered") {
        this.#markAttemptAndOrderFailed(command.paymentAttemptId, failed.lastError ?? "");
      }
      return false;
    }

    try {
      await this.executeProviderCommand(command);
      this.store.markProviderCommandCompleted(command.id);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Transient provider errors (rate limit, gateway timeout) reset the command to pending
      // without consuming a retry slot so the backoff counter is not burned on infrastructure noise.
      const isTransient = error instanceof AirwallexApiError && error.transient;
      if (isTransient) {
        this.store.markProviderCommandTransient(command.id, message);
        return false;
      }
      const failed = this.store.markProviderCommandFailed(command.id, message);
      // Only mark the payment attempt as failed when the command is permanently dead-lettered.
      // Retryable application-level failures leave the attempt in its current state so it can recover.
      if (failed.status === "dead_lettered") {
        this.#markAttemptAndOrderFailed(command.paymentAttemptId, message);
      }
      return false;
    }
  }

  async drain(maxJobs = 100): Promise<number> {
    let processed = 0;
    for (let index = 0; index < maxJobs; index += 1) {
      const didWork = await this.runOnce();
      if (!didWork) {
        break;
      }
      processed += 1;
    }
    return processed;
  }

  async executePaymentAttempt(paymentAttemptId: string): Promise<void> {
    const attempt = this.store.paymentAttempts.get(paymentAttemptId);
    if (!attempt) {
      throw new Error(`Unknown payment_attempt: ${paymentAttemptId}`);
    }
    const command = this.store.enqueueProviderCommand({
      commandType: "initiate_payment",
      paymentOrderId: attempt.paymentOrderId,
      paymentAttemptId: attempt.id,
      providerBindingId: attempt.providerBindingId,
      idempotencyKey: `provider:payment:${attempt.paymentOrderId}:attempt:${attempt.id}:initiate`,
      payload: {
        paymentAttemptId: attempt.id,
      },
    });
    await this.executeProviderCommand(command);
    this.store.markProviderCommandCompleted(command.id);
  }

  async executeProviderCommand(command: ProviderCommandQueueItem): Promise<void> {
    const attempt = this.store.paymentAttempts.get(command.paymentAttemptId);
    if (!attempt) {
      throw new Error(`Unknown payment_attempt: ${command.paymentAttemptId}`);
    }
    const order = this.store.paymentOrders.get(attempt.paymentOrderId);
    if (!order) {
      throw new Error(`Unknown payment_order: ${attempt.paymentOrderId}`);
    }
    const binding = this.store.providerBindings.get(attempt.providerBindingId);
    if (!binding) {
      throw new Error(`Unknown provider_binding: ${attempt.providerBindingId}`);
    }
    const provider = this.registry.resolve(binding);

    if (attempt.providerReference) {
      const duplicate = [...this.store.providerTransactions.values()].find(
        (tx) =>
          tx.paymentAttemptId !== attempt.id &&
          tx.providerBindingId === attempt.providerBindingId &&
          tx.providerReference === attempt.providerReference,
      );
      if (duplicate) {
        throw new Error(
          `Duplicate provider reference detected: ${attempt.providerReference} already recorded on transaction ${duplicate.id}`,
        );
      }
    }

    const requestPayload = {
      granvillePaymentOrderId: order.id,
      granvillePaymentAttemptId: attempt.id,
      granvillePaymentAccountId: order.paymentAccountId,
      amount: order.amount.amount,
      asset: order.amount.asset,
      beneficiaryReference: order.beneficiaryReference,
      metadata: order.metadata,
    };
    const requestAttemptNumber =
      [...this.store.providerRequestAttempts.values()].filter(
        (candidate) => candidate.providerCommandId === command.id,
      ).length + 1;
    this.store.recordProviderRequestAttempt({
      providerCommandId: command.id,
      paymentAttemptId: attempt.id,
      providerBindingId: attempt.providerBindingId,
      attemptNumber: requestAttemptNumber,
      status: "processing",
      requestPayload,
    });
    const result = await provider.initiatePayment(requestPayload);
    this.store.recordProviderRequestAttempt({
      providerCommandId: command.id,
      paymentAttemptId: attempt.id,
      providerBindingId: attempt.providerBindingId,
      attemptNumber: requestAttemptNumber,
      status: "completed",
      requestPayload,
      responsePayload: result,
      providerReference: result.providerReference,
      completedAt: new Date().toISOString(),
    });
    const status = providerStatusToPaymentStatus[result.status];
    const completedAt = status === "completed" ? new Date().toISOString() : undefined;

    const updatedAttempt = this.store.updatePaymentAttempt(attempt.id, {
      status,
      providerTransactionId: result.providerTransactionId,
      providerReference: result.providerReference,
      completedAt,
      metadata: result.metadata,
    });
    const updatedOrder = this.store.updatePaymentOrder(order.id, {
      status,
      providerReference: result.providerReference,
      completedAt,
    });

    this.store.recordProviderTransaction({
      providerBindingId: attempt.providerBindingId,
      paymentAttemptId: attempt.id,
      paymentAccountId: order.paymentAccountId,
      providerTransactionId: result.providerTransactionId,
      providerReference: result.providerReference,
      direction: order.direction,
      status: result.status,
      amount: order.amount.amount,
      asset: order.amount.asset,
      rawPayload: result,
      metadata: result.metadata,
    });

    if (status === "completed") {
      this.store.enqueueLedgerPosting(paymentCompletedPosting(updatedOrder, updatedAttempt));
    }

    this.store.audit(
      "service",
      "provider_runtime.payment_executed",
      "payment_attempt",
      attempt.id,
      {
        providerBindingId: attempt.providerBindingId,
        providerTransactionId: result.providerTransactionId,
        status,
      },
    );
  }

  #markAttemptAndOrderFailed(paymentAttemptId: string, error: string): void {
    this.store.updatePaymentAttempt(paymentAttemptId, { status: "failed", lastError: error });
    const attempt = this.store.paymentAttempts.get(paymentAttemptId);
    if (attempt) {
      this.store.updatePaymentOrder(attempt.paymentOrderId, { status: "failed" });
    }
  }
}
