import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import { GranvilleHttpControllers } from "../../apps/api/src/http.ts";

async function makeCompletedFlow(api: GranvilleApi, suffix: string) {
  const customer = api.postCustomer(
    { legalName: `Admin User ${suffix}`, countryCode: "GB" },
    { idempotencyKey: `admin-customer-${suffix}` },
  );
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB" },
    { idempotencyKey: `admin-account-${suffix}` },
  );
  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "5000", asset: "GBP/2" },
    { idempotencyKey: `admin-payment-${suffix}` },
  );
  const completed = await api.submitPayment(payment.id);
  return { customer, account, payment: completed };
}

// --- Admin read views ---

test("M7: admin read views return correct entity lists", async () => {
  const api = new GranvilleApi();
  const { customer, account, payment } = await makeCompletedFlow(api, "views");

  assert.ok(api.adminGetCustomers().some((c) => c.id === customer.id));
  assert.ok(api.adminGetPaymentAccounts().some((a) => a.id === account.id));
  assert.ok(api.adminGetPayments().some((p) => p.id === payment.id));
  assert.ok(api.adminGetPaymentAttempts().length >= 1);
  assert.ok(api.adminGetProviderTransactions().length >= 1);
  assert.ok(api.adminGetLedgerPostings().length >= 1);
});

test("M7: admin webhook-events list includes queued webhooks", async () => {
  const api = new GranvilleApi();
  const { payment } = await makeCompletedFlow(api, "wh-list");

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  const ref = attempt?.providerReference ?? attempt?.providerTransactionId ?? "dummy-ref";
  api.postWebhook("mock-emi", JSON.stringify({ providerReference: ref, status: "completed" }));

  const events = api.adminGetWebhookEvents();
  assert.ok(events.length >= 1);
  assert.ok(events.some((e) => e.processingStatus === "queued"));
});

// --- Webhook retry ---

test("M7: adminRetryWebhook re-queues a failed webhook and emits audit event", async () => {
  const api = new GranvilleApi();

  // Post a webhook that will be ignored (unrecognised reference)
  const result = api.postWebhook("mock-emi", JSON.stringify({ providerReference: "unknown-xyz" }));
  api.drainWebhooks();

  const ignored = api.store.webhooks.get(result.id);
  assert.equal(ignored?.processingStatus, "ignored");

  const auditsBefore = api.getAuditEvents().length;

  const retried = api.adminRetryWebhook(result.id);
  assert.equal(retried.status, "queued", "retry should re-queue the webhook");

  const auditsAfter = api.getAuditEvents().length;
  assert.ok(auditsAfter > auditsBefore, "retry should emit an audit event");

  const retryAudit = api
    .getAuditEvents()
    .find((e) => e.action === "admin.webhook.retry_requested" && e.resourceId === result.id);
  assert.ok(retryAudit, "audit event for retry should reference the webhook id");
});

test("M7: adminRetryWebhook rejects a webhook that is not failed/ignored", async () => {
  const api = new GranvilleApi();
  const result = api.postWebhook("mock-emi", JSON.stringify({ providerReference: "ref-queued" }));
  // Still queued — should not be retryable
  assert.throws(() => api.adminRetryWebhook(result.id), /cannot be retried from status/);
});

// --- Ledger posting retry ---

test("M7: adminRetryLedgerPosting replays a dead-lettered posting and emits audit event", async () => {
  const api = new GranvilleApi();
  await makeCompletedFlow(api, "ledger-retry");

  const posting = [...api.store.ledgerQueue.values()][0];
  assert.ok(posting);

  // Force it to dead_lettered
  api.store.ledgerQueue.set(posting.id, {
    ...posting,
    status: "dead_lettered",
    retryCount: 3,
    lastError: "simulated failure",
  });

  const auditsBefore = api.getAuditEvents().length;
  const result = await api.adminRetryLedgerPosting(posting.id);
  assert.equal(result.status, "posted", "retry should successfully re-post");

  const auditsAfter = api.getAuditEvents().length;
  assert.ok(auditsAfter > auditsBefore);

  const retryAudit = api
    .getAuditEvents()
    .find((e) => e.action === "admin.ledger_posting.retry_requested");
  assert.ok(retryAudit);
});

// --- Reconciliation exception resolution ---

