import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { GranvilleErrorCode } from "../../../libs/contracts/errors.ts";
import { GranvilleApi } from "./granville-api.ts";

export interface Principal {
  id: string;
  roles: string[];
}

export interface HttpContext {
  principal: Principal;
  idempotencyKey?: string;
}

export class HttpError extends Error {
  statusCode: number;
  code: GranvilleErrorCode;

  constructor(statusCode: number, message: string, code?: GranvilleErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? httpStatusToCode(statusCode);
  }
}

function httpStatusToCode(status: number): GranvilleErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 400) return "VALIDATION_ERROR";
  return "INTERNAL_ERROR";
}

export class GranvilleHttpControllers {
  api: GranvilleApi;

  constructor(api = new GranvilleApi()) {
    this.api = api;
  }

  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const urlParts = (request.url ?? "/").split("/").filter(Boolean);

      // Webhook endpoints bypass token auth — identity is the provider signature, not a Bearer token.
      // The raw body string must be preserved for HMAC verification; do not re-serialize parsed JSON.
      if (request.method === "POST" && urlParts[0] === "webhooks" && urlParts[1]) {
        const providerCode = urlParts[1];
        const rawBody = await readRaw(request);
        const headers = extractHeaders(request, ["x-timestamp", "x-signature", "content-type"]);
        const result = this.api.postWebhook(providerCode, rawBody, { headers });
        writeJson(response, 202, result);
        return;
      }

