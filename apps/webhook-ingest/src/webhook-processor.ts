import { paymentCompletedPosting } from "../../../libs/ledger-postings/src/payment-postings.ts";
import type { InMemoryGranvilleStore } from "../../../libs/persistence/src/in-memory-store.ts";
import { normalizeProviderWebhook } from "../../../libs/provider-adapters/webhook-normalizer.ts";

const providerStatusToPaymentStatus = {
  accepted: "provider_accepted",
  processing: "processing",
  completed: "completed",
  failed: "failed",
  returned: "returned",
  cancelled: "cancelled",
} as const;

export class WebhookProcessor {
  store: InMemoryGranvilleStore;

  constructor(store: InMemoryGranvilleStore) {
    this.store = store;
  }

  runOnce(): boolean {
    const webhook = this.store.claimWebhookForProcessing();
    if (!webhook) {
      return false;
    }
    try {
      this.processWebhook(webhook.id);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.store.markWebhookFailed(webhook.id, message);
      return false;
    }
  }

  drain(maxJobs = 100): number {
    let processed = 0;
    for (let index = 0; index < maxJobs; index += 1) {
      const didWork = this.runOnce();
      if (!didWork) {
        break;
      }
      processed += 1;
    }
    return processed;
  }

  private processWebhook(webhookId: string): void {
    const webhook = this.store.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Unknown webhook_event: ${webhookId}`);
    }

    const body = parseBody(webhook.body);
    const normalized = normalizeProviderWebhook(webhook.providerCode, body);

    if (!normalized.providerReference && !normalized.providerTransactionId) {
      this.store.markWebhookIgnored(webhookId);
      this.store.audit("service", "webhook.ignored", "webhook_event", webhookId, {
        reason: "no_matchable_identifier",
        providerCode: webhook.providerCode,
      });
      return;
    }

    const attempt = this.findPaymentAttempt(
      normalized.providerReference,
      normalized.providerTransactionId,
    );

    if (!attempt) {
      this.store.markWebhookIgnored(webhookId);
      this.store.audit("service", "webhook.ignored", "webhook_event", webhookId, {
        reason: "no_matching_payment_attempt",
        providerReference: normalized.providerReference,
        providerTransactionId: normalized.providerTransactionId,
      });
      return;
    }

    const order = this.store.paymentOrders.get(attempt.paymentOrderId);
    if (!order) {
      throw new Error(`Unknown payment_order: ${attempt.paymentOrderId}`);
    }

    if (normalized.status) {
      const newStatus = providerStatusToPaymentStatus[normalized.status];
      const completedAt =
        newStatus === "completed" || newStatus === "failed" ? new Date().toISOString() : undefined;

      this.store.updatePaymentAttempt(attempt.id, { status: newStatus, completedAt });
      const updatedOrder = this.store.updatePaymentOrder(order.id, {
        status: newStatus,
        completedAt,
      });

      if (newStatus === "completed") {
        const updatedAttempt = this.store.paymentAttempts.get(attempt.id);
        if (updatedAttempt) {
          this.store.enqueueLedgerPosting(paymentCompletedPosting(updatedOrder, updatedAttempt));
        }
      }
    }

    this.store.markWebhookProcessed(webhookId);
    this.store.audit("service", "webhook.processed", "webhook_event", webhookId, {
      providerCode: webhook.providerCode,
      providerReference: normalized.providerReference,
      providerTransactionId: normalized.providerTransactionId,
      status: normalized.status,
      paymentAttemptId: attempt.id,
      paymentOrderId: order.id,
    });
  }

  private findPaymentAttempt(providerReference?: string, providerTransactionId?: string) {
    if (providerReference) {
      const attempt = [...this.store.paymentAttempts.values()].find(
        (a) => a.providerReference === providerReference,
      );
      if (attempt) {
        return attempt;
      }
    }
    if (providerTransactionId) {
      const attempt = [...this.store.paymentAttempts.values()].find(
        (a) => a.providerTransactionId === providerTransactionId,
      );
      if (attempt) {
        return attempt;
      }
    }
    return undefined;
  }
}

function parseBody(body: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