test("M7: adminResolveException marks exception resolved and emits audit event", async () => {
  const api = new GranvilleApi();
  const { payment } = await makeCompletedFlow(api, "resolve-ex");

  // Create an exception to resolve
  api.store.providerTransactions.clear();
  api.postReconciliationRun();

  const exception = api.getReconciliationExceptions().find((e) => e.paymentOrderId === payment.id);
  assert.ok(exception, "should have an open exception");
  assert.equal(exception.status, "open");

  const auditsBefore = api.getAuditEvents().length;
  const resolved = api.adminResolveException(
    exception.id,
    "ops-engineer-1",
    "Confirmed false alarm",
  );
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.resolvedBy, "ops-engineer-1");
  assert.equal(resolved.manualNote, "Confirmed false alarm");
  assert.ok(resolved.resolvedAt);

  const auditsAfter = api.getAuditEvents().length;
  assert.ok(auditsAfter > auditsBefore);

  const resolveAudit = api
    .getAuditEvents()
    .find(
      (e) =>
        e.action === "admin.reconciliation_exception.resolved" && e.resourceId === exception.id,
    );
  assert.ok(resolveAudit);
  assert.equal(resolveAudit.payload.resolvedBy, "ops-engineer-1");
});

// --- Provider disable ---

test("M7: adminDisableProvider sets health to disabled and emits audit event", async () => {
  const api = new GranvilleApi();

  const healthBefore = api.store.providerHealth.get(api.store.getMockProviderBinding().id);
  assert.equal(healthBefore?.status, "healthy");

  const auditsBefore = api.getAuditEvents().length;
  api.adminDisableProvider("mock-emi");

  const healthAfter = api.store.providerHealth.get(api.store.getMockProviderBinding().id);
  assert.equal(healthAfter?.status, "disabled");
  assert.equal(healthAfter?.reason, "disabled_by_admin");

  const auditsAfter = api.getAuditEvents().length;
  assert.ok(auditsAfter > auditsBefore);

  const disableAudit = api.getAuditEvents().find((e) => e.action === "admin.provider.disabled");
  assert.ok(disableAudit);
  assert.equal(disableAudit.payload.adapterKey, "mock-emi");
});

// --- Manual note ---

test("M7: adminAddNote creates audit event with note attached to entity", async () => {
  const api = new GranvilleApi();
  const { payment } = await makeCompletedFlow(api, "note");

  const auditsBefore = api.getAuditEvents().length;
  const noteEvent = api.adminAddNote(
    "payment_order",
    payment.id,
    "Flagged for manual review",
    "ops-user-42",
  );
  assert.ok(noteEvent.id);
  assert.equal(noteEvent.action, "admin.note.added");
  assert.equal(noteEvent.resourceType, "payment_order");
  assert.equal(noteEvent.resourceId, payment.id);
  assert.equal(noteEvent.payload.note, "Flagged for manual review");
  assert.equal(noteEvent.payload.actorId, "ops-user-42");

  assert.equal(api.getAuditEvents().length, auditsBefore + 1);
});

// --- Every privileged admin action creates an audit event ---

test("M7: all privileged admin actions are audited", async () => {
  const api = new GranvilleApi();
  await makeCompletedFlow(api, "audit-all");

  // Retry webhook
  const wh = api.postWebhook("mock-emi", JSON.stringify({ providerReference: "dummy-audit" }));
  api.drainWebhooks();
  api.adminRetryWebhook(wh.id);

  // Retry ledger posting (force to dead_lettered first)
  const posting = [...api.store.ledgerQueue.values()][0];
  assert.ok(posting);
  api.store.ledgerQueue.set(posting.id, { ...posting, status: "dead_lettered", retryCount: 3 });
  await api.adminRetryLedgerPosting(posting.id);

  // Disable provider
  api.adminDisableProvider("mock-emi");

  // Add note
  api.adminAddNote("payment_order", [...api.store.paymentOrders.keys()][0], "test note");

  const adminAudits = api.getAuditEvents().filter((e) => e.action.startsWith("admin."));
  assert.ok(adminAudits.length >= 4, `expected >= 4 admin audit events, got ${adminAudits.length}`);
});

// --- HTTP routes ---

test("M7: HTTP admin routes require admin:read role", async () => {
  const controllers = new GranvilleHttpControllers();

  const operatorCtx = {
    principal: {
      id: "dev-operator",
      roles: ["customer:read", "payment:read", "reconciliation:read"],
    },
  };

  await assert.rejects(
    () => controllers.route("GET", "/admin/payments", {}, operatorCtx),
    /Missing role admin:read/,
  );
});

test("M7: HTTP admin:write routes reject admin:read-only principal", async () => {
  const controllers = new GranvilleHttpControllers();

  const readOnlyAdminCtx = {
    principal: { id: "read-only-admin", roles: ["admin:read"] },
  };

  await assert.rejects(
    () => controllers.route("POST", "/admin/notes", {}, readOnlyAdminCtx),
    /Missing role admin:write/,
  );
});

test("M7: GET /admin/reconciliation/runs returns run list", async () => {
  const controllers = new GranvilleHttpControllers();
  await makeCompletedFlow(controllers.api, "http-runs");
  controllers.api.postReconciliationRun();

  const adminCtx = {
    principal: {
      id: "dev-admin",
      roles: ["admin:read", "admin:write", "reconciliation:read", "reconciliation:write"],
    },
  };

  const result = await controllers.route("GET", "/admin/reconciliation/runs", {}, adminCtx);
  assert.equal(result.statusCode, 200);
  assert.ok(Array.isArray(result.body));
  assert.ok((result.body as unknown[]).length >= 1);
});