      const context = this.context(request);
      const body = await readJson(request);
      const result = await this.route(request.method ?? "GET", request.url ?? "/", body, context);
      writeJson(response, result.statusCode, result.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      const isIdempotencyConflict =
        error instanceof Error && error.message.includes("Idempotency key reused");
      const statusCode = isIdempotencyConflict
        ? 409
        : error instanceof HttpError
          ? error.statusCode
          : 500;
      const code: GranvilleErrorCode = isIdempotencyConflict
        ? "IDEMPOTENCY_CONFLICT"
        : error instanceof HttpError
          ? error.code
          : "INTERNAL_ERROR";
      writeJson(response, statusCode, { error: { code, message } });
    }
  }

  async route(
    method: string,
    url: string,
    body: Record<string, unknown>,
    context: HttpContext,
  ): Promise<{ statusCode: number; body: unknown }> {
    const parsed = new URL(url, "http://granville.local");
    const path = parsed.pathname;
    const parts = path.split("/").filter(Boolean);
    const query = parsed.searchParams;

    if (method === "POST" && path === "/auth/login") {
      const token = String(body.token ?? "");
      if (!token) throw new HttpError(400, "token is required");
      const principal = authenticate(`Bearer ${token}`);
      const role = principalRole(principal);
      return { statusCode: 200, body: { accessToken: token, role, id: principal.id } };
    }
    if (method === "GET" && path === "/auth/me") {
      return {
        statusCode: 200,
        body: { id: context.principal.id, role: principalRole(context.principal) },
      };
    }
    if (method === "POST" && path === "/customers") {
      requireRole(context, "customer:write");
      return {
        statusCode: 201,
        body: this.api.postCustomer(asObject(body), context),
      };
    }
    if (method === "GET" && parts[0] === "customers" && parts[1]) {
      requireRole(context, "customer:read");
      return { statusCode: 200, body: required(this.api.getCustomer(parts[1])) };
    }
    if (method === "PATCH" && parts[0] === "customers" && parts[1]) {
      requireRole(context, "customer:write");
      const customer = required(this.api.getCustomer(parts[1]));
      const metadata = asObject(asObject(body).metadata);
      const updated = this.api.store.updateCustomer(customer.id, {
        metadata: { ...customer.metadata, ...metadata },
      });
      this.api.store.audit("service", "customer.updated", "customer", customer.id);
      return { statusCode: 200, body: updated };
    }
    if (method === "POST" && path === "/payment-accounts") {
      requireRole(context, "payment:write");
      return {
        statusCode: 201,
        body: this.api.postPaymentAccount(asObject(body), context),
      };
    }
    if (method === "GET" && path === "/payment-accounts") {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: this.api.listPaymentAccounts() };
    }
    if (method === "GET" && parts[0] === "payment-accounts" && parts[1]) {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: required(this.api.getPaymentAccount(parts[1])) };
    }
    if (method === "POST" && path === "/payments") {
      requireRole(context, "payment:write");
      return { statusCode: 201, body: this.api.postPayment(asObject(body), context) };
    }
    if (method === "GET" && path === "/payments") {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: this.api.listPayments() };
    }
    if (method === "POST" && parts[0] === "payments" && parts[1] && parts[2] === "submit") {
      requireRole(context, "payment:write");
      return { statusCode: 202, body: await this.api.submitPayment(parts[1]) };
    }
    if (method === "POST" && parts[0] === "payments" && parts[1] && parts[2] === "cancel") {
      requireRole(context, "payment:write");
      return { statusCode: 200, body: this.api.cancelPayment(parts[1], String(body.reason ?? "")) };
    }
    if (method === "POST" && parts[0] === "payments" && parts[1] && parts[2] === "retry") {
      requireRole(context, "payment:write");
      return { statusCode: 202, body: this.api.retryPayment(parts[1]) };
    }
    if (method === "POST" && parts[0] === "payments" && parts[1] && parts[2] === "approve") {
      requireRole(context, "payment:write");
      return {
        statusCode: 202,
        body: await this.api.approvePayment(
          parts[1],
          context.principal.id,
          body.note ? String(body.note) : undefined,
        ),
      };
    }
    if (method === "POST" && parts[0] === "payments" && parts[1] && parts[2] === "reject") {
      requireRole(context, "payment:write");
      return {
        statusCode: 200,
        body: this.api.rejectPayment(
          parts[1],
          context.principal.id,
          body.note ? String(body.note) : undefined,
        ),
      };
    }
    if (method === "GET" && parts[0] === "payments" && parts[1] && !parts[2]) {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: required(this.api.getPayment(parts[1])) };
    }
    if (method === "GET" && parts[0] === "payments" && parts[1] && parts[2] === "status") {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: required(this.api.getPaymentStatus(parts[1])) };
    }
    if (method === "POST" && path === "/reconciliation/runs") {
      requireRole(context, "reconciliation:write");
      return {
        statusCode: 202,
        body: this.api.postReconciliationRun({
          from: body.from ? String(body.from) : undefined,
          to: body.to ? String(body.to) : undefined,
        }),
      };
    }
    if (method === "GET" && path === "/reconciliation/exceptions") {
      requireRole(context, "reconciliation:read");
      return {
        statusCode: 200,
        body: this.api.getReconciliationExceptions({ status: query.get("status") ?? undefined }),
      };
    }
    if (method === "GET" && path === "/admin/audit-events") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.getAuditEvents() };
    }
    if (method === "GET" && path === "/admin/customers") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetCustomers() };
    }
    if (method === "GET" && path === "/admin/payment-accounts") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetPaymentAccounts() };
    }
    if (method === "GET" && path === "/admin/payments") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetPayments() };
    }
    if (method === "GET" && path === "/admin/payment-attempts") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetPaymentAttempts() };
    }
    if (method === "GET" && path === "/admin/providers") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminListProviders() };
    }
    if (method === "GET" && path === "/admin/provider-transactions") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetProviderTransactions() };
    }
    if (method === "GET" && path === "/admin/webhook-events") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetWebhookEvents() };
    }
    if (method === "GET" && path === "/admin/ledger-postings") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetLedgerPostings() };
    }
    if (method === "GET" && path === "/admin/reconciliation/runs") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.adminGetReconciliationRuns() };
    }
    if (method === "GET" && path === "/admin/reconciliation/exceptions") {
      requireRole(context, "admin:read");
      return {
        statusCode: 200,
        body: this.api.adminGetReconciliationExceptions({
          status: query.get("status") ?? undefined,
        }),
      };
    }
    if (method === "POST" && path === "/admin/reconciliation/statements") {
      requireRole(context, "admin:write");
      const lines = Array.isArray(body.lines) ? body.lines : [];
      return { statusCode: 200, body: this.api.ingestProviderStatement(lines) };
    }
    if (method === "POST" && path === "/admin/reconciliation/aging") {
      requireRole(context, "admin:write");
      return { statusCode: 200, body: this.api.adminRunAgingPass() };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "reconciliation" &&
      parts[2] === "exceptions" &&
      parts[3] &&
      parts[4] === "ignore"
    ) {
      requireRole(context, "admin:write");
      const ignoredBy = String(body.ignoredBy ?? context.principal.id);
      const note = body.note ? String(body.note) : undefined;
      return { statusCode: 200, body: this.api.adminIgnoreException(parts[3], ignoredBy, note) };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "webhooks" &&
      parts[2] &&
      parts[3] === "retry"
    ) {
      requireRole(context, "admin:write");
      return { statusCode: 200, body: this.api.adminRetryWebhook(parts[2]) };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "ledger-postings" &&
      parts[2] &&
      parts[3] === "retry"
    ) {
      requireRole(context, "admin:write");
      return { statusCode: 200, body: await this.api.adminRetryLedgerPosting(parts[2]) };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "reconciliation" &&
      parts[2] === "exceptions" &&
      parts[3] &&
      parts[4] === "resolve"
    ) {
      requireRole(context, "admin:write");
      const resolvedBy = String(body.resolvedBy ?? context.principal.id);
      const note = body.note ? String(body.note) : undefined;
      return { statusCode: 200, body: this.api.adminResolveException(parts[3], resolvedBy, note) };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "providers" &&
      parts[2] &&
      parts[3] === "disable"
    ) {
      requireRole(context, "admin:write");
      return { statusCode: 200, body: this.api.adminDisableProvider(parts[2]) };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "providers" &&
      parts[2] &&
      parts[3] === "enable"
    ) {
      requireRole(context, "admin:write");
      return { statusCode: 200, body: this.api.adminEnableProvider(parts[2]) };
    }
    if (method === "GET" && path === "/admin/metrics") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.metricsSnapshot() };
    }
    if (method === "GET" && path === "/admin/reports/payment-history") {
      requireRole(context, "admin:read");
      return {
        statusCode: 200,
        body: this.api.reportPaymentHistory({
          from: query.get("from") ?? undefined,
          to: query.get("to") ?? undefined,
          status: query.get("status") ?? undefined,
        }),
      };
    }
    if (method === "GET" && path === "/admin/reports/audit-export") {
      requireRole(context, "admin:read");
      const ndjson = this.api.reportAuditExport({
        from: query.get("from") ?? undefined,
        to: query.get("to") ?? undefined,
      });
      return { statusCode: 200, body: ndjson };
    }
    if (method === "GET" && path === "/admin/reports/settlement") {
      requireRole(context, "admin:read");
      return {
        statusCode: 200,
        body: this.api.reportSettlement({
          from: query.get("from") ?? undefined,
          to: query.get("to") ?? undefined,
        }),
      };
    }
    if (method === "GET" && path === "/admin/reports/compliance-payments") {
      requireRole(context, "admin:read");
      return {
        statusCode: 200,
        body: this.api.reportCompliancePayments({
          from: query.get("from") ?? undefined,
          to: query.get("to") ?? undefined,
        }),
      };
    }
    if (method === "GET" && path === "/admin/routing-rules") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.listRoutingRules() };
    }
    if (
      method === "GET" &&
      parts[0] === "admin" &&
      parts[1] === "routing-rules" &&
      parts[2] &&
      !parts[3]
    ) {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: required(this.api.getRoutingRule(parts[2])) };
    }
    if (method === "POST" && path === "/admin/routing-rules") {
      requireRole(context, "admin:write");
      return {
        statusCode: 201,
        body: this.api.createRoutingRule({
          name: String(body.name ?? ""),
          description: body.description ? String(body.description) : undefined,
          priority: body.priority !== undefined ? Number(body.priority) : undefined,
          conditions: asObject(body.conditions),
          outcome: asObject(body.outcome),
        }),
      };
    }
    if (
      method === "PATCH" &&
      parts[0] === "admin" &&
      parts[1] === "routing-rules" &&
      parts[2] &&
      !parts[3]
    ) {
      requireRole(context, "admin:write");
      return {
        statusCode: 200,
        body: this.api.updateRoutingRule(parts[2], {
          name: body.name !== undefined ? String(body.name) : undefined,
          description: body.description !== undefined ? String(body.description) : undefined,
          priority: body.priority !== undefined ? Number(body.priority) : undefined,
          active: body.active !== undefined ? Boolean(body.active) : undefined,
          conditions: body.conditions !== undefined ? asObject(body.conditions) : undefined,
          outcome: body.outcome !== undefined ? asObject(body.outcome) : undefined,
        }),
      };
    }
    if (
      method === "POST" &&
      parts[0] === "admin" &&
      parts[1] === "routing-rules" &&
      parts[2] &&
      parts[3] === "deactivate"
    ) {
      requireRole(context, "admin:write");
      return { statusCode: 200, body: this.api.deactivateRoutingRule(parts[2]) };
    }
    if (method === "POST" && path === "/admin/notes") {
      requireRole(context, "admin:write");
      const resourceType = String(body.resourceType ?? "");
      const resourceId = String(body.resourceId ?? "");
      const note = String(body.note ?? "");
      if (!resourceType || !resourceId || !note) {
        throw new HttpError(400, "resourceType, resourceId, and note are required");
      }
      return {
        statusCode: 201,
        body: this.api.adminAddNote(resourceType, resourceId, note, context.principal.id),
      };
    }

    if (method === "GET" && path === "/beneficiaries") {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: this.api.listBeneficiaries() };
    }
    if (method === "POST" && path === "/beneficiaries") {
      requireRole(context, "payment:write");
      return {
        statusCode: 201,
        body: this.api.createBeneficiary(
          asObject(body) as Parameters<typeof this.api.createBeneficiary>[0],
        ),
      };
    }
    if (method === "PATCH" && parts[0] === "beneficiaries" && parts[1] && !parts[2]) {
      requireRole(context, "payment:write");
      return { statusCode: 200, body: this.api.updateBeneficiary(parts[1], asObject(body)) };
    }
    if (method === "DELETE" && parts[0] === "beneficiaries" && parts[1] && !parts[2]) {
      requireRole(context, "payment:write");
      this.api.deleteBeneficiary(parts[1]);
      return { statusCode: 204, body: null };
    }

    throw new HttpError(404, `No route for ${method} ${path}`);
  }

  context(request: IncomingMessage): HttpContext {
    const principal = authenticate(request.headers.authorization);
    return {
      principal,
      idempotencyKey: header(request, "idempotency-key"),
    };
  }
}

