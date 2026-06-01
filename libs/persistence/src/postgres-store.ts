import type { Customer } from "../../contracts/customer.ts";
import type { LedgerPostingRequest, LedgerPostingResult } from "../../contracts/ledger.ts";
import type { PaymentAccount, PaymentAttempt, PaymentOrder } from "../../contracts/payment.ts";
import type { Provider, ProviderBinding, ProviderCapability } from "../../contracts/provider.ts";
import type {
  ReconciliationException,
  ReconciliationRecord,
  ReconciliationRun,
} from "../../contracts/reconciliation.ts";
import type {
  CreateRoutingRuleInput,
  RoutingRule,
  UpdateRoutingRuleInput,
} from "../../contracts/routing.ts";
import type { SqlClient } from "../../db/client.ts";
import {
  type AuditEvent,
  type CreateCustomerInput,
  type CreatePaymentAccountInput,
  type CreatePaymentOrderInput,
  type IdempotencyRecord,
  InMemoryGranvilleStore,
  type LedgerQueueItem,
  type ProviderCommandQueueItem,
  type ProviderHealth,
  type ProviderRequestAttempt,
  type ProviderTransactionRecord,
  type WebhookEvent,
  type WebhookProcessingAttempt,
} from "./in-memory-store.ts";

// ── Internal row shapes returned by DB selects ────────────────────────────────

