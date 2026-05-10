import { paymentCompletedPosting } from "../../../libs/ledger-postings/src/payment-postings.ts";
import {
  InMemoryGranvilleStore,
  type ProviderCommandQueueItem,
} from "../../../libs/persistence/src/in-memory-store.ts";
import { ProviderAdapterRegistry } from "../../../libs/provider-adapters/adapter-registry.ts";

const providerStatusToPaymentStatus = {
  accepted: "provider_accepted",
  processing: "processing",
  completed: "completed",
  failed: "failed",
  returned: "returned",
  cancelled: "cancelled",
} as const;

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
    try {
      await this.executeProviderCommand(command);
      this.store.markProviderCommandCompleted(command.id);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.store.markProviderCommandFailed(command.id, message);
      this.store.updatePaymentAttempt(command.paymentAttemptId, {
        status: "failed",
        lastError: message,
      });
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
      this.store.enqueueLedgerPosting(
        paymentCompletedPosting(updatedOrder, updatedAttempt),
      );
    }

    this.store.audit("service", "provider_runtime.payment_executed", "payment_attempt", attempt.id, {
      providerBindingId: attempt.providerBindingId,
      providerTransactionId: result.providerTransactionId,
      status,
    });
  }
}
