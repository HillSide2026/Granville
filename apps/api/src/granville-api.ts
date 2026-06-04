import { randomUUID } from "node:crypto";
import type { PaymentAccount } from "../../../libs/contracts/account.ts";
import type { Customer } from "../../../libs/contracts/customer.ts";
import type { LedgerPostingResult } from "../../../libs/contracts/ledger.ts";
import type { PaymentAttempt, PaymentOrder } from "../../../libs/contracts/payment.ts";
import type { ProviderBinding } from "../../../libs/contracts/provider.ts";
import type {
  ProviderStatementLine,
  ReconciliationException,
  ReconciliationRun,
} from "../../../libs/contracts/reconciliation.ts";
import type {
  CreateRoutingRuleInput,
  RoutingRule,
  UpdateRoutingRuleInput,
} from "../../../libs/contracts/routing.ts";
import type {
  StartWorkflowInput,
  WorkflowInstanceRecord,
  WorkflowStatus,
} from "../../../libs/contracts/workflow.ts";
import {
  type AuditEvent,
  type Beneficiary,
  type CreateBeneficiaryInput,
  type CreateCustomerInput,
  type CreatePaymentOrderInput,
  InMemoryGranvilleStore,
  type LedgerQueueItem,
  type ProviderTransactionRecord,
  type WebhookEvent,
} from "../../../libs/persistence/src/in-memory-store.ts";
import { verifyAirwallexWebhookSignature } from "../../../libs/provider-adapters/airwallex/index.ts";
import { normalizeProviderWebhook } from "../../../libs/provider-adapters/webhook-normalizer.ts";
import {
  type CompliancePaymentRecord,
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
    this.ledgerWriter = new LedgerWriter(store, process.env.FORMANCE_LEDGER_URL);
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

  listPaymentAccounts(): PaymentAccount[] {
    return [...this.store.paymentAccounts.values()];
  }

  postPayment(input: CreatePaymentOrderInput, context: ApiContext = {}): PaymentOrder {
    return this.orchestrator.createPayment(input, context);
  }

  async submitPayment(id: string): Promise<PaymentOrder> {
    const submission = this.orchestrator.submitPayment(id);
    await this.providerRuntime.drain();
    await this.ledgerWriter.postPending();
    return this.getPayment(id) ?? submission.order;
  }

  cancelPayment(id: string, reason?: string): PaymentOrder {
    return this.orchestrator.cancelPayment(id, reason);
  }

  approvePayment(id: string, actorId: string, note?: string): Promise<PaymentOrder> {
    this.store.audit("user", "payment.approved", "payment_order", id, { actorId, note });
    return this.submitPayment(id);
  }

  rejectPayment(id: string, actorId: string, note?: string): PaymentOrder {
    this.store.audit("user", "payment.rejected", "payment_order", id, { actorId, note });
    return this.cancelPayment(id, note ?? "Rejected by operator");
  }

  retryPayment(id: string): PaymentOrder {
    const submission = this.orchestrator.retryPayment(id);
    return submission.order;
  }

  getPayment(id: string): PaymentOrder | undefined {
    return this.store.paymentOrders.get(id);
  }

  listPayments(): PaymentOrder[] {
    return [...this.store.paymentOrders.values()];
  }

  getPaymentStatus(id: string): { id: string; status: string } | undefined {
    const payment = this.store.paymentOrders.get(id);
    return payment ? { id: payment.id, status: payment.status } : undefined;
  }

  postWebhook(
    providerCode: string,
    body: string,
    options: { headers?: Record<string, string>; queryParams?: Record<string, string> } = {},
  ): { id: string; status: string } {
    const binding = this.store.getProviderBindingByAdapterKey(providerCode);
    const providerBindingId = binding.id;
    const headers = options.headers ?? {};
    const normalized = normalizeProviderWebhook(providerCode, parseWebhookBody(body));
    const idempotencyKey = webhookIdempotencyKey(providerCode, body, normalized.rawPayload);
    const existing = [...this.store.webhooks.values()].find(
      (event) =>
        event.providerBindingId === providerBindingId && event.idempotencyKey === idempotencyKey,
    );
    if (existing) {
      return { id: existing.id, status: existing.processingStatus };
    }

    const signatureCheck =
      providerCode === "airwallex"
        ? verifyAirwallexWebhookSignature(
            body,
            headers,
            airwallexWebhookSecret(binding.config) ?? process.env.AIRWALLEX_WEBHOOK_SECRET,
          )
        : { valid: true };
    const event = {
      id: randomUUID(),
      providerBindingId,
      providerCode,
      deliveryId: idempotencyKey,
      idempotencyKey,
      signatureValid: signatureCheck.valid,
      processingStatus: signatureCheck.valid ? ("queued" as const) : ("ignored" as const),
      requestPath: `/webhooks/${providerCode}`,
      headers,
      queryParams: options.queryParams ?? {},
      body,
      receivedAt: new Date().toISOString(),
      metadata: {
        normalizedProviderReference: normalized.providerReference ?? "",
        normalizedProviderTransactionId: normalized.providerTransactionId ?? "",
        normalizedStatus: normalized.status ?? "",
        signatureFailureReason: signatureCheck.reason ?? "",
      },
    };
    this.store.storeWebhookEvent(event);
    this.store.audit("service", "webhook.received", "webhook_event", event.id, {
      providerCode,
    });
    return { id: event.id, status: event.processingStatus };
  }

  drainWebhooks(): number {
    return this.webhookProcessor.drain();
  }

  postReconciliationRun(filter?: { from?: string; to?: string }): {
    runId: string;
    exceptionCount: number;
  } {
    return this.reconciler.runTransactionLevel(filter);
  }

  syncProviderTransactions(
    adapterKey: string,
    filter?: { from?: string; to?: string },
  ): Promise<{ synced: number }> {
    return this.reconciler.syncProviderTransactions(adapterKey, filter);
  }

  runProviderWorker(): Promise<number> {
    return this.providerRuntime.drain();
  }

  postPendingLedger(): Promise<LedgerPostingResult[]> {
    return this.ledgerWriter.postPending();
  }

  getReconciliationExceptions(filter?: { status?: string }) {
    const all = [...this.store.reconciliationExceptions.values()];
    return filter?.status ? all.filter((e) => e.status === filter.status) : all;
  }

  ingestProviderStatement(lines: ProviderStatementLine[]): {
    ingested: number;
    duplicates: number;
  } {
    let ingested = 0;
    let duplicates = 0;
    for (const line of lines) {
      const existing = [...this.store.providerTransactions.values()].find(
        (tx) =>
          tx.providerBindingId === line.providerBindingId &&
          tx.providerTransactionId === line.providerReference,
      );
      if (existing) {
        duplicates += 1;
      } else {
        this.store.recordProviderTransaction({
          providerBindingId: line.providerBindingId,
          providerTransactionId: line.providerReference,
          providerReference: line.providerReference,
          direction: "inbound",
          status: "completed",
          amount: line.amount,
          asset: line.asset,
          occurredAt: line.valueDate,
          rawPayload: { description: line.description ?? "" },
          metadata: {},
        });
        ingested += 1;
      }
    }
    return { ingested, duplicates };
  }

  getAuditEvents(): AuditEvent[] {
    return [...this.store.auditEvents];
  }

  startWorkflow(input: StartWorkflowInput): WorkflowInstanceRecord {
    const workflow = this.store.startWorkflow(input);
    this.store.audit("service", "workflow.instance_started", "workflow_instance", workflow.id, {
      workflowKind: workflow.workflowKind,
      subjectType: workflow.subjectType,
      subjectId: workflow.subjectId,
    });
    return workflow;
  }

  listWorkflows(filter: { subjectType?: string; subjectId?: string; status?: string } = {}) {
    return [...this.store.workflowInstances.values()].filter((workflow) => {
      if (filter.subjectType && workflow.subjectType !== filter.subjectType) return false;
      if (filter.subjectId && workflow.subjectId !== filter.subjectId) return false;
      if (filter.status && workflow.status !== filter.status) return false;
      return true;
    });
  }

  getWorkflow(id: string): WorkflowInstanceRecord | undefined {
    return this.store.workflowInstances.get(id);
  }

  updateWorkflow(
    id: string,
    input: {
      status?: WorkflowStatus;
      camundaProcessInstanceKey?: string;
      correlationIds?: WorkflowInstanceRecord["correlationIds"];
      metadata?: Record<string, string>;
    },
  ): WorkflowInstanceRecord {
    const workflow = this.store.updateWorkflow(id, input);
    this.store.recordWorkflowAudit(id, "workflow.updated", "worker", "camunda-worker", {
      status: input.status,
      correlationIds: input.correlationIds ?? {},
    });
    return workflow;
  }

  recordWorkflowAction(
    id: string,
    action: string,
    actorType: "system" | "user" | "worker",
    actorId?: string,
    payload: Record<string, unknown> = {},
  ) {
    return this.store.recordWorkflowAudit(id, action, actorType, actorId, payload);
  }

  getWorkflowAudit(id: string) {
    return this.store.workflowAuditRecords.filter((record) => record.workflowInstanceId === id);
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

  adminGetReconciliationExceptions(filter?: { status?: string }): ReconciliationException[] {
    const all = [...this.store.reconciliationExceptions.values()];
    return filter?.status ? all.filter((e) => e.status === filter.status) : all;
  }

  adminRunAgingPass(): { escalated: number } {
    return this.reconciler.runAgingPass();
  }

  adminIgnoreException(id: string, ignoredBy: string, note?: string): ReconciliationException {
    return this.store.ignoreReconciliationException(id, ignoredBy, note);
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
    const updated = this.store.webhooks.get(webhookId);
    if (!updated) {
      throw new Error(`Unknown webhook_event: ${webhookId}`);
    }
    return { id: webhookId, status: updated.processingStatus };
  }

  async adminRetryLedgerPosting(postingId: string): Promise<{ id: string; status: string }> {
    const posting = this.store.ledgerQueue.get(postingId);
    if (!posting) {
      throw new Error(`Unknown ledger_posting: ${postingId}`);
    }
    await this.ledgerWriter.replay(postingId);
    this.store.audit(
      "user",
      "admin.ledger_posting.retry_requested",
      "ledger_posting",
      postingId,
      {},
    );
    const updated = this.store.ledgerQueue.get(postingId);
    if (!updated) {
      throw new Error(`Unknown ledger_posting: ${postingId}`);
    }
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

  // --- Routing rules ---

  createRoutingRule(input: CreateRoutingRuleInput): RoutingRule {
    return this.store.createRoutingRule(input);
  }

  getRoutingRule(id: string): RoutingRule | undefined {
    return this.store.routingRules.get(id);
  }

  listRoutingRules(): RoutingRule[] {
    return [...this.store.routingRules.values()];
  }

  updateRoutingRule(id: string, patch: UpdateRoutingRuleInput): RoutingRule {
    return this.store.updateRoutingRule(id, patch);
  }

  deactivateRoutingRule(id: string): RoutingRule {
    return this.store.deactivateRoutingRule(id);
  }

  adminListProviders(): Array<{
    bindingId: string;
    adapterKey: string;
    currency?: string;
    country?: string;
    status: string;
    failureCount: number;
    reason?: string;
    checkedAt?: string;
  }> {
    return [...this.store.providerBindings.values()].map((binding) => {
      const health = this.store.providerHealth.get(binding.id);
      return {
        bindingId: binding.id,
        adapterKey: binding.adapterKey,
        currency: binding.currency,
        country: binding.country,
        status: health?.status ?? "unknown",
        failureCount: health?.failureCount ?? 0,
        reason: health?.reason,
        checkedAt: health?.checkedAt,
      };
    });
  }

  adminDisableProvider(adapterKey: string): ProviderBinding {
    const binding = this.store.getProviderBindingByAdapterKey(adapterKey);
    this.store.setProviderHealth(binding.id, "disabled", { reason: "disabled_by_admin" });
    this.store.audit("user", "admin.provider.disabled", "provider_binding", binding.id, {
      adapterKey,
    });
    return binding;
  }

  adminEnableProvider(adapterKey: string): ProviderBinding {
    const binding = this.store.getProviderBindingByAdapterKey(adapterKey);
    this.store.setProviderHealth(binding.id, "healthy", { reason: "enabled_by_admin" });
    this.store.audit("user", "admin.provider.enabled", "provider_binding", binding.id, {
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

  reportCompliancePayments(filter: DateRangeFilter): CompliancePaymentRecord[] {
    return this.reportEngine.compliancePaymentsReport(filter);
  }

  metricsSnapshot(): PlatformMetrics {
    return this.reportEngine.metricsSnapshot();
  }

  // --- Beneficiaries ---

  listBeneficiaries(): Beneficiary[] {
    return [...this.store.beneficiaries.values()];
  }

  createBeneficiary(input: CreateBeneficiaryInput): Beneficiary {
    return this.store.createBeneficiary(input);
  }

  updateBeneficiary(id: string, patch: Partial<CreateBeneficiaryInput>): Beneficiary {
    return this.store.updateBeneficiary(id, patch);
  }

  deleteBeneficiary(id: string): void {
    this.store.deleteBeneficiary(id);
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

function webhookIdempotencyKey(
  providerCode: string,
  body: string,
  payload: Record<string, unknown>,
): string {
  const providerEventId = stringField(payload.id) ?? stringField(payload.event_id);
  if (providerEventId) {
    return providerEventId;
  }
  return `${providerCode}:${Buffer.from(body).toString("base64url")}`;
}

function airwallexWebhookSecret(config: Record<string, unknown>): string | undefined {
  const value = config.webhookSecret;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