interface LedgerQueueRow {
  id: string;
  aggregateType: string;
  aggregateId: string;
  postingKey: string;
  idempotencyKey: string;
  ledgerName: string;
  payload: unknown;
  status: LedgerQueueItem["status"];
  retryCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

interface LedgerAttemptRow {
  queueId: string;
  id: string;
  formanceTransactionId?: string;
  status: "processing" | "posted" | "failed";
  errorMessage?: string;
  completedAt?: string;
}

interface IdempotencyRow {
  scope: string;
  key: string;
  requestHash: string;
  status: string;
  resourceType?: string | null;
  resourceId?: string | null;
  responsePayload?: unknown;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export class PostgresGranvilleStore extends InMemoryGranvilleStore {
  readonly #client: SqlClient;
  readonly #pendingWrites = new Set<Promise<void>>();
  readonly #writeErrors: Error[] = [];
  // Sequential write chain — ensures FK-dependent writes don't race each other
  #writeChain: Promise<void> = Promise.resolve();

  // Suppress in-memory mock seeding — loadFromDatabase() populates state from Postgres
  protected override seedMockProvider(): void {}

  private constructor(client: SqlClient) {
    super();
    this.#client = client;
  }

  static async initialize(client: SqlClient): Promise<PostgresGranvilleStore> {
    const store = new PostgresGranvilleStore(client);
    await store.#loadFromDatabase();
    return store;
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  async #loadFromDatabase(): Promise<void> {
    const [
      providerRows,
      bindingRows,
      capabilityRows,
      healthRows,
      customerRows,
      accountRows,
      orderRows,
      attemptRows,
      transactionRows,
      commandRows,
      requestAttemptRows,
      ledgerRows,
      ledgerAttemptRows,
      reconcRunRows,
      reconcRecordRows,
      reconcExceptionRows,
      webhookRows,
      webhookAttemptRows,
      idempotencyRows,
      auditRows,
      routingRuleRows,
    ] = await Promise.all([
      this.#q<Provider>(
        `SELECT id, code, display_name AS "displayName", kind, stage, active, metadata,
                created_at AS "createdAt", updated_at AS "updatedAt" FROM providers`,
      ),
      this.#q<ProviderBinding>(
        `SELECT id, provider_id AS "providerId", binding_kind AS "bindingKind",
                adapter_key AS "adapterKey", formance_connector_id AS "formanceConnectorId",
                provider_tenant_reference AS "providerTenantReference", active, config, metadata,
                created_at AS "createdAt", updated_at AS "updatedAt" FROM provider_bindings`,
      ),
      this.#q<ProviderCapability>(
        `SELECT id, provider_id AS "providerId", capability_key AS "capabilityKey",
                enabled, config, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM provider_capabilities`,
      ),
      this.#q<ProviderHealth>(
        `SELECT provider_binding_id AS "providerBindingId", status, checked_at AS "checkedAt",
                failure_count AS "failureCount", latency_ms AS "latencyMs", reason
         FROM provider_health`,
      ),
      this.#q<Customer>(
        `SELECT id, external_reference AS "externalReference", customer_type AS type, status,
                legal_name AS "legalName", email, country_code AS "countryCode", metadata,
                created_at AS "createdAt", updated_at AS "updatedAt" FROM customers`,
      ),
      this.#q<PaymentAccount>(
        `SELECT id, customer_id AS "customerId", provider_binding_id AS "providerBindingId",
                account_kind AS kind, status, currency_code AS "currencyCode",
                country_code AS "countryCode", display_name AS "displayName", metadata,
                created_at AS "createdAt", updated_at AS "updatedAt" FROM payment_accounts`,
      ),
      this.#q<PaymentOrder>(
        `SELECT id, customer_id AS "customerId", payment_account_id AS "paymentAccountId",
                direction, transaction_type AS "transactionType",
                jsonb_build_object('amount', amount::text, 'asset', asset) AS amount,
                beneficiary_reference AS "beneficiaryReference", provider_reference AS "providerReference",
                status, metadata, created_at AS "createdAt", updated_at AS "updatedAt",
                submitted_at AS "submittedAt", completed_at AS "completedAt" FROM payment_orders`,
      ),
      this.#q<PaymentAttempt>(
        `SELECT id, payment_order_id AS "paymentOrderId", provider_binding_id AS "providerBindingId",
                attempt_number AS "attemptNumber", status, provider_request_id AS "providerRequestId",
                provider_transaction_id AS "providerTransactionId", provider_reference AS "providerReference",
                route_snapshot AS "routeSnapshot", last_error AS "lastError", metadata,
                created_at AS "createdAt", updated_at AS "updatedAt",
                submitted_at AS "submittedAt", completed_at AS "completedAt" FROM payment_attempts`,
      ),
      this.#q<ProviderTransactionRecord>(
        `SELECT id, provider_binding_id AS "providerBindingId", payment_attempt_id AS "paymentAttemptId",
                payment_account_id AS "paymentAccountId", provider_transaction_id AS "providerTransactionId",
                provider_reference AS "providerReference", direction, status, amount::text AS amount, asset,
                occurred_at AS "occurredAt", raw_payload AS "rawPayload", metadata
         FROM provider_transactions`,
      ),
      this.#q<ProviderCommandQueueItem>(
        `SELECT id, command_type AS "commandType", payment_order_id AS "paymentOrderId",
                payment_attempt_id AS "paymentAttemptId", provider_binding_id AS "providerBindingId",
                idempotency_key AS "idempotencyKey", payload, status, retry_count AS "retryCount",
                available_at AS "availableAt", locked_at AS "lockedAt", processed_at AS "processedAt",
                last_error AS "lastError", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM provider_command_queue`,
      ),
      this.#q<ProviderRequestAttempt>(
        `SELECT id, provider_command_id AS "providerCommandId", payment_attempt_id AS "paymentAttemptId",
                provider_binding_id AS "providerBindingId", attempt_number AS "attemptNumber", status,
                request_payload AS "requestPayload", response_payload AS "responsePayload",
                provider_reference AS "providerReference", error_message AS "errorMessage",
                started_at AS "startedAt", completed_at AS "completedAt" FROM provider_request_attempts`,
      ),
      this.#q<LedgerQueueRow>(
        `SELECT id, aggregate_type AS "aggregateType", aggregate_id AS "aggregateId",
                posting_key AS "postingKey", idempotency_key AS "idempotencyKey",
                ledger_name AS "ledgerName", payload, status, retry_count AS "retryCount",
                last_error AS "lastError", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM ledger_posting_queue`,
      ),
      this.#q<LedgerAttemptRow>(
        `SELECT ledger_posting_queue_id AS "queueId", id,
                formance_transaction_id AS "formanceTransactionId", status,
                error_message AS "errorMessage", completed_at AS "completedAt"
         FROM ledger_posting_attempts ORDER BY ledger_posting_queue_id, attempt_number`,
      ),
      this.#q<ReconciliationRun>(
        `SELECT id, provider_binding_id AS "providerBindingId", run_type AS "runType", status,
                period_start AS "periodStart", period_end AS "periodEnd", summary,
                created_at AS "createdAt", started_at AS "startedAt", completed_at AS "completedAt"
         FROM reconciliation_runs`,
      ),
      this.#q<ReconciliationRecord>(
        `SELECT id, reconciliation_run_id AS "reconciliationRunId", payment_order_id AS "paymentOrderId",
                payment_attempt_id AS "paymentAttemptId", provider_transaction_id AS "providerTransactionId",
                ledger_posting_queue_id AS "ledgerPostingId", match_status AS "matchStatus", evidence,
                created_at AS "createdAt" FROM reconciliation_records`,
      ),
      this.#q<ReconciliationException>(
        `SELECT id, reconciliation_run_id AS "reconciliationRunId", payment_order_id AS "paymentOrderId",
                payment_attempt_id AS "paymentAttemptId", provider_transaction_id AS "providerTransactionId",
                ledger_posting_queue_id AS "ledgerPostingId", category, severity, status, description,
                evidence, manual_note AS "manualNote", created_at AS "createdAt",
                resolved_at AS "resolvedAt", resolved_by AS "resolvedBy",
                ignored_at AS "ignoredAt", ignored_by AS "ignoredBy" FROM reconciliation_exceptions`,
      ),
      this.#q<WebhookEvent>(
        `SELECT id, provider_binding_id AS "providerBindingId", provider_code AS "providerCode",
                delivery_id AS "deliveryId", idempotency_key AS "idempotencyKey",
                signature_valid AS "signatureValid", processing_status AS "processingStatus",
                request_path AS "requestPath", headers, query_params AS "queryParams", body,
                received_at AS "receivedAt", processed_at AS "processedAt", last_error AS "lastError",
                metadata FROM webhook_events`,
      ),
      this.#q<WebhookProcessingAttempt>(
        `SELECT id, webhook_event_id AS "webhookEventId", attempt_number AS "attemptNumber",
                status, error_message AS "errorMessage", started_at AS "startedAt",
                finished_at AS "finishedAt" FROM webhook_processing_attempts`,
      ),
      this.#q<IdempotencyRow>(
        `SELECT scope, idempotency_key AS key, request_hash AS "requestHash", status,
                resource_type AS "resourceType", resource_id AS "resourceId",
                response_payload AS "responsePayload" FROM idempotency_keys`,
      ),
      this.#q<AuditEvent>(
        `SELECT id, actor_type AS "actorType", actor_id AS "actorId", action,
                resource_type AS "resourceType", resource_id AS "resourceId",
                request_id AS "requestId", idempotency_key AS "idempotencyKey",
                payload, created_at AS "createdAt" FROM audit_events ORDER BY created_at ASC`,
      ),
      this.#q<RoutingRule>(
        `SELECT id, name, description, priority, active, conditions, outcome,
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM routing_rules ORDER BY priority ASC`,
      ),
    ]);

    for (const row of providerRows) this.providers.set(row.id, row);
    for (const row of bindingRows) this.providerBindings.set(row.id, row);
    for (const row of capabilityRows) this.providerCapabilities.set(row.id, row);
    for (const row of healthRows) this.providerHealth.set(row.providerBindingId, row);
    for (const row of customerRows) this.customers.set(row.id, row);
    for (const row of accountRows) this.paymentAccounts.set(row.id, row);
    for (const row of orderRows) this.paymentOrders.set(row.id, row);
    for (const row of attemptRows) this.paymentAttempts.set(row.id, row);
    for (const row of transactionRows) this.providerTransactions.set(row.id, row);
    for (const row of commandRows) this.providerCommandQueue.set(row.id, row);
    for (const row of requestAttemptRows) this.providerRequestAttempts.set(row.id, row);

    for (const row of ledgerRows) {
      const p = row.payload as Record<string, unknown>;
      this.ledgerQueue.set(row.id, {
        id: row.id,
        aggregateType: row.aggregateType,
        aggregateId: row.aggregateId,
        postingKey: row.postingKey,
        idempotencyKey: row.idempotencyKey,
        ledgerName: row.ledgerName,
        description: (p.description as string) ?? "",
        postings: (p.postings as LedgerPostingRequest["postings"]) ?? [],
        metadata: (p.metadata as Record<string, string>) ?? {},
        status: row.status,
        retryCount: row.retryCount,
        lastError: row.lastError,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    for (const row of ledgerAttemptRows) {
      const existing = this.ledgerPostingAttempts.get(row.queueId) ?? [];
      this.ledgerPostingAttempts.set(row.queueId, [
        ...existing,
        {
          id: row.id,
          ledgerName: "",
          formanceTransactionId: row.formanceTransactionId ?? "",
          postedAt: row.completedAt ?? "",
          status: row.status,
          errorMessage: row.errorMessage,
        },
      ]);
    }

    for (const row of reconcRunRows) this.reconciliationRuns.set(row.id, row);
    for (const row of reconcRecordRows) this.reconciliationRecords.set(row.id, row);
    for (const row of reconcExceptionRows) this.reconciliationExceptions.set(row.id, row);
    for (const row of webhookRows) this.webhooks.set(row.id, row);
    for (const row of webhookAttemptRows) this.webhookProcessingAttempts.set(row.id, row);

    for (const row of idempotencyRows) {
      this.idempotency.set(`${row.scope}:${row.key}`, {
        scope: row.scope,
        key: row.key,
        requestHash: row.requestHash,
        status: row.status as IdempotencyRecord["status"],
        resourceType: row.resourceType ?? undefined,
        resourceId: row.resourceId ?? undefined,
        responsePayload: row.responsePayload,
      });
    }
    for (const row of auditRows) this.auditEvents.push(row);
    for (const row of routingRuleRows) this.routingRules.set(row.id, row);

    if (this.providers.size === 0) {
      await this.#seedMockProviders();
    }
  }

  async #seedMockProviders(): Promise<void> {
    await this.#client.query(
      `INSERT INTO providers (id, code, display_name, kind, stage, active, metadata) VALUES
         ('00000000-0000-0000-0000-000000000001', 'mock-emi',  'Mock EMI',  'mock', 'stage1', TRUE, '{}'),
         ('00000000-0000-0000-0000-000000000002', 'mock-bank', 'Mock Bank', 'bank', 'stage2', TRUE, '{}')
       ON CONFLICT DO NOTHING`,
    );
    await this.#client.query(
      `INSERT INTO provider_bindings (id, provider_id, binding_kind, adapter_key, active, config, metadata) VALUES
         ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'mock',        'mock-emi',  TRUE, '{}', '{}'),
         ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'native_bank', 'mock-bank', TRUE, '{}', '{}')
       ON CONFLICT DO NOTHING`,
    );
    await this.#client.query(
      `INSERT INTO provider_capabilities (id, provider_id, capability_key, enabled, config) VALUES
         ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'outbound_payments', TRUE, '{"assets":["GBP/2"],"rails":["internal_book"],"countries":["GB"],"fallbackPriority":10}'),
         ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', 'outbound_payments', TRUE, '{"assets":["GBP/2","USD/2"],"rails":["wire","ach"],"countries":["GB","US"],"fallbackPriority":20}')
       ON CONFLICT DO NOTHING`,
    );
    await this.#client.query(
      `INSERT INTO provider_health (provider_binding_id, status, failure_count) VALUES
         ('00000000-0000-0000-0001-000000000001', 'healthy', 0),
         ('00000000-0000-0000-0001-000000000002', 'healthy', 0)
       ON CONFLICT DO NOTHING`,
    );
    // Re-load seeded rows into Maps
    const [p, b, c, h] = await Promise.all([
      this.#q<Provider>(
        `SELECT id, code, display_name AS "displayName", kind, stage, active, metadata,
                created_at AS "createdAt", updated_at AS "updatedAt" FROM providers`,
      ),
      this.#q<ProviderBinding>(
        `SELECT id, provider_id AS "providerId", binding_kind AS "bindingKind",
                adapter_key AS "adapterKey", formance_connector_id AS "formanceConnectorId",
                provider_tenant_reference AS "providerTenantReference", active, config, metadata,
                created_at AS "createdAt", updated_at AS "updatedAt" FROM provider_bindings`,
      ),
      this.#q<ProviderCapability>(
        `SELECT id, provider_id AS "providerId", capability_key AS "capabilityKey",
                enabled, config, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM provider_capabilities`,
      ),
      this.#q<ProviderHealth>(
        `SELECT provider_binding_id AS "providerBindingId", status, checked_at AS "checkedAt",
                failure_count AS "failureCount", latency_ms AS "latencyMs", reason
         FROM provider_health`,
      ),
    ]);
    for (const row of p) this.providers.set(row.id, row);
    for (const row of b) this.providerBindings.set(row.id, row);
    for (const row of c) this.providerCapabilities.set(row.id, row);
    for (const row of h) this.providerHealth.set(row.providerBindingId, row);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  async #q<T>(sql: string): Promise<T[]> {
    const result = await this.#client.query<T>(sql);
    return result.rows;
  }

  #persist(label: string, fn: () => Promise<void>): void {
    // Chain writes sequentially so FK-dependent inserts never race
    const write = this.#writeChain
      .then(fn)
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        this.#writeErrors.push(error);
        process.stderr.write(`[postgres-store] ${label}: ${error}\n`);
      })
      .finally(() => this.#pendingWrites.delete(write));
    this.#writeChain = write.catch(() => {}); // advance chain regardless of errors
    this.#pendingWrites.add(write);
  }

  async close(): Promise<void> {
    await this.flushPersistence();
    if ("close" in this.#client) {
      await (this.#client as { close(): Promise<void> }).close();
    }
  }

  async flushPersistence(): Promise<void> {
    while (this.#pendingWrites.size > 0) {
      await Promise.all([...this.#pendingWrites]);
    }
    if (this.#writeErrors.length > 0) {
      const errors = this.#writeErrors.splice(0);
      throw new AggregateError(errors, "Postgres persistence writes failed");
    }
  }

  // ── Write overrides ───────────────────────────────────────────────────────

  override createCustomer(input: CreateCustomerInput): Customer {
    const c = super.createCustomer(input);
    this.#persist("createCustomer", () =>
      this.#client
        .query(
          `INSERT INTO customers (id, external_reference, customer_type, status, legal_name, email, country_code, metadata, created_at, updated_at)
         VALUES ($1, $2, 'individual', 'active', $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
          [
            c.id,
            c.externalReference ?? null,
            c.legalName,
            c.email ?? null,
            c.countryCode ?? null,
            c.metadata,
            c.createdAt,
            c.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return c;
  }

  override updateCustomer(
    id: string,
    patch: Partial<Omit<Customer, "id" | "createdAt">>,
  ): Customer {
    const c = super.updateCustomer(id, patch);
    this.#persist("updateCustomer", () =>
      this.#client
        .query(`UPDATE customers SET metadata = $2, updated_at = $3 WHERE id = $1`, [
          c.id,
          c.metadata,
          c.updatedAt,
        ])
        .then(() => undefined),
    );
    return c;
  }

  override createPaymentAccount(input: CreatePaymentAccountInput): PaymentAccount {
    const a = super.createPaymentAccount(input);
    this.#persist("createPaymentAccount", () =>
      this.#client
        .query(
          `INSERT INTO payment_accounts (id, customer_id, provider_binding_id, account_kind, status, currency_code, country_code, display_name, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, 'virtual', 'active', $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
          [
            a.id,
            a.customerId,
            a.providerBindingId,
            a.currencyCode ?? null,
            a.countryCode ?? null,
            a.displayName ?? null,
            a.metadata,
            a.createdAt,
            a.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return a;
  }

  override createPaymentOrder(input: CreatePaymentOrderInput): PaymentOrder {
    const o = super.createPaymentOrder(input);
    this.#persist("createPaymentOrder", () =>
      this.#client
        .query(
          `INSERT INTO payment_orders (id, customer_id, payment_account_id, direction, transaction_type, amount, asset, beneficiary_reference, status, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, 'outbound', 'payment', $4, $5, $6, 'created', $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
          [
            o.id,
            o.customerId,
            o.paymentAccountId,
            o.amount.amount,
            o.amount.asset,
            o.beneficiaryReference ?? null,
            o.metadata,
            o.createdAt,
            o.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return o;
  }

  override createPaymentAttempt(
    order: PaymentOrder,
    providerBindingId: string,
    routeSnapshot: Record<string, unknown>,
  ): PaymentAttempt {
    const a = super.createPaymentAttempt(order, providerBindingId, routeSnapshot);
    this.#persist("createPaymentAttempt", () =>
      this.#client
        .query(
          `INSERT INTO payment_attempts (id, payment_order_id, provider_binding_id, attempt_number, status, route_snapshot, metadata, created_at, updated_at, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
          [
            a.id,
            a.paymentOrderId,
            a.providerBindingId,
            a.attemptNumber,
            a.status,
            a.routeSnapshot,
            a.metadata,
            a.createdAt,
            a.updatedAt,
            a.submittedAt ?? null,
          ],
        )
        .then(() => undefined),
    );
    return a;
  }

  override updatePaymentOrder(
    id: string,
    patch: Partial<Omit<PaymentOrder, "id" | "createdAt">>,
  ): PaymentOrder {
    const o = super.updatePaymentOrder(id, patch);
    this.#persist("updatePaymentOrder", () =>
      this.#client
        .query(
          `UPDATE payment_orders SET status = $2, provider_reference = $3, submitted_at = $4, completed_at = $5, updated_at = $6, metadata = $7 WHERE id = $1`,
          [
            o.id,
            o.status,
            o.providerReference ?? null,
            o.submittedAt ?? null,
            o.completedAt ?? null,
            o.updatedAt,
            o.metadata,
          ],
        )
        .then(() => undefined),
    );
    return o;
  }

  override updatePaymentAttempt(
    id: string,
    patch: Partial<Omit<PaymentAttempt, "id" | "createdAt">>,
  ): PaymentAttempt {
    const a = super.updatePaymentAttempt(id, patch);
    this.#persist("updatePaymentAttempt", () =>
      this.#client
        .query(
          `UPDATE payment_attempts SET status = $2, provider_transaction_id = $3, provider_reference = $4, last_error = $5, completed_at = $6, updated_at = $7, metadata = $8 WHERE id = $1`,
          [
            a.id,
            a.status,
            a.providerTransactionId ?? null,
            a.providerReference ?? null,
            a.lastError ?? null,
            a.completedAt ?? null,
            a.updatedAt,
            a.metadata,
          ],
        )
        .then(() => undefined),
    );
    return a;
  }

  override enqueueProviderCommand(
    input: Omit<
      ProviderCommandQueueItem,
      "id" | "status" | "retryCount" | "availableAt" | "createdAt" | "updatedAt"
    >,
  ): ProviderCommandQueueItem {
    const cmd = super.enqueueProviderCommand(input);
    this.#persist("enqueueProviderCommand", () =>
      this.#client
        .query(
          `INSERT INTO provider_command_queue (id, command_type, payment_order_id, payment_attempt_id, provider_binding_id, idempotency_key, payload, status, retry_count, available_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 0, $8, $9, $10)
         ON CONFLICT (idempotency_key) DO NOTHING`,
          [
            cmd.id,
            cmd.commandType,
            cmd.paymentOrderId,
            cmd.paymentAttemptId,
            cmd.providerBindingId,
            cmd.idempotencyKey,
            cmd.payload,
            cmd.availableAt,
            cmd.createdAt,
            cmd.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return cmd;
  }

  override claimProviderCommand(): ProviderCommandQueueItem | undefined {
    const cmd = super.claimProviderCommand();
    if (!cmd) return undefined;
    this.#persist("claimProviderCommand", () =>
      this.#client
        .query(
          `UPDATE provider_command_queue SET status = 'processing', locked_at = $2, updated_at = $3 WHERE id = $1`,
          [cmd.id, cmd.lockedAt ?? null, cmd.updatedAt],
        )
        .then(() => undefined),
    );
    return cmd;
  }

  override markProviderCommandCompleted(id: string): ProviderCommandQueueItem {
    const cmd = super.markProviderCommandCompleted(id);
    this.#persist("markProviderCommandCompleted", () =>
      this.#client
        .query(
          `UPDATE provider_command_queue SET status = 'completed', processed_at = $2, updated_at = $3 WHERE id = $1`,
          [cmd.id, cmd.processedAt ?? null, cmd.updatedAt],
        )
        .then(() => undefined),
    );
    return cmd;
  }

  override markProviderCommandFailed(id: string, error: string): ProviderCommandQueueItem {
    const cmd = super.markProviderCommandFailed(id, error);
    this.#persist("markProviderCommandFailed", () =>
      this.#client
        .query(
          `UPDATE provider_command_queue SET status = $2, retry_count = $3, last_error = $4, available_at = $5, updated_at = $6 WHERE id = $1`,
          [
            cmd.id,
            cmd.status,
            cmd.retryCount,
            cmd.lastError ?? null,
            cmd.availableAt,
            cmd.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return cmd;
  }

  override recordProviderRequestAttempt(
    input: Omit<ProviderRequestAttempt, "id" | "startedAt"> & { startedAt?: string },
  ): ProviderRequestAttempt {
    const ra = super.recordProviderRequestAttempt(input);
    this.#persist("recordProviderRequestAttempt", () =>
      this.#client
        .query(
          `INSERT INTO provider_request_attempts (id, provider_command_id, payment_attempt_id, provider_binding_id, attempt_number, status, request_payload, response_payload, provider_reference, error_message, started_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (provider_command_id, attempt_number) DO NOTHING`,
          [
            ra.id,
            ra.providerCommandId,
            ra.paymentAttemptId,
            ra.providerBindingId,
            ra.attemptNumber,
            ra.status,
            ra.requestPayload,
            ra.responsePayload ?? null,
            ra.providerReference ?? null,
            ra.errorMessage ?? null,
            ra.startedAt,
          ],
        )
        .then(() => undefined),
    );
    return ra;
  }

  override recordProviderTransaction(
    input: Omit<ProviderTransactionRecord, "id" | "occurredAt"> & { occurredAt?: string },
  ): ProviderTransactionRecord {
    const tx = super.recordProviderTransaction(input);
    this.#persist("recordProviderTransaction", () =>
      this.#client
        .query(
          `INSERT INTO provider_transactions (id, provider_binding_id, payment_attempt_id, payment_account_id, provider_transaction_id, provider_reference, direction, status, amount, asset, occurred_at, raw_payload, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (provider_binding_id, provider_transaction_id) DO UPDATE SET
           payment_attempt_id = COALESCE(EXCLUDED.payment_attempt_id, provider_transactions.payment_attempt_id),
           payment_account_id = COALESCE(EXCLUDED.payment_account_id, provider_transactions.payment_account_id),
           provider_reference = COALESCE(EXCLUDED.provider_reference, provider_transactions.provider_reference),
           direction = EXCLUDED.direction,
           status = EXCLUDED.status,
           amount = EXCLUDED.amount,
           asset = EXCLUDED.asset,
           occurred_at = EXCLUDED.occurred_at,
           raw_payload = EXCLUDED.raw_payload,
           metadata = EXCLUDED.metadata`,
          [
            tx.id,
            tx.providerBindingId,
            tx.paymentAttemptId ?? null,
            tx.paymentAccountId ?? null,
            tx.providerTransactionId,
            tx.providerReference ?? null,
            tx.direction,
            tx.status,
            tx.amount,
            tx.asset,
            tx.occurredAt,
            tx.rawPayload,
            tx.metadata,
          ],
        )
        .then(() => undefined),
    );
    return tx;
  }

  override enqueueLedgerPosting(request: LedgerPostingRequest): LedgerQueueItem {
    const item = super.enqueueLedgerPosting(request);
    this.#persist("enqueueLedgerPosting", () =>
      this.#client
        .query(
          `INSERT INTO ledger_posting_queue (id, aggregate_type, aggregate_id, posting_key, idempotency_key, ledger_name, payload, status, retry_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 0, $8, $9)
         ON CONFLICT (idempotency_key) DO NOTHING`,
          [
            item.id,
            item.aggregateType,
            item.aggregateId,
            item.postingKey,
            item.idempotencyKey,
            item.ledgerName,
            { description: item.description, postings: item.postings, metadata: item.metadata },
            item.createdAt,
            item.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return item;
  }

  override markLedgerPosted(id: string, result: LedgerPostingResult): LedgerQueueItem {
    const item = super.markLedgerPosted(id, result);
    const attemptNumber = (this.ledgerPostingAttempts.get(id) ?? []).length;
    this.#persist("markLedgerPosted", () =>
      this.#client
        .query(`UPDATE ledger_posting_queue SET status = 'posted', updated_at = $2 WHERE id = $1`, [
          id,
          item.updatedAt,
        ])
        .then(() =>
          this.#client.query(
            `INSERT INTO ledger_posting_attempts (ledger_posting_queue_id, attempt_number, formance_transaction_id, status, completed_at)
           VALUES ($1, $2, $3, 'posted', now())
           ON CONFLICT (ledger_posting_queue_id, attempt_number) DO NOTHING`,
            [id, attemptNumber, result.formanceTransactionId],
          ),
        )
        .then(() => undefined),
    );
    return item;
  }

  override markLedgerFailed(id: string, error: string): LedgerQueueItem {
    const item = super.markLedgerFailed(id, error);
    const attemptNumber = (this.ledgerPostingAttempts.get(id) ?? []).length;
    this.#persist("markLedgerFailed", () =>
      this.#client
        .query(
          `UPDATE ledger_posting_queue SET status = $2, retry_count = $3, last_error = $4, updated_at = $5 WHERE id = $1`,
          [id, item.status, item.retryCount, item.lastError ?? null, item.updatedAt],
        )
        .then(() =>
          this.#client.query(
            `INSERT INTO ledger_posting_attempts (ledger_posting_queue_id, attempt_number, status, error_message, completed_at)
           VALUES ($1, $2, 'failed', $3, now())
           ON CONFLICT (ledger_posting_queue_id, attempt_number) DO NOTHING`,
            [id, attemptNumber, error],
          ),
        )
        .then(() => undefined),
    );
    return item;
  }

  override resetLedgerPosting(id: string): LedgerQueueItem {
    const item = super.resetLedgerPosting(id);
    this.#persist("resetLedgerPosting", () =>
      this.#client
        .query(
          `UPDATE ledger_posting_queue SET status = 'pending', last_error = NULL, updated_at = $2 WHERE id = $1`,
          [id, item.updatedAt],
        )
        .then(() => undefined),
    );
    return item;
  }

  override storeWebhookEvent(event: WebhookEvent): void {
    super.storeWebhookEvent(event);
    this.#persist("storeWebhookEvent", () =>
      this.#client
        .query(
          `INSERT INTO webhook_events (id, provider_binding_id, provider_code, delivery_id, idempotency_key, signature_valid, processing_status, request_path, headers, query_params, body, received_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
          [
            event.id,
            event.providerBindingId,
            event.providerCode,
            event.deliveryId ?? null,
            event.idempotencyKey ?? null,
            event.signatureValid ?? null,
            event.processingStatus,
            event.requestPath,
            event.headers,
            event.queryParams,
            event.body,
            event.receivedAt,
            event.metadata,
          ],
        )
        .then(() => undefined),
    );
  }

  override queueWebhookForProcessing(id: string): WebhookEvent {
    const event = super.queueWebhookForProcessing(id);
    this.#persist("queueWebhookForProcessing", () =>
      this.#client
        .query(`UPDATE webhook_events SET processing_status = 'queued' WHERE id = $1`, [id])
        .then(() => undefined),
    );
    return event;
  }

  override claimWebhookForProcessing(): WebhookEvent | undefined {
    const event = super.claimWebhookForProcessing();
    if (!event) return undefined;
    const attempt = [...this.webhookProcessingAttempts.values()]
      .filter((a) => a.webhookEventId === event.id && a.status === "processing")
      .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
    this.#persist("claimWebhookForProcessing", () =>
      this.#client
        .query(`UPDATE webhook_events SET processing_status = 'processing' WHERE id = $1`, [
          event.id,
        ])
        .then(() =>
          attempt
            ? this.#client.query(
                `INSERT INTO webhook_processing_attempts (id, webhook_event_id, attempt_number, status, started_at)
               VALUES ($1, $2, $3, 'processing', $4)
               ON CONFLICT (webhook_event_id, attempt_number) DO NOTHING`,
                [attempt.id, attempt.webhookEventId, attempt.attemptNumber, attempt.startedAt],
              )
            : Promise.resolve({ rows: [] }),
        )
        .then(() => undefined),
    );
    return event;
  }

  override markWebhookProcessed(id: string): WebhookEvent {
    const event = super.markWebhookProcessed(id);
    const attempt = this.#latestWebhookAttempt(id, "processed");
    this.#persist("markWebhookProcessed", () =>
      this.#client
        .query(
          `UPDATE webhook_events SET processing_status = 'processed', processed_at = $2 WHERE id = $1`,
          [id, event.processedAt ?? null],
        )
        .then(() => this.#upsertWebhookAttempt(attempt))
        .then(() => undefined),
    );
    return event;
  }

  override markWebhookFailed(id: string, error: string): WebhookEvent {
    const event = super.markWebhookFailed(id, error);
    const attempt = this.#latestWebhookAttempt(id, "failed");
    this.#persist("markWebhookFailed", () =>
      this.#client
        .query(`UPDATE webhook_events SET processing_status = $2, last_error = $3 WHERE id = $1`, [
          id,
          event.processingStatus,
          error,
        ])
        .then(() => this.#upsertWebhookAttempt(attempt))
        .then(() => undefined),
    );
    return event;
  }

  override markWebhookIgnored(id: string): WebhookEvent {
    const event = super.markWebhookIgnored(id);
    const attempt = this.#latestWebhookAttempt(id, "ignored");
    this.#persist("markWebhookIgnored", () =>
      this.#client
        .query(
          `UPDATE webhook_events SET processing_status = 'ignored', processed_at = $2 WHERE id = $1`,
          [id, event.processedAt ?? null],
        )
        .then(() => this.#upsertWebhookAttempt(attempt))
        .then(() => undefined),
    );
    return event;
  }

  #latestWebhookAttempt(
    webhookId: string,
    status: WebhookProcessingAttempt["status"],
  ): WebhookProcessingAttempt | undefined {
    return [...this.webhookProcessingAttempts.values()]
      .filter((a) => a.webhookEventId === webhookId && a.status === status)
      .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
  }

  async #upsertWebhookAttempt(attempt: WebhookProcessingAttempt | undefined): Promise<void> {
    if (!attempt) return;
    await this.#client.query(
      `INSERT INTO webhook_processing_attempts (id, webhook_event_id, attempt_number, status, error_message, started_at, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (webhook_event_id, attempt_number) DO UPDATE
         SET status = EXCLUDED.status, error_message = EXCLUDED.error_message, finished_at = EXCLUDED.finished_at`,
      [
        attempt.id,
        attempt.webhookEventId,
        attempt.attemptNumber,
        attempt.status,
        attempt.errorMessage ?? null,
        attempt.startedAt,
        attempt.finishedAt ?? null,
      ],
    );
  }

  override createReconciliationRun(
    input: Omit<ReconciliationRun, "id" | "status" | "createdAt">,
  ): ReconciliationRun {
    const run = super.createReconciliationRun(input);
    this.#persist("createReconciliationRun", () =>
      this.#client
        .query(
          `INSERT INTO reconciliation_runs (id, provider_binding_id, run_type, status, period_start, period_end, summary, created_at)
         VALUES ($1, $2, $3, 'queued', $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
          [
            run.id,
            run.providerBindingId ?? null,
            run.runType,
            run.periodStart ?? null,
            run.periodEnd ?? null,
            run.summary,
            run.createdAt,
          ],
        )
        .then(() => undefined),
    );
    return run;
  }

  override updateReconciliationRun(
    id: string,
    patch: Partial<Omit<ReconciliationRun, "id" | "createdAt">>,
  ): ReconciliationRun {
    const run = super.updateReconciliationRun(id, patch);
    this.#persist("updateReconciliationRun", () =>
      this.#client
        .query(
          `UPDATE reconciliation_runs SET status = $2, started_at = $3, completed_at = $4, summary = $5 WHERE id = $1`,
          [run.id, run.status, run.startedAt ?? null, run.completedAt ?? null, run.summary],
        )
        .then(() => undefined),
    );
    return run;
  }

  override createReconciliationRecord(
    input: Omit<ReconciliationRecord, "id" | "createdAt">,
  ): ReconciliationRecord {
    const record = super.createReconciliationRecord(input);
    this.#persist("createReconciliationRecord", () =>
      this.#client
        .query(
          `INSERT INTO reconciliation_records (id, reconciliation_run_id, payment_order_id, payment_attempt_id, provider_transaction_id, ledger_posting_queue_id, match_status, evidence, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
          [
            record.id,
            record.reconciliationRunId,
            record.paymentOrderId ?? null,
            record.paymentAttemptId ?? null,
            record.providerTransactionId ?? null,
            record.ledgerPostingId ?? null,
            record.matchStatus,
            record.evidence,
            record.createdAt,
          ],
        )
        .then(() => undefined),
    );
    return record;
  }

  override createReconciliationException(
    input: Omit<ReconciliationException, "id" | "status" | "createdAt">,
  ): ReconciliationException {
    const ex = super.createReconciliationException(input);
    this.#persist("createReconciliationException", () =>
      this.#client
        .query(
          `INSERT INTO reconciliation_exceptions (id, reconciliation_run_id, payment_order_id, payment_attempt_id, provider_transaction_id, ledger_posting_queue_id, category, severity, status, description, evidence, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
          [
            ex.id,
            ex.reconciliationRunId ?? null,
            ex.paymentOrderId ?? null,
            ex.paymentAttemptId ?? null,
            ex.providerTransactionId ?? null,
            ex.ledgerPostingId ?? null,
            ex.category,
            ex.severity,
            ex.description,
            ex.evidence,
            ex.createdAt,
          ],
        )
        .then(() => undefined),
    );
    return ex;
  }

  override resolveReconciliationException(
    id: string,
    resolvedBy: string,
    note?: string,
  ): ReconciliationException {
    const ex = super.resolveReconciliationException(id, resolvedBy, note);
    this.#persist("resolveReconciliationException", () =>
      this.#client
        .query(
          `UPDATE reconciliation_exceptions SET status = 'resolved', resolved_at = $2, resolved_by = $3, manual_note = $4 WHERE id = $1`,
          [id, ex.resolvedAt ?? null, ex.resolvedBy ?? null, ex.manualNote ?? null],
        )
        .then(() => undefined),
    );
    return ex;
  }

  override updateReconciliationException(
    id: string,
    patch: Partial<
      Pick<
        ReconciliationException,
        "severity" | "status" | "manualNote" | "ignoredAt" | "ignoredBy"
      >
    >,
  ): ReconciliationException {
    const ex = super.updateReconciliationException(id, patch);
    this.#persist("updateReconciliationException", () =>
      this.#client
        .query(
          `UPDATE reconciliation_exceptions SET severity = $2, status = $3, manual_note = $4 WHERE id = $1`,
          [id, ex.severity, ex.status, ex.manualNote ?? null],
        )
        .then(() => undefined),
    );
    return ex;
  }

  override ignoreReconciliationException(
    id: string,
    ignoredBy: string,
    note?: string,
  ): ReconciliationException {
    const ex = super.ignoreReconciliationException(id, ignoredBy, note);
    this.#persist("ignoreReconciliationException", () =>
      this.#client
        .query(
          `UPDATE reconciliation_exceptions SET status = 'ignored', ignored_at = $2, ignored_by = $3, manual_note = $4 WHERE id = $1`,
          [id, ex.ignoredAt ?? null, ex.ignoredBy ?? null, ex.manualNote ?? null],
        )
        .then(() => undefined),
    );
    return ex;
  }

  override setProviderHealth(
    providerBindingId: string,
    status: ProviderHealth["status"],
    detail: Omit<Partial<ProviderHealth>, "providerBindingId" | "status"> = {},
  ): ProviderHealth {
    const health = super.setProviderHealth(providerBindingId, status, detail);
    this.#persist("setProviderHealth", () =>
      this.#client
        .query(
          `INSERT INTO provider_health (provider_binding_id, status, failure_count, latency_ms, reason)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (provider_binding_id) DO UPDATE
           SET status = EXCLUDED.status, checked_at = now(), failure_count = EXCLUDED.failure_count,
               latency_ms = EXCLUDED.latency_ms, reason = EXCLUDED.reason`,
          [
            providerBindingId,
            health.status,
            health.failureCount,
            health.latencyMs ?? null,
            health.reason ?? null,
          ],
        )
        .then(() => undefined),
    );
    return health;
  }

  override audit(
    actorType: AuditEvent["actorType"],
    action: string,
    resourceType: string,
    resourceId: string,
    payload: Record<string, unknown> = {},
  ): AuditEvent {
    const event = super.audit(actorType, action, resourceType, resourceId, payload);
    this.#persist("audit", () =>
      this.#client
        .query(
          `INSERT INTO audit_events (id, actor_type, action, resource_type, resource_id, payload, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
          [
            event.id,
            event.actorType,
            event.action,
            event.resourceType,
            event.resourceId,
            event.payload,
            event.createdAt,
          ],
        )
        .then(() => undefined),
    );
    return event;
  }

  override withIdempotency<T>(
    scope: string,
    key: string | undefined,
    requestHash: string,
    execute: () => { resourceType: string; resourceId: string; response: T },
  ): T {
    const result = super.withIdempotency(scope, key, requestHash, execute);
    if (key) {
      const record = this.idempotency.get(`${scope}:${key}`);
      if (record) {
        this.#persist("withIdempotency", () =>
          this.#client
            .query(
              `INSERT INTO idempotency_keys (scope, idempotency_key, request_hash, status, resource_type, resource_id, response_payload)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (scope, idempotency_key) DO UPDATE
               SET status = EXCLUDED.status, resource_type = EXCLUDED.resource_type,
                   resource_id = EXCLUDED.resource_id, response_payload = EXCLUDED.response_payload`,
              [
                record.scope,
                record.key,
                record.requestHash,
                record.status,
                record.resourceType ?? null,
                record.resourceId ?? null,
                record.responsePayload ?? null,
              ],
            )
            .then(() => undefined),
        );
      }
    }
    return result;
  }

  override createRoutingRule(input: CreateRoutingRuleInput): RoutingRule {
    const rule = super.createRoutingRule(input);
    this.#persist("createRoutingRule", () =>
      this.#client
        .query(
          `INSERT INTO routing_rules (id, name, description, priority, active, conditions, outcome, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
          [
            rule.id,
            rule.name,
            rule.description ?? null,
            rule.priority,
            rule.active,
            rule.conditions,
            rule.outcome,
            rule.createdAt,
            rule.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return rule;
  }

  override updateRoutingRule(id: string, patch: UpdateRoutingRuleInput): RoutingRule {
    const rule = super.updateRoutingRule(id, patch);
    this.#persist("updateRoutingRule", () =>
      this.#client
        .query(
          `UPDATE routing_rules SET name = $2, description = $3, priority = $4, active = $5, conditions = $6, outcome = $7, updated_at = $8 WHERE id = $1`,
          [
            rule.id,
            rule.name,
            rule.description ?? null,
            rule.priority,
            rule.active,
            rule.conditions,
            rule.outcome,
            rule.updatedAt,
          ],
        )
        .then(() => undefined),
    );
    return rule;
  }

  override deactivateRoutingRule(id: string): RoutingRule {
    const rule = super.deactivateRoutingRule(id);
    this.#persist("deactivateRoutingRule", () =>
      this.#client
        .query(`UPDATE routing_rules SET active = false, updated_at = $2 WHERE id = $1`, [
          rule.id,
          rule.updatedAt,
        ])
        .then(() => undefined),
    );
    return rule;
  }
}
