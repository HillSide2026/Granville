import { GranvilleApiError } from "./errors.ts";
import type {
  AuditEvent,
  CreateCustomerInput,
  CreatePaymentAccountInput,
  CreatePaymentOrderInput,
  CreateRoutingRuleInput,
  Customer,
  DateRangeFilter,
  LedgerQueueItem,
  PaymentAccount,
  PaymentHistoryRecord,
  PaymentOrder,
  PlatformMetrics,
  ReconciliationException,
  RoutingRule,
  SettlementLine,
  UpdateRoutingRuleInput,
  WebhookEvent,
} from "./types.ts";

export interface GranvilleClientOptions {
  baseUrl: string;
  token: string;
}

export class GranvilleClient {
  readonly #baseUrl: string;
  readonly #token: string;

  constructor(options: GranvilleClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#token = options.token;
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  async createCustomer(input: CreateCustomerInput, idempotencyKey?: string): Promise<Customer> {
    return this.#post<Customer>("/customers", input, idempotencyKey);
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.#get<Customer>(`/customers/${id}`);
  }

  async patchCustomer(id: string, metadata: Record<string, string>): Promise<Customer> {
    return this.#patch<Customer>(`/customers/${id}`, { metadata });
  }

  // ── Payment accounts ──────────────────────────────────────────────────────

  async createPaymentAccount(
    input: CreatePaymentAccountInput,
    idempotencyKey?: string,
  ): Promise<PaymentAccount> {
    return this.#post<PaymentAccount>("/payment-accounts", input, idempotencyKey);
  }

  async getPaymentAccount(id: string): Promise<PaymentAccount> {
    return this.#get<PaymentAccount>(`/payment-accounts/${id}`);
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  async createPayment(
    input: CreatePaymentOrderInput,
    idempotencyKey?: string,
  ): Promise<PaymentOrder> {
    return this.#post<PaymentOrder>("/payments", input, idempotencyKey);
  }

  async getPayment(id: string): Promise<PaymentOrder> {
    return this.#get<PaymentOrder>(`/payments/${id}`);
  }

  async getPaymentStatus(id: string): Promise<{ id: string; status: string }> {
    return this.#get<{ id: string; status: string }>(`/payments/${id}/status`);
  }

  async submitPayment(id: string): Promise<PaymentOrder> {
    return this.#post<PaymentOrder>(`/payments/${id}/submit`, {});
  }

  async cancelPayment(id: string, reason?: string): Promise<PaymentOrder> {
    return this.#post<PaymentOrder>(`/payments/${id}/cancel`, reason ? { reason } : {});
  }

  async retryPayment(id: string): Promise<PaymentOrder> {
    return this.#post<PaymentOrder>(`/payments/${id}/retry`, {});
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  async postWebhook(
    provider: string,
    body: Record<string, unknown>,
  ): Promise<{ id: string; status: string }> {
    return this.#post<{ id: string; status: string }>(`/webhooks/${provider}`, body);
  }

  // ── Reconciliation ────────────────────────────────────────────────────────

  async runReconciliation(): Promise<{ runId: string; exceptionCount: number }> {
    return this.#post<{ runId: string; exceptionCount: number }>("/reconciliation/runs", {});
  }

  async getReconciliationExceptions(): Promise<ReconciliationException[]> {
    return this.#get<ReconciliationException[]>("/reconciliation/exceptions");
  }

  // ── Admin reads ───────────────────────────────────────────────────────────

  async getMetrics(): Promise<PlatformMetrics> {
    return this.#get<PlatformMetrics>("/admin/metrics");
  }

  async getAuditEvents(): Promise<AuditEvent[]> {
    return this.#get<AuditEvent[]>("/admin/audit-events");
  }

  async getPaymentHistory(filter?: DateRangeFilter & { status?: string }): Promise<PaymentHistoryRecord[]> {
    const params = new URLSearchParams();
    if (filter?.from) params.set("from", filter.from);
    if (filter?.to) params.set("to", filter.to);
    if (filter?.status) params.set("status", filter.status);
    const qs = params.toString();
    return this.#get<PaymentHistoryRecord[]>(`/admin/reports/payment-history${qs ? `?${qs}` : ""}`);
  }

  async getSettlement(filter?: DateRangeFilter): Promise<SettlementLine[]> {
    const params = new URLSearchParams();
    if (filter?.from) params.set("from", filter.from);
    if (filter?.to) params.set("to", filter.to);
    const qs = params.toString();
    return this.#get<SettlementLine[]>(`/admin/reports/settlement${qs ? `?${qs}` : ""}`);
  }

  async getAuditExport(filter?: DateRangeFilter): Promise<string> {
    const params = new URLSearchParams();
    if (filter?.from) params.set("from", filter.from);
    if (filter?.to) params.set("to", filter.to);
    const qs = params.toString();
    const response = await this.#request(
      "GET",
      `/admin/reports/audit-export${qs ? `?${qs}` : ""}`,
    );
    return response.text();
  }

  async getWebhookEvents(): Promise<WebhookEvent[]> {
    return this.#get<WebhookEvent[]>("/admin/webhook-events");
  }

  async getLedgerPostings(): Promise<LedgerQueueItem[]> {
    return this.#get<LedgerQueueItem[]>("/admin/ledger-postings");
  }

  // ── Routing rules ─────────────────────────────────────────────────────────

  async listRoutingRules(): Promise<RoutingRule[]> {
    return this.#get<RoutingRule[]>("/admin/routing-rules");
  }

  async getRoutingRule(id: string): Promise<RoutingRule> {
    return this.#get<RoutingRule>(`/admin/routing-rules/${id}`);
  }

  async createRoutingRule(input: CreateRoutingRuleInput): Promise<RoutingRule> {
    return this.#post<RoutingRule>("/admin/routing-rules", input);
  }

  async updateRoutingRule(id: string, patch: UpdateRoutingRuleInput): Promise<RoutingRule> {
    return this.#patch<RoutingRule>(`/admin/routing-rules/${id}`, patch);
  }

  async deactivateRoutingRule(id: string): Promise<RoutingRule> {
    return this.#post<RoutingRule>(`/admin/routing-rules/${id}/deactivate`, {});
  }

  // ── HTTP helpers ──────────────────────────────────────────────────────────

  async #request(method: string, path: string, body?: unknown, idempotencyKey?: string): Promise<Response> {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.#token}`,
      "Content-Type": "application/json",
    };
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return fetch(`${this.#baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async #parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new GranvilleApiError(response.status, "INTERNAL_ERROR", text);
    }
    if (!response.ok) {
      const envelope = parsed as { error?: { code?: string; message?: string; details?: unknown } };
      const err = envelope?.error;
      throw new GranvilleApiError(
        response.status,
        err?.code ?? "INTERNAL_ERROR",
        err?.message ?? `HTTP ${response.status}`,
        err?.details,
      );
    }
    return parsed as T;
  }

  async #get<T>(path: string): Promise<T> {
    const response = await this.#request("GET", path);
    return this.#parseResponse<T>(response);
  }

  async #post<T>(path: string, body: unknown, idempotencyKey?: string): Promise<T> {
    const response = await this.#request("POST", path, body, idempotencyKey);
    return this.#parseResponse<T>(response);
  }

  async #patch<T>(path: string, body: unknown): Promise<T> {
    const response = await this.#request("PATCH", path, body);
    return this.#parseResponse<T>(response);
  }
}