test("M7: POST /admin/notes validates required fields", async () => {
  const controllers = new GranvilleHttpControllers();
  const adminCtx = {
    principal: { id: "dev-admin", roles: ["admin:read", "admin:write"] },
  };

  await assert.rejects(
    () => controllers.route("POST", "/admin/notes", { resourceType: "payment_order" }, adminCtx),
    /required/,
  );
});

// --- Provider enable ---

const adminCtx = {
  principal: { id: "dev-admin", roles: ["admin:read", "admin:write"] },
};

test("M7: adminEnableProvider restores health to healthy and emits audit event", async () => {
  const api = new GranvilleApi();

  api.adminDisableProvider("mock-emi");
  const healthDisabled = api.store.providerHealth.get(api.store.getMockProviderBinding().id);
  assert.equal(healthDisabled?.status, "disabled");

  const auditsBefore = api.getAuditEvents().length;
  api.adminEnableProvider("mock-emi");

  const healthAfter = api.store.providerHealth.get(api.store.getMockProviderBinding().id);
  assert.equal(healthAfter?.status, "healthy");
  assert.equal(healthAfter?.reason, "enabled_by_admin");

  const auditsAfter = api.getAuditEvents().length;
  assert.ok(auditsAfter > auditsBefore);

  const enableAudit = api.getAuditEvents().find((e) => e.action === "admin.provider.enabled");
  assert.ok(enableAudit);
  assert.equal(enableAudit.payload.adapterKey, "mock-emi");
});

test("M7: adminEnableProvider on an already-healthy provider is idempotent", async () => {
  const api = new GranvilleApi();

  const health = api.store.providerHealth.get(api.store.getMockProviderBinding().id);
  assert.equal(health?.status, "healthy");

  assert.doesNotThrow(() => api.adminEnableProvider("mock-emi"));
  const after = api.store.providerHealth.get(api.store.getMockProviderBinding().id);
  assert.equal(after?.status, "healthy");
});

// --- Provider list ---

test("M7: adminListProviders returns all bindings with health status", async () => {
  const api = new GranvilleApi();

  const providers = api.adminListProviders();
  assert.ok(providers.length >= 2, "should have at least mock-emi and mock-bank");

  for (const p of providers) {
    assert.ok(p.bindingId);
    assert.ok(p.adapterKey);
    assert.ok(typeof p.failureCount === "number");
    assert.ok(p.status);
  }

  const emi = providers.find((p) => p.adapterKey === "mock-emi");
  assert.ok(emi);
  assert.equal(emi.status, "healthy");
});

test("M7: adminListProviders reflects disabled status after adminDisableProvider", async () => {
  const api = new GranvilleApi();
  api.adminDisableProvider("mock-emi");

  const providers = api.adminListProviders();
  const emi = providers.find((p) => p.adapterKey === "mock-emi");
  assert.ok(emi);
  assert.equal(emi.status, "disabled");
  assert.equal(emi.reason, "disabled_by_admin");
});

test("M7: GET /admin/providers returns provider list", async () => {
  const controllers = new GranvilleHttpControllers();

  const result = await controllers.route("GET", "/admin/providers", {}, adminCtx);
  assert.equal(result.statusCode, 200);
  assert.ok(Array.isArray(result.body));
  assert.ok((result.body as unknown[]).length >= 2);
  const [first] = result.body as Array<Record<string, unknown>>;
  assert.ok(first.adapterKey);
  assert.ok(first.status);
});

test("M7: POST /admin/providers/:id/enable enables a disabled provider via HTTP", async () => {
  const controllers = new GranvilleHttpControllers();
  controllers.api.adminDisableProvider("mock-emi");

  const result = await controllers.route("POST", "/admin/providers/mock-emi/enable", {}, adminCtx);
  assert.equal(result.statusCode, 200);

  const binding = controllers.api.store.getMockProviderBinding();
  const health = controllers.api.store.providerHealth.get(binding.id);
  assert.equal(health?.status, "healthy");
});

test("M7: POST /admin/providers/:id/disable and enable require admin:write", async () => {
  const controllers = new GranvilleHttpControllers();
  const readOnly = { principal: { id: "ro", roles: ["admin:read"] } };

  await assert.rejects(
    () => controllers.route("POST", "/admin/providers/mock-emi/disable", {}, readOnly),
    /Missing role admin:write/,
  );
  await assert.rejects(
    () => controllers.route("POST", "/admin/providers/mock-emi/enable", {}, readOnly),
    /Missing role admin:write/,
  );
});
