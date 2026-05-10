import type {
  AuditEvent,
  CreateCustomerInput,
  CreatePaymentAccountInput,
  CreatePaymentOrderInput,
  LedgerQueueItem,
  ProviderCommandQueueItem,
  ProviderHealth,
  ProviderRequestAttempt,
  ProviderTransactionRecord,
} from "./in-memory-store.ts";
import type { PaymentAccount } from "../../contracts/account.ts";
import type { Customer } from "../../contracts/customer.ts";
import type { PaymentAttempt, PaymentOrder } from "../../contracts/payment.ts";
import type { ProviderBinding, ProviderCapability } from "../../contracts/provider.ts";
import type { GranvilleRepositories } from "./repository-contracts.ts";

export interface SqlClient {
  query<T = unknown>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

export class PostgresGranvilleRepositories implements GranvilleRepositories {
  client: SqlClient;

  constructor(client: SqlClient) {
    this.client = client;
  }

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const result = await this.client.query<Customer>(
      `INSERT INTO customers (external_reference, customer_type, status, legal_name, email, country_code, metadata)
       VALUES ($1, 'individual', 'active', $2, $3, $4, $5)
       RETURNING id, external_reference AS "externalReference", customer_type AS type, status, legal_name AS "legalName",
         email, country_code AS "countryCode", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        input.externalReference,
        input.legalName,
        input.email,
        input.countryCode,
        input.metadata ?? {},
      ],
    );
    return result.rows[0];
  }

  async createPaymentAccount(input: CreatePaymentAccountInput): Promise<PaymentAccount> {
    const result = await this.client.query<PaymentAccount>(
      `INSERT INTO payment_accounts (customer_id, provider_binding_id, account_kind, status, currency_code, country_code, display_name, metadata)
       VALUES ($1, $2, 'virtual', 'active', $3, $4, $5, $6)
       RETURNING id, customer_id AS "customerId", provider_binding_id AS "providerBindingId", account_kind AS kind,
         status, currency_code AS "currencyCode", country_code AS "countryCode", display_name AS "displayName",
         metadata, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        input.customerId,
        input.providerBindingId,
        input.currencyCode,
        input.countryCode,
        input.displayName,
        input.metadata ?? {},
      ],
    );
    return result.rows[0];
  }

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const result = await this.client.query<PaymentOrder>(
      `INSERT INTO payment_orders (customer_id, payment_account_id, direction, transaction_type, amount, asset, beneficiary_reference, status, metadata)
       VALUES ($1, $2, 'outbound', 'payment', $3, $4, $5, 'created', $6)
       RETURNING id, customer_id AS "customerId", payment_account_id AS "paymentAccountId", direction,
         transaction_type AS "transactionType", jsonb_build_object('amount', amount::text, 'asset', asset) AS amount,
         beneficiary_reference AS "beneficiaryReference", provider_reference AS "providerReference", status,
         metadata, created_at AS "createdAt", updated_at AS "updatedAt", submitted_at AS "submittedAt",
         completed_at AS "completedAt"`,
      [
        input.customerId,
        input.paymentAccountId,
        input.amount,
        input.asset,
        input.beneficiaryReference,
        input.metadata ?? {},
      ],
    );
    return result.rows[0];
  }

  async updatePaymentOrder(
    id: string,
    patch: Partial<Omit<PaymentOrder, "id" | "createdAt">>,
  ): Promise<PaymentOrder> {
    const result = await this.client.query<PaymentOrder>(
      `UPDATE payment_orders
       SET status = COALESCE($2, status),
           provider_reference = COALESCE($3, provider_reference),
           submitted_at = COALESCE($4, submitted_at),
           completed_at = COALESCE($5, completed_at),
           updated_at = now()
       WHERE id = $1
       RETURNING id, customer_id AS "customerId", payment_account_id AS "paymentAccountId", direction,
         transaction_type AS "transactionType", jsonb_build_object('amount', amount::text, 'asset', asset) AS amount,
         beneficiary_reference AS "beneficiaryReference", provider_reference AS "providerReference", status,
         metadata, created_at AS "createdAt", updated_at AS "updatedAt", submitted_at AS "submittedAt",
         completed_at AS "completedAt"`,
      [id, patch.status, patch.providerReference, patch.submittedAt, patch.completedAt],
    );
    return result.rows[0];
  }

  async updatePaymentAttempt(
    id: string,
    patch: Partial<Omit<PaymentAttempt, "id" | "createdAt">>,
  ): Promise<PaymentAttempt> {
    const result = await this.client.query<PaymentAttempt>(
      `UPDATE payment_attempts
       SET status = COALESCE($2, status),
           provider_transaction_id = COALESCE($3, provider_transaction_id),
           provider_reference = COALESCE($4, provider_reference),
           last_error = COALESCE($5, last_error),
           completed_at = COALESCE($6, completed_at),
           updated_at = now()
       WHERE id = $1
       RETURNING id, payment_order_id AS "paymentOrderId", provider_binding_id AS "providerBindingId",
         attempt_number AS "attemptNumber", status, provider_request_id AS "providerRequestId",
         provider_transaction_id AS "providerTransactionId", provider_reference AS "providerReference",
         route_snapshot AS "routeSnapshot", last_error AS "lastError", metadata,
         created_at AS "createdAt", updated_at AS "updatedAt", submitted_at AS "submittedAt",
         completed_at AS "completedAt"`,
      [
        id,
        patch.status,
        patch.providerTransactionId,
        patch.providerReference,
        patch.lastError,
        patch.completedAt,
      ],
    );
    return result.rows[0];
  }

  async enqueueProviderCommand(
    input: Omit<
      ProviderCommandQueueItem,
      "id" | "status" | "retryCount" | "availableAt" | "createdAt" | "updatedAt"
    >,
  ): Promise<ProviderCommandQueueItem> {
    const result = await this.client.query<ProviderCommandQueueItem>(
      `INSERT INTO provider_command_queue
        (command_type, payment_order_id, payment_attempt_id, provider_binding_id, idempotency_key, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = provider_command_queue.updated_at
       RETURNING id, command_type AS "commandType", payment_order_id AS "paymentOrderId",
         payment_attempt_id AS "paymentAttemptId", provider_binding_id AS "providerBindingId",
         idempotency_key AS "idempotencyKey", payload, status, retry_count AS "retryCount",
         available_at AS "availableAt", locked_at AS "lockedAt", processed_at AS "processedAt",
         last_error AS "lastError", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        input.commandType,
        input.paymentOrderId,
        input.paymentAttemptId,
        input.providerBindingId,
        input.idempotencyKey,
        input.payload,
      ],
    );
    return result.rows[0];
  }

  async recordProviderRequestAttempt(
    input: Omit<ProviderRequestAttempt, "id" | "startedAt"> & { startedAt?: string },
  ): Promise<ProviderRequestAttempt> {
    const result = await this.client.query<ProviderRequestAttempt>(
      `INSERT INTO provider_request_attempts
        (provider_command_id, payment_attempt_id, provider_binding_id, attempt_number, status, request_payload,
         response_payload, provider_reference, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, provider_command_id AS "providerCommandId", payment_attempt_id AS "paymentAttemptId",
         provider_binding_id AS "providerBindingId", attempt_number AS "attemptNumber", status,
         request_payload AS "requestPayload", response_payload AS "responsePayload",
         provider_reference AS "providerReference", error_message AS "errorMessage",
         started_at AS "startedAt", completed_at AS "completedAt"`,
      [
        input.providerCommandId,
        input.paymentAttemptId,
        input.providerBindingId,
        input.attemptNumber,
        input.status,
        input.requestPayload,
        input.responsePayload,
        input.providerReference,
        input.errorMessage,
      ],
    );
    return result.rows[0];
  }

  async recordProviderTransaction(
    input: Omit<ProviderTransactionRecord, "id" | "occurredAt"> & { occurredAt?: string },
  ): Promise<ProviderTransactionRecord> {
    const result = await this.client.query<ProviderTransactionRecord>(
      `INSERT INTO provider_transactions
        (provider_binding_id, payment_attempt_id, payment_account_id, provider_transaction_id,
         provider_reference, direction, status, amount, asset, occurred_at, raw_payload, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, now()), $11, $12)
       ON CONFLICT (provider_binding_id, provider_transaction_id) DO UPDATE
         SET raw_payload = EXCLUDED.raw_payload, updated_at = now()
       RETURNING id, provider_binding_id AS "providerBindingId", payment_attempt_id AS "paymentAttemptId",
         payment_account_id AS "paymentAccountId", provider_transaction_id AS "providerTransactionId",
         provider_reference AS "providerReference", direction, status, amount::text AS amount, asset,
         occurred_at AS "occurredAt", raw_payload AS "rawPayload", metadata`,
      [
        input.providerBindingId,
        input.paymentAttemptId,
        input.paymentAccountId,
        input.providerTransactionId,
        input.providerReference,
        input.direction,
        input.status,
        input.amount,
        input.asset,
        input.occurredAt,
        input.rawPayload,
        input.metadata,
      ],
    );
    return result.rows[0];
  }

  async providerBindings(): Promise<ProviderBinding[]> {
    const result = await this.client.query<ProviderBinding>(
      `SELECT id, provider_id AS "providerId", binding_kind AS "bindingKind", adapter_key AS "adapterKey",
        formance_connector_id AS "formanceConnectorId", provider_tenant_reference AS "providerTenantReference",
        active, config, metadata, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM provider_bindings`,
    );
    return result.rows;
  }

  async providerCapabilities(): Promise<ProviderCapability[]> {
    const result = await this.client.query<ProviderCapability>(
      `SELECT id, provider_id AS "providerId", capability_key AS "capabilityKey", enabled, config,
        created_at AS "createdAt", updated_at AS "updatedAt"
       FROM provider_capabilities`,
    );
    return result.rows;
  }

  async providerHealth(): Promise<ProviderHealth[]> {
    const result = await this.client.query<ProviderHealth>(
      `SELECT provider_binding_id AS "providerBindingId", status, checked_at AS "checkedAt",
        failure_count AS "failureCount", latency_ms AS "latencyMs", reason
       FROM provider_health`,
    );
    return result.rows;
  }

  async ledgerQueueItems(): Promise<LedgerQueueItem[]> {
    const result = await this.client.query<LedgerQueueItem>(
      `SELECT id, aggregate_type AS "aggregateType", aggregate_id AS "aggregateId", posting_key AS "postingKey",
        idempotency_key AS "idempotencyKey", ledger_name AS "ledgerName", payload, status,
        retry_count AS "retryCount", last_error AS "lastError", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM ledger_posting_queue`,
    );
    return result.rows;
  }

  async auditEvents(): Promise<AuditEvent[]> {
    const result = await this.client.query<AuditEvent>(
      `SELECT id, actor_type AS "actorType", actor_id AS "actorId", action, resource_type AS "resourceType",
        resource_id AS "resourceId", request_id AS "requestId", idempotency_key AS "idempotencyKey",
        payload, created_at AS "createdAt"
       FROM audit_events
       ORDER BY created_at DESC`,
    );
    return result.rows;
  }
}
