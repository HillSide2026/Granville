import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

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

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class GranvilleHttpControllers {
  api: GranvilleApi;

  constructor(api = new GranvilleApi()) {
    this.api = api;
  }

  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const context = this.context(request);
      const body = await readJson(request);
      const result = await this.route(request.method ?? "GET", request.url ?? "/", body, context);
      writeJson(response, result.statusCode, result.body);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      const message = error instanceof Error ? error.message : "Internal server error";
      writeJson(response, statusCode, { error: message });
    }
  }

  async route(
    method: string,
    url: string,
    body: Record<string, unknown>,
    context: HttpContext,
  ): Promise<{ statusCode: number; body: unknown }> {
    const path = new URL(url, "http://granville.local").pathname;
    const parts = path.split("/").filter(Boolean);

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
      const updated = { ...customer, metadata: { ...customer.metadata, ...metadata } };
      this.api.store.customers.set(customer.id, updated);
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
    if (method === "GET" && parts[0] === "payment-accounts" && parts[1]) {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: required(this.api.getPaymentAccount(parts[1])) };
    }
    if (method === "POST" && path === "/payments") {
      requireRole(context, "payment:write");
      return { statusCode: 201, body: this.api.postPayment(asObject(body), context) };
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
    if (method === "GET" && parts[0] === "payments" && parts[1] && !parts[2]) {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: required(this.api.getPayment(parts[1])) };
    }
    if (method === "GET" && parts[0] === "payments" && parts[1] && parts[2] === "status") {
      requireRole(context, "payment:read");
      return { statusCode: 200, body: required(this.api.getPaymentStatus(parts[1])) };
    }
    if (method === "POST" && parts[0] === "webhooks" && parts[1]) {
      requireRole(context, "webhook:write");
      return { statusCode: 202, body: this.api.postWebhook(parts[1], JSON.stringify(body)) };
    }
    if (method === "POST" && path === "/reconciliation/runs") {
      requireRole(context, "reconciliation:write");
      return { statusCode: 202, body: this.api.postReconciliationRun() };
    }
    if (method === "GET" && path === "/reconciliation/exceptions") {
      requireRole(context, "reconciliation:read");
      return { statusCode: 200, body: this.api.getReconciliationExceptions() };
    }
    if (method === "GET" && path === "/admin/audit-events") {
      requireRole(context, "admin:read");
      return { statusCode: 200, body: this.api.getAuditEvents() };
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

function requireRole(context: HttpContext, role: string): void {
  if (!context.principal.roles.includes(role)) {
    throw new HttpError(403, `Missing role ${role}`);
  }
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  return asObject(JSON.parse(Buffer.concat(chunks).toString("utf8")));
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
