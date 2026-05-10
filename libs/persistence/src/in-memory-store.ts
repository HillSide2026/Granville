import { randomUUID } from "node:crypto";

import type { PaymentAccount } from "../../contracts/account.ts";
import type { Customer } from "../../contracts/customer.ts";
import type { LedgerPostingRequest, LedgerPostingResult } from "../../contracts/ledger.ts";
import type { PaymentAttempt, PaymentOrder } from "../../contracts/payment.ts";
import type { Provider, ProviderBinding, ProviderCapability } from "../../contracts/provider.ts";
import type {
  ReconciliationException,
  ReconciliationRecord,
  ReconciliationRun,
} from "../../contracts/reconciliation.ts";

export interface AuditEvent {
  id: string;
  actorType: "system" | "user" | "service";
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  requestId?: string;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface IdempotencyRecord {
  scope: string;
  key: string;
  requestHash: string;
  status: "in_progress" | "completed" | "failed";
  resourceType?: string;
  resourceId?: string;
  responsePayload?: unknown;
}

export interface WebhookEvent {
  id: string;
  providerBindingId: string;
  providerCode: string;
  deliveryId?: string;
  idempotencyKey?: string;
  signatureValid?: boolean;
  processingStatus: "received" | "queued" | "processing" | "processed" | "failed" | "ignored";
  requestPath: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
  receivedAt: string;
  processedAt?: string;
  lastError?: string;
  metadata: Record<string, string>;
}

export interface ProviderTransactionRecord {
  id: string;
  providerBindingId: string;
  paymentAttemptId?: string;
  paymentAccountId?: string;
  providerTransactionId: string;
  providerReference?: string;
  direction: "outbound" | "inbound";
  status: string;
  amount: string;
  asset: string;
  occurredAt: string;
  rawPayload: Record<string, unknown>;
  metadata: Record<string, string>;
}

export interface ProviderCommandQueueItem {
  id: string;
  commandType: "initiate_payment" | "cancel_payment" | "retry_payment";
  paymentOrderId: string;
  paymentAttemptId: string;
  providerBindingId: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed" | "dead_lettered";
  retryCount: number;
  availableAt: string;
  lockedAt?: string;
  processedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderRequestAttempt {
  id: string;
  providerCommandId: string;
  paymentAttemptId: string;
  providerBindingId: string;
  attemptNumber: number;
  status: "processing" | "completed" | "failed";
  requestPayload: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  providerReference?: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface LedgerQueueItem extends LedgerPostingRequest {
  status: "pending" | "processing" | "posted" | "failed" | "dead_lettered";
  retryCount: number;
  result?: LedgerPostingResult;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderHealth {
  providerBindingId: string;
  status: "healthy" | "degraded" | "disabled";
  checkedAt: string;
  failureCount: number;
  latencyMs?: number;
  reason?: string;
}

export interface WebhookProcessingAttempt {
  id: string;
  webhookEventId: string;
  attemptNumber: number;
  status: "processing" | "processed" | "failed" | "ignored";
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
}

export interface CreateCustomerInput {
  legalName: string;
  email?: string;
  countryCode?: string;
  externalReference?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentAccountInput {
  customerId: string;
  providerBindingId: string;
  currencyCode?: string;
  countryCode?: string;
  displayName?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentOrderInput {
  customerId: string;
  paymentAccountId: string;
  amount: string;
  asset: string;
  beneficiaryReference?: string;
  metadata?: Record<string, string>;
}

function timestamp(): string {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryGranvilleStore {
  readonly providers = new Map<string, Provider>();
  readonly providerBindings = new Map<string, ProviderBinding>();
  readonly providerCapabilities = new Map<string, ProviderCapability>();
  readonly customers = new Map<string, Customer>();
  readonly paymentAccounts = new Map<string, PaymentAccount>();
  readonly paymentOrders = new Map<string, PaymentOrder>();
  readonly paymentAttempts = new Map<string, PaymentAttempt>();
  readonly providerTransactions = new Map<string, ProviderTransactionRecord>();
  readonly providerCommandQueue = new Map<string, ProviderCommandQueueItem>();
  readonly providerRequestAttempts = new Map<string, ProviderRequestAttempt>();
  readonly ledgerQueue = new Map<string, LedgerQueueItem>();
  readonly ledgerPostingAttempts = new Map<
    string,
    Array<
      LedgerPostingResult & {
        status: "processing" | "posted" | "failed";
        errorMessage?: string;
      }
    >
  >();
  readonly reconciliationRuns = new Map<string, ReconciliationRun>();
  readonly reconciliationExceptions = new Map<string, ReconciliationException>();
  readonly reconciliationRecords = new Map<string, ReconciliationRecord>();
  readonly webhooks = new Map<string, WebhookEvent>();
  readonly webhookProcessingAttempts = new Map<string, WebhookProcessingAttempt>();
  readonly auditEvents: AuditEvent[] = [];
  readonly idempotency = new Map<string, IdempotencyRecord>();
  readonly providerHealth = new Map<string, ProviderHealth>();

  constructor() {
    this.seedMockProvider();
  }

  createCustomer(input: CreateCustomerInput): Customer {
    const now = timestamp();
    const customer: Customer = {
      id: randomUUID(),
      externalReference: input.externalReference,
      type: "individual",
      status: "active",
      legalName: input.legalName,
      email: input.email,
      countryCode: input.countryCode,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.customers.set(customer.id, customer);
    this.audit("service", "customer.created", "customer", customer.id, {
      customerId: customer.id,
    });
    return clone(customer);
  }

  createPaymentAccount(input: CreatePaymentAccountInput): PaymentAccount {
    this.require(this.customers, input.customerId, "customer");
    this.require(this.providerBindings, input.providerBindingId, "provider_binding");
    const now = timestamp();
    const account: PaymentAccount = {
      id: randomUUID(),
      customerId: input.customerId,
      providerBindingId: input.providerBindingId,
      kind: "virtual",
      status: "active",
      currencyCode: input.currencyCode,
      countryCode: input.countryCode,
      displayName: input.displayName,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.paymentAccounts.set(account.id, account);
    this.audit("service", "payment_account.created", "payment_account", account.id, {
      customerId: input.customerId,
    });
    return clone(account);
  }

  createPaymentOrder(input: CreatePaymentOrderInput): PaymentOrder {
    this.require(this.customers, input.customerId, "customer");
    this.require(this.paymentAccounts, input.paymentAccountId, "payment_account");
    const now = timestamp();
    const order: PaymentOrder = {
      id: randomUUID(),
      customerId: input.customerId,
      paymentAccountId: input.paymentAccountId,
      direction: "outbound",
      transactionType: "payment",
      amount: {
        amount: input.amount,
        asset: input.asset,
      },
      beneficiaryReference: input.beneficiaryReference,
      status: "created",
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.paymentOrders.set(order.id, order);
    this.audit("service", "payment_order.created", "payment_order", order.id, {
      paymentAccountId: input.paymentAccountId,
    });
    return clone(order);
  }

  createPaymentAttempt(
    order: PaymentOrder,
    providerBindingId: string,
    routeSnapshot: Record<string, unknown>,
  ): PaymentAttempt {
    const now = timestamp();
    const attemptNumber =
      [...this.paymentAttempts.values()].filter((attempt) => attempt.paymentOrderId === order.id)
        .length + 1;
    const attempt: PaymentAttempt = {
      id: randomUUID(),
      paymentOrderId: order.id,
      providerBindingId,
      attemptNumber,
      status: "submitted_to_provider",
      routeSnapshot,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      submittedAt: now,
    };
    this.paymentAttempts.set(attempt.id, attempt);
    this.updatePaymentOrder(order.id, {
      status: "submitted_to_provider",
      submittedAt: now,
    });
    this.audit("service", "payment_attempt.created", "payment_attempt", attempt.id, {
      paymentOrderId: order.id,
      providerBindingId,
    });
    return clone(attempt);
  }

  enqueueProviderCommand(
    input: Omit<
      ProviderCommandQueueItem,
      "id" | "status" | "retryCount" | "availableAt" | "createdAt" | "updatedAt"
    >,
  ): ProviderCommandQueueItem {
    const existing = [...this.providerCommandQueue.values()].find(
      (command) => command.idempotencyKey === input.idempotencyKey,
    );
    if (existing) {
      return clone(existing);
    }
    const now = timestamp();
    const command: ProviderCommandQueueItem = {
      ...input,
      id: randomUUID(),
      status: "pending",
      retryCount: 0,
      availableAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.providerCommandQueue.set(command.id, command);
    this.audit("service", "provider_command.enqueued", "provider_command", command.id, {
      commandType: command.commandType,
      paymentAttemptId: command.paymentAttemptId,
      providerBindingId: command.providerBindingId,
    });
    return clone(command);
  }

  claimProviderCommand(): ProviderCommandQueueItem | undefined {
    const now = timestamp();
    const command = [...this.providerCommandQueue.values()].find(
      (candidate) => candidate.status === "pending" && candidate.availableAt <= now,
    );
    if (!command) {
      return undefined;
    }
    const updated = {
      ...command,
      status: "processing" as const,
      lockedAt: now,
      updatedAt: now,
    };
    this.providerCommandQueue.set(command.id, updated);
    return clone(updated);
  }

  markProviderCommandCompleted(id: string): ProviderCommandQueueItem {
    const command = this.require(this.providerCommandQueue, id, "provider_command");
    const now = timestamp();
    const updated = {
      ...command,
      status: "completed" as const,
      processedAt: now,
      updatedAt: now,
    };
    this.providerCommandQueue.set(id, updated);
    return clone(updated);
  }

  markProviderCommandFailed(id: string, error: string): ProviderCommandQueueItem {
    const command = this.require(this.providerCommandQueue, id, "provider_command");
    const retryCount = command.retryCount + 1;
    const now = timestamp();
    const updated = {
      ...command,
      status: retryCount >= 3 ? ("dead_lettered" as const) : ("pending" as const),
      retryCount,
      lastError: error,
      availableAt: new Date(Date.now() + retryCount * 1000).toISOString(),
      updatedAt: now,
    };
    this.providerCommandQueue.set(id, updated);
    this.audit("service", "provider_command.failed", "provider_command", id, {
      retryCount,
      status: updated.status,
      error,
    });
    return clone(updated);
  }

  recordProviderRequestAttempt(
    input: Omit<ProviderRequestAttempt, "id" | "startedAt"> & {
      startedAt?: string;
    },
  ): ProviderRequestAttempt {
    const attempt: ProviderRequestAttempt = {
      ...input,
      id: randomUUID(),
      startedAt: input.startedAt ?? timestamp(),
    };
    this.providerRequestAttempts.set(attempt.id, attempt);
    return clone(attempt);
  }

  updatePaymentOrder(
    id: string,
    patch: Partial<Omit<PaymentOrder, "id" | "createdAt">>,
  ): PaymentOrder {
    const existing = this.require(this.paymentOrders, id, "payment_order");
    const updated = { ...existing, ...patch, updatedAt: timestamp() };
    this.paymentOrders.set(id, updated);
    return clone(updated);
  }

  updatePaymentAttempt(
    id: string,
    patch: Partial<Omit<PaymentAttempt, "id" | "createdAt">>,
  ): PaymentAttempt {
    const existing = this.require(this.paymentAttempts, id, "payment_attempt");
    const updated = { ...existing, ...patch, updatedAt: timestamp() };
    this.paymentAttempts.set(id, updated);
    return clone(updated);
  }

  recordProviderTransaction(
    input: Omit<ProviderTransactionRecord, "id" | "occurredAt"> & {
      occurredAt?: string;
    },
  ): ProviderTransactionRecord {
    const existing = [...this.providerTransactions.values()].find(
      (transaction) =>
        transaction.providerBindingId === input.providerBindingId &&
        transaction.providerTransactionId === input.providerTransactionId,
    );
    if (existing) {
      return clone(existing);
    }
    const record: ProviderTransactionRecord = {
      ...input,
      id: randomUUID(),
      occurredAt: input.occurredAt ?? timestamp(),
    };
    this.providerTransactions.set(record.id, record);
    this.audit("service", "provider_transaction.recorded", "provider_transaction", record.id, {
      paymentAttemptId: record.paymentAttemptId,
      providerTransactionId: record.providerTransactionId,
    });
    return clone(record);
  }

  enqueueLedgerPosting(request: LedgerPostingRequest): LedgerQueueItem {
    const existing = [...this.ledgerQueue.values()].find(
      (item) => item.idempotencyKey === request.idempotencyKey,
    );
    if (existing) {
      return clone(existing);
    }
    const now = timestamp();
    const item: LedgerQueueItem = {
      ...request,
      status: "pending",
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.ledgerQueue.set(item.id, item);
    this.audit("service", "ledger_posting.enqueued", "ledger_posting", item.id, {
      aggregateType: item.aggregateType,
      aggregateId: item.aggregateId,
    });
    return clone(item);
  }

  markLedgerPosted(id: string, result: LedgerPostingResult): LedgerQueueItem {
    const item = this.require(this.ledgerQueue, id, "ledger_posting");
    const updated = {
      ...item,
      status: "posted" as const,
      result,
      updatedAt: timestamp(),
    };
    this.ledgerQueue.set(id, updated);
    const attempts = this.ledgerPostingAttempts.get(id) ?? [];
    this.ledgerPostingAttempts.set(id, [
      ...attempts,
      {
        ...result,
        status: "posted",
      },
    ]);
    this.audit("service", "ledger_posting.posted", "ledger_posting", id, result);
    return clone(updated);
  }

  markLedgerFailed(id: string, error: string): LedgerQueueItem {
    const item = this.require(this.ledgerQueue, id, "ledger_posting");
    const retryCount = item.retryCount + 1;
    const updated = {
      ...item,
      status: retryCount >= 3 ? ("dead_lettered" as const) : ("failed" as const),
      retryCount,
      lastError: error,
      updatedAt: timestamp(),
    };
    this.ledgerQueue.set(id, updated);
    const attempts = this.ledgerPostingAttempts.get(id) ?? [];
    this.ledgerPostingAttempts.set(id, [
      ...attempts,
      {
        id,
        ledgerName: item.ledgerName,
        formanceTransactionId: "",
        postedAt: timestamp(),
        status: "failed",
        errorMessage: error,
      },
    ]);
    this.audit("service", "ledger_posting.failed", "ledger_posting", id, {
      retryCount,
      status: updated.status,
      error,
    });
    return clone(updated);
  }

  resetLedgerPosting(id: string): LedgerQueueItem {
    const item = this.require(this.ledgerQueue, id, "ledger_posting");
    const updated = {
      ...item,
      status: "pending" as const,
      lastError: undefined,
      updatedAt: timestamp(),
    };
    this.ledgerQueue.set(id, updated);
    this.audit("service", "ledger_posting.replayed", "ledger_posting", id);
    return clone(updated);
  }

  queueWebhookForProcessing(id: string): WebhookEvent {
    const event = this.require(this.webhooks, id, "webhook_event");
    const updated = { ...event, processingStatus: "queued" as const };
    this.webhooks.set(id, updated);
    return clone(updated);
  }

  claimWebhookForProcessing(): WebhookEvent | undefined {
    const event = [...this.webhooks.values()].find(
      (candidate) => candidate.processingStatus === "queued",
    );
    if (!event) {
      return undefined;
    }
    const now = timestamp();
    const updated = { ...event, processingStatus: "processing" as const };
    this.webhooks.set(event.id, updated);
    const attemptNumber =
      [...this.webhookProcessingAttempts.values()].filter((a) => a.webhookEventId === event.id)
        .length + 1;
    const attempt: WebhookProcessingAttempt = {
      id: randomUUID(),
      webhookEventId: event.id,
      attemptNumber,
      status: "processing",
      startedAt: now,
    };
    this.webhookProcessingAttempts.set(attempt.id, attempt);
    return clone(updated);
  }

  markWebhookProcessed(id: string): WebhookEvent {
    const event = this.require(this.webhooks, id, "webhook_event");
    const now = timestamp();
    const updated = {
      ...event,
      processingStatus: "processed" as const,
      processedAt: now,
    };
    this.webhooks.set(id, updated);
    const latestAttempt = [...this.webhookProcessingAttempts.values()]
      .filter((a) => a.webhookEventId === id && a.status === "processing")
      .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
    if (latestAttempt) {
      this.webhookProcessingAttempts.set(latestAttempt.id, {
        ...latestAttempt,
        status: "processed",
        finishedAt: now,
      });
    }
    return clone(updated);
  }

  markWebhookFailed(id: string, error: string): WebhookEvent {
    const event = this.require(this.webhooks, id, "webhook_event");
    const now = timestamp();
    const attemptCount = [...this.webhookProcessingAttempts.values()].filter(
      (a) => a.webhookEventId === id,
    ).length;
    const nextStatus = attemptCount >= 3 ? ("failed" as const) : ("queued" as const);
    const updated = { ...event, processingStatus: nextStatus, lastError: error };
    this.webhooks.set(id, updated);
    const latestAttempt = [...this.webhookProcessingAttempts.values()]
      .filter((a) => a.webhookEventId === id && a.status === "processing")
      .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
    if (latestAttempt) {
      this.webhookProcessingAttempts.set(latestAttempt.id, {
        ...latestAttempt,
        status: "failed",
        errorMessage: error,
        finishedAt: now,
      });
    }
    this.audit("service", "webhook.processing_failed", "webhook_event", id, {
      attemptCount,
      nextStatus,
      error,
    });
    return clone(updated);
  }

  markWebhookIgnored(id: string): WebhookEvent {
    const event = this.require(this.webhooks, id, "webhook_event");
    const now = timestamp();
    const updated = {
      ...event,
      processingStatus: "ignored" as const,
      processedAt: now,
    };
    this.webhooks.set(id, updated);
    const latestAttempt = [...this.webhookProcessingAttempts.values()]
      .filter((a) => a.webhookEventId === id && a.status === "processing")
      .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
    if (latestAttempt) {
      this.webhookProcessingAttempts.set(latestAttempt.id, {
        ...latestAttempt,
        status: "ignored",
        finishedAt: now,
      });
    }
    return clone(updated);
  }

  createReconciliationRecord(
    input: Omit<ReconciliationRecord, "id" | "createdAt">,
  ): ReconciliationRecord {
    const record: ReconciliationRecord = {
      ...input,
      id: randomUUID(),
      createdAt: timestamp(),
    };
    this.reconciliationRecords.set(record.id, record);
    return clone(record);
  }

  resolveReconciliationException(
    id: string,
    resolvedBy: string,
    note?: string,
  ): ReconciliationException {
    const exception = this.require(this.reconciliationExceptions, id, "reconciliation_exception");
    const now = timestamp();
    const updated: ReconciliationException = {
      ...exception,
      status: "resolved",
      resolvedAt: now,
      resolvedBy,
      manualNote: note ?? exception.manualNote,
    };
    this.reconciliationExceptions.set(id, updated);
    return clone(updated);
  }

  createReconciliationRun(
    input: Omit<ReconciliationRun, "id" | "status" | "createdAt">,
  ): ReconciliationRun {
    const now = timestamp();
    const run: ReconciliationRun = {
      ...input,
      id: randomUUID(),
      status: "queued",
      createdAt: now,
    };
    this.reconciliationRuns.set(run.id, run);
    return clone(run);
  }

  updateReconciliationRun(
    id: string,
    patch: Partial<Omit<ReconciliationRun, "id" | "createdAt">>,
  ): ReconciliationRun {
    const run = this.require(this.reconciliationRuns, id, "reconciliation_run");
    const updated = { ...run, ...patch };
    this.reconciliationRuns.set(id, updated);
    return clone(updated);
  }

  createReconciliationException(
    input: Omit<ReconciliationException, "id" | "status" | "createdAt">,
  ): ReconciliationException {
    const exception: ReconciliationException = {
      ...input,
      id: randomUUID(),
      status: "open",
      createdAt: timestamp(),
    };
    this.reconciliationExceptions.set(exception.id, exception);
    this.audit(
      "service",
      "reconciliation_exception.created",
      "reconciliation_exception",
      exception.id,
      {
        category: exception.category,
        paymentOrderId: exception.paymentOrderId,
      },
    );
    return clone(exception);
  }

  audit(
    actorType: AuditEvent["actorType"],
    action: string,
    resourceType: string,
    resourceId: string,
    payload: Record<string, unknown> = {},
  ): AuditEvent {
    const event: AuditEvent = {
      id: randomUUID(),
      actorType,
      action,
      resourceType,
      resourceId,
      payload,
      createdAt: timestamp(),
    };
    this.auditEvents.push(event);
    return clone(event);
  }

  withIdempotency<T>(
    scope: string,
    key: string | undefined,
    requestHash: string,
    execute: () => { resourceType: string; resourceId: string; response: T },
  ): T {
    if (!key) {
      return execute().response;
    }
    const scopedKey = `${scope}:${key}`;
    const existing = this.idempotency.get(scopedKey);
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new Error(`Idempotency key reused with different request in ${scope}`);
      }
      return clone(existing.responsePayload as T);
    }
    this.idempotency.set(scopedKey, {
      scope,
      key,
      requestHash,
      status: "in_progress",
    });
    const result = execute();
    this.idempotency.set(scopedKey, {
      scope,
      key,
      requestHash,
      status: "completed",
      resourceType: result.resourceType,
      resourceId: result.resourceId,
      responsePayload: clone(result.response),
    });
    return result.response;
  }

  getMockProviderBinding(): ProviderBinding {
    const binding = [...this.providerBindings.values()].find(
      (candidate) => candidate.adapterKey === "mock-emi",
    );
    if (!binding) {
      throw new Error("Mock EMI provider binding has not been seeded");
    }
    return clone(binding);
  }

  getProviderBindingByAdapterKey(adapterKey: string): ProviderBinding {
    const binding = [...this.providerBindings.values()].find(
      (candidate) => candidate.adapterKey === adapterKey,
    );
    if (!binding) {
      throw new Error(`Provider binding has not been seeded: ${adapterKey}`);
    }
    return clone(binding);
  }

  setProviderHealth(
    providerBindingId: string,
    status: ProviderHealth["status"],
    detail: Omit<Partial<ProviderHealth>, "providerBindingId" | "status"> = {},
  ): ProviderHealth {
    const previous = this.providerHealth.get(providerBindingId);
    const health: ProviderHealth = {
      providerBindingId,
      status,
      checkedAt: timestamp(),
      failureCount: detail.failureCount ?? previous?.failureCount ?? 0,
      latencyMs: detail.latencyMs,
      reason: detail.reason,
    };
    this.providerHealth.set(providerBindingId, health);
    return clone(health);
  }

  private seedMockProvider(): void {
    const now = timestamp();
    const provider: Provider = {
      id: randomUUID(),
      code: "mock-emi",
      displayName: "Mock EMI",
      kind: "mock",
      stage: "stage1",
      active: true,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    const binding: ProviderBinding = {
      id: randomUUID(),
      providerId: provider.id,
      bindingKind: "mock",
      adapterKey: "mock-emi",
      active: true,
      config: {},
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    const capability: ProviderCapability = {
      id: randomUUID(),
      providerId: provider.id,
      capabilityKey: "outbound_payments",
      enabled: true,
      config: {
        assets: ["GBP/2"],
        rails: ["internal_book"],
        countries: ["GB"],
        fallbackPriority: 10,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.providers.set(provider.id, provider);
    this.providerBindings.set(binding.id, binding);
    this.providerCapabilities.set(capability.id, capability);
    this.setProviderHealth(binding.id, "healthy");

    const bankProvider: Provider = {
      id: randomUUID(),
      code: "mock-bank",
      displayName: "Mock Bank",
      kind: "bank",
      stage: "stage2",
      active: true,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    const bankBinding: ProviderBinding = {
      id: randomUUID(),
      providerId: bankProvider.id,
      bindingKind: "native_bank",
      adapterKey: "mock-bank",
      active: true,
      config: {},
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    const bankCapability: ProviderCapability = {
      id: randomUUID(),
      providerId: bankProvider.id,
      capabilityKey: "outbound_payments",
      enabled: true,
      config: {
        assets: ["GBP/2", "USD/2"],
        rails: ["wire", "ach"],
        countries: ["GB", "US"],
        fallbackPriority: 20,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.providers.set(bankProvider.id, bankProvider);
    this.providerBindings.set(bankBinding.id, bankBinding);
    this.providerCapabilities.set(bankCapability.id, bankCapability);
    this.setProviderHealth(bankBinding.id, "healthy");
  }

  private require<T>(collection: Map<string, T>, id: string, label: string): T {
    const value = collection.get(id);
    if (!value) {
      throw new Error(`Unknown ${label}: ${id}`);
    }
    return value;
  }
}
