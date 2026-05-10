import { randomUUID } from "node:crypto";

import { LedgerWriter } from "../../ledger-writer/src/ledger-writer.ts";
import { GranvilleOrchestrator } from "../../orchestrator/src/orchestrator.ts";
import { ProviderRuntime } from "../../provider-runtime/src/provider-runtime.ts";
import { Reconciler } from "../../reconciler/src/reconciler.ts";
import type { Customer } from "../../../libs/contracts/customer.ts";
import type { PaymentAccount } from "../../../libs/contracts/account.ts";
import type { PaymentOrder } from "../../../libs/contracts/payment.ts";
import {
  InMemoryGranvilleStore,
  type AuditEvent,
  type CreateCustomerInput,
  type CreatePaymentOrderInput,
} from "../../../libs/persistence/src/in-memory-store.ts";
import { normalizeProviderWebhook } from "../../../libs/provider-adapters/webhook-normalizer.ts";

export interface ApiContext {
  idempotencyKey?: string;
}

export class GranvilleApi {
  readonly store: InMemoryGranvilleStore;
  orchestrator: GranvilleOrchestrator;
  providerRuntime: ProviderRuntime;
  ledgerWriter: LedgerWriter;
  reconciler: Reconciler;

  constructor(store = new InMemoryGranvilleStore()) {
    this.store = store;
    this.orchestrator = new GranvilleOrchestrator(store);
    this.providerRuntime = new ProviderRuntime(store);
    this.ledgerWriter = new LedgerWriter(store);
    this.reconciler = new Reconciler(store);
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

  postPayment(
    input: CreatePaymentOrderInput,
    context: ApiContext = {},
  ): PaymentOrder {
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
      processingStatus: "received" as const,
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

  setProviderHealthForTest(
    adapterKey: string,
    status: "healthy" | "degraded" | "disabled",
  ): void {
    const binding = this.store.getProviderBindingByAdapterKey(adapterKey);
    this.store.setProviderHealth(binding.id, status);
  }
}

function parseWebhookBody(body: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}
