import { randomUUID } from "node:crypto";
import type { PaymentAccount } from "../../../libs/contracts/account.ts";
import type { Customer } from "../../../libs/contracts/customer.ts";
import type { PaymentAttempt, PaymentOrder } from "../../../libs/contracts/payment.ts";
import type { ProviderBinding } from "../../../libs/contracts/provider.ts";
import type {
  ReconciliationException,
  ReconciliationRun,
} from "../../../libs/contracts/reconciliation.ts";
import {
  type AuditEvent,
  type CreateCustomerInput,
  type CreatePaymentOrderInput,
  InMemoryGranvilleStore,
  type LedgerQueueItem,
  type ProviderTransactionRecord,
  type WebhookEvent,
} from "../../../libs/persistence/src/in-memory-store.ts";
import { normalizeProviderWebhook } from "../../../libs/provider-adapters/webhook-normalizer.ts";
import {
  type DateRangeFilter,
  type PaymentHistoryRecord,
  type PlatformMetrics,
  ReportEngine,
  type SettlementLine,
} from "../../../libs/reporting/src/report-engine.ts";
import { LedgerWriter } from "../../ledger-writer/src/ledger-writer.ts";
import { GranvilleOrchestrator } from "../../orchestrator/src/orchestrator.ts";
import { ProviderRuntime } from "../../provider-runtime/src/provider-runtime.ts";
import { Reconciler } from "../../reconciler/src/reconciler.ts";
import { WebhookProcessor } from "../../webhook-ingest/src/webhook-processor.ts";

export interface ApiContext {
  idempotencyKey?: string;
}

export class GranvilleApi {
  readonly store: InMemoryGranvilleStore;
  orchestrator: GranvilleOrchestrator;
  providerRuntime: ProviderRuntime;
  ledgerWriter: LedgerWriter;
  reconciler: Reconciler;
  webhookProcessor: WebhookProcessor;
  reportEngine: ReportEngine;

  constructor(store = new InMemoryGranvilleStore()) {
    this.store = store;
    this.orchestrator = new GranvilleOrchestrator(store);
    this.providerRuntime = new ProviderRuntime(store);
    this.ledgerWriter = new LedgerWriter(store);
    this.reconciler = new Reconciler(store);
    this.webhookProcessor = new WebhookProcessor(store);
    this.reportEngine = new ReportEngine(store);
  }

  postCustomer(input: CreateCustomerInput, context: ApiContext = {}): Customer {
    return this.orchestrator.createCustomer(input, context);
  }

  getCustomer(id: string): Customer | undefined {
    return this.store.customers.get(id);
  }

  postPaymentAccount(
    input: {
      customerId: string;
      currencyCode?: string;
      countryCode?: string;
      displayName?: string;
      metadata?: Record<string, string>;
    },
    context: ApiContext = {},
  ): PaymentAccount {
    return this.orchestrator.openPaymentAccount(input, context);
  }

  getPaymentAccount(id: string): PaymentAccount | undefined {
    return this.store.paymentAccounts.get(id);
  }

  postPayment(input: CreatePaymentOrderInput, context: ApiContext = {}): PaymentOrder {
    return this.orchestrator.createPayment(input, context);
  }

  async submitPayment(id: string): Promise<PaymentOrder> {
    const submission = this.orchestrator.submitPayment(id);
    await this.providerRuntime.drain();
    this.ledgerWriter.postPending();
    return this.getPayment(id) ?? submission.order;
  }

  cancelPayment(id: string, reason?: string): PaymentOrder {
    return this.orchestrator.cancelPayment(id, reason);
  }

  retryPayment(id: string): PaymentOrder {
    const submission = this.orchestrator.retryPayment(id);
    return submission.order;
  }

  getPayment(id: string): PaymentOrder | undefined {
    return this.store.paymentOrders.get(id);
  }

  getPaymentStatus(id: string): { id: string; status: string } | undefined {
    const payment = this.store.paymentOrders.get(id);
    return payment ? { id: payment.id, status: payment.status } : undefined;
  }

  postWebhook(providerCode: string, body: string): { id: string; status: string } {
    const providerBindingId = this.store.getProviderBindingByAdapterKey(providerCode).id;
    const normalized = normalizeProviderWebhook(providerCode, parseWebhookBody(body));
    const event = {
      id: randomUUID(),
      providerBindingId,
      providerCode,
      processingStatus: "queued" as const,
      requestPath: `/webhooks/${providerCode}`,
      headers: {},
      queryParams: {},
      body,
      receivedAt: new Date().toISOString(),
      metadata: {
        normalizedProviderReference: normalized.providerReference ?? "",
        normalizedProviderTransactionId: normalized.providerTransactionId ?? "",
        normalizedStatus: normalized.status ?? "",
      },
    };
    this.store.webhooks.set(event.id, event);
    this.store.audit("service", "webhook.received", "webhook_event", event.id, {
      providerCode,
    });
    return { id: event.id, status: event.processingStatus };
  }