export function createGranvilleServer(controllers = new GranvilleHttpControllers()) {
  return createServer((request, response) => {
    void controllers.handle(request, response);
  });
}

function authenticate(authorization?: string): Principal {
  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }
  const token = authorization.slice("Bearer ".length);
  if (token === "dev-admin") {
    return {
      id: "dev-admin",
      roles: [
        "customer:read",
        "customer:write",
        "payment:read",
        "payment:write",
        "webhook:write",
        "reconciliation:read",
        "reconciliation:write",
        "admin:read",
        "admin:write",
      ],
    };
  }
  if (token === "dev-operator") {
    return {
      id: "dev-operator",
      roles: ["customer:read", "payment:read", "reconciliation:read"],
    };
  }
  throw new HttpError(403, "Unknown principal");
}

function principalRole(principal: Principal): string {
  if (principal.roles.includes("admin:write")) return "admin";
  if (principal.roles.includes("reconciliation:write")) return "ops";
  if (principal.roles.includes("admin:read")) return "compliance";
  return "customer";
}

function requireRole(context: HttpContext, role: string): void {
  if (!context.principal.roles.includes(role)) {
    throw new HttpError(403, `Missing role ${role}`);
  }
}

async function readRaw(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readRaw(request);
  if (!raw) return {};
  return asObject(JSON.parse(raw));
}

function extractHeaders(request: IncomingMessage, names: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of names) {
    const val = request.headers[name];
    if (val) result[name] = Array.isArray(val) ? val[0] : val;
  }
  return result;
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function required<T>(value: T | undefined): T {
  if (!value) {
    throw new HttpError(404, "Resource not found");
  }
  return value;
}

function header(request: IncomingMessage, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}