  drainWebhooks(): number {
    return this.webhookProcessor.drain();
  }

  postReconciliationRun(): { runId: string; exceptionCount: number } {
    return this.reconciler.runTransactionLevel();
  }

  runProviderWorker(): Promise<number> {
    return this.providerRuntime.drain();
  }

  postPendingLedger() {
    return this.ledgerWriter.postPending();
  }

  getReconciliationExceptions() {
    return [...this.store.reconciliationExceptions.values()];
  }

  getAuditEvents(): AuditEvent[] {
    return [...this.store.auditEvents];
  }

  // --- Admin methods ---

  adminGetCustomers(): Customer[] {
    return [...this.store.customers.values()];
  }

  adminGetPaymentAccounts(): PaymentAccount[] {
    return [...this.store.paymentAccounts.values()];
  }

  adminGetPayments(): PaymentOrder[] {
    return [...this.store.paymentOrders.values()];
  }

  adminGetPaymentAttempts(): PaymentAttempt[] {
    return [...this.store.paymentAttempts.values()];
  }

  adminGetProviderTransactions(): ProviderTransactionRecord[] {
    return [...this.store.providerTransactions.values()];
  }

  adminGetWebhookEvents(): WebhookEvent[] {
    return [...this.store.webhooks.values()];
  }

  adminGetLedgerPostings(): LedgerQueueItem[] {
    return [...this.store.ledgerQueue.values()];
  }

  adminGetReconciliationRuns(): ReconciliationRun[] {
    return [...this.store.reconciliationRuns.values()];
  }

  adminGetReconciliationExceptions(): ReconciliationException[] {
    return [...this.store.reconciliationExceptions.values()];
  }

  adminRetryWebhook(webhookId: string): { id: string; status: string } {
    const webhook = this.store.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Unknown webhook_event: ${webhookId}`);
    }
    if (!["failed", "ignored"].includes(webhook.processingStatus)) {
      throw new Error(
        `Webhook ${webhookId} cannot be retried from status: ${webhook.processingStatus}`,
      );
    }
    this.store.queueWebhookForProcessing(webhookId);
    this.store.audit("user", "admin.webhook.retry_requested", "webhook_event", webhookId, {});
    const updated = this.store.webhooks.get(webhookId)!;
    return { id: webhookId, status: updated.processingStatus };
  }

  adminRetryLedgerPosting(postingId: string): { id: string; status: string } {
    const posting = this.store.ledgerQueue.get(postingId);
    if (!posting) {
      throw new Error(`Unknown ledger_posting: ${postingId}`);
    }
    this.ledgerWriter.replay(postingId);
    this.store.audit(
      "user",
      "admin.ledger_posting.retry_requested",
      "ledger_posting",
      postingId,
      {},
    );
    const updated = this.store.ledgerQueue.get(postingId)!;
    return { id: postingId, status: updated.status };
  }

  adminResolveException(id: string, resolvedBy: string, note?: string): ReconciliationException {
    const exception = this.store.resolveReconciliationException(id, resolvedBy, note);
    this.store.audit(
      "user",
      "admin.reconciliation_exception.resolved",
      "reconciliation_exception",
      id,
      { resolvedBy, note },
    );
    return exception;
  }

  adminDisableProvider(adapterKey: string): ProviderBinding {
    const binding = this.store.getProviderBindingByAdapterKey(adapterKey);
    this.store.setProviderHealth(binding.id, "disabled", { reason: "disabled_by_admin" });
    this.store.audit("user", "admin.provider.disabled", "provider_binding", binding.id, {
      adapterKey,
    });
    return binding;
  }

  // --- Reports ---

  reportPaymentHistory(filter: DateRangeFilter & { status?: string }): PaymentHistoryRecord[] {
    return this.reportEngine.paymentHistory(filter);
  }

  reportAuditExport(filter: DateRangeFilter): string {
    return this.reportEngine.auditExport(filter);
  }

  reportSettlement(filter: DateRangeFilter): SettlementLine[] {
    return this.reportEngine.settlementSummary(filter);
  }

  metricsSnapshot(): PlatformMetrics {
    return this.reportEngine.metricsSnapshot();
  }

  adminAddNote(
    resourceType: string,
    resourceId: string,
    note: string,
    actorId = "admin",
  ): AuditEvent {
    return this.store.audit("user", "admin.note.added", resourceType, resourceId, {
      note,
      actorId,
    });
  }

  setProviderHealthForTest(adapterKey: string, status: "healthy" | "degraded" | "disabled"): void {
    const binding = this.store.getProviderBindingByAdapterKey(adapterKey);
    this.store.setProviderHealth(binding.id, status);
  }
}

function parseWebhookBody(body: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
