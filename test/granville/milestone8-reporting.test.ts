import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import { GranvilleHttpControllers } from "../../apps/api/src/http.ts";

const adminCtx = {
  principal: { id: "dev-admin", roles: ["admin:read", "admin:write"] },
};

async function makeFlow(api: GranvilleApi, suffix: string, amount = "2500") {
  const customer = api.postCustomer(
    { legalName: `Report User ${suffix}`, countryCode: "GB" },
    { idempotencyKey: `rpt-customer-${suffix}` },
  );
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB" },
    { idempotencyKey: `rpt-account-${suffix}` },
  );
  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount, asset: "GBP/2" },
    { idempotencyKey: `rpt-payment-${suffix}` },
  );
  const completed = await api.submitPayment(payment.id);
  return { customer, account, payment: completed };
}

// --- Payment history ---

test("M8: payment history returns all payments without filter", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "hist-a");
  await makeFlow(api, "hist-b");

  const history = api.reportPaymentHistory({});
  assert.equal(history.length, 2);
  assert.ok(history.every((r) => r.paymentOrderId && r.amount && r.asset));
});

test("M8: payment history filter by status", async () => {
  const api = new GranvilleApi();
  // Create a cancelled payment (cancel before submission so it's still cancellable)
  const cancelCustomer = api.postCustomer({ legalName: "Cancel User", countryCode: "GB" });
  const cancelAccount = api.postPaymentAccount({ customerId: cancelCustomer.id });
  const cancelPayment = api.postPayment({
    customerId: cancelCustomer.id,
    paymentAccountId: cancelAccount.id,
    amount: "500",
    asset: "GBP/2",
  });
  api.cancelPayment(cancelPayment.id, "test");
  // Create a completed payment
  await makeFlow(api, "status-b");

  const completed = api.reportPaymentHistory({ status: "completed" });
  const cancelled = api.reportPaymentHistory({ status: "cancelled" });
  assert.equal(completed.length, 1);
  assert.equal(cancelled.length, 1);
});

test("M8: payment history filter by date range", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "range-a");

  const pastCutoff = new Date(Date.now() + 60_000).toISOString();
  const nothingAfter = api.reportPaymentHistory({ from: pastCutoff });
  assert.equal(nothingAfter.length, 0);

  const futureCutoff = new Date(Date.now() - 60_000).toISOString();
  const allBefore = api.reportPaymentHistory({ from: futureCutoff });
  assert.equal(allBefore.length, 1);
});

test("M8: payment history includes attempt count and provider binding", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "detail");

  const [record] = api.reportPaymentHistory({});
  assert.ok(record);
  assert.equal(record.attemptCount, 1);
  assert.ok(record.providerBindingId, "should include the provider binding id");
  assert.ok(record.completedAt, "completed payment should have completedAt");
});

// --- Audit export ---

test("M8: audit export returns newline-delimited JSON", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "audit-exp");

  const ndjson = api.reportAuditExport({});
  assert.ok(ndjson.length > 0);

  const lines = ndjson.split("\n").filter(Boolean);
  assert.ok(lines.length >= 4, "should have multiple audit lines");
  for (const line of lines) {
    const parsed = JSON.parse(line);
    assert.ok(parsed.id && parsed.action && parsed.createdAt);
  }
});

test("M8: audit export respects date range filter", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "audit-range");

  const future = new Date(Date.now() + 60_000).toISOString();
  const empty = api.reportAuditExport({ from: future });
  assert.equal(empty.trim(), "");
});

// --- Settlement summary ---

test("M8: settlement summary groups completed payments by provider and asset", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "settle-a", "1000");
  await makeFlow(api, "settle-b", "2000");

  const summary = api.reportSettlement({});
  assert.ok(summary.length >= 1);

  const gbpLine = summary.find((s) => s.asset === "GBP/2");
  assert.ok(gbpLine, "should have a GBP/2 settlement line");
  assert.equal(gbpLine.completedCount, 2);
  assert.equal(gbpLine.totalAmount, "3000");
  assert.equal(gbpLine.failedCount, 0);
});

test("M8: settlement summary counts failed payments separately", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "settle-ok");
  const { payment } = await makeFlow(api, "settle-fail");
  api.store.updatePaymentOrder(payment.id, { status: "failed" });

  const summary = api.reportSettlement({});
  const line = summary.find((s) => s.asset === "GBP/2");
  assert.ok(line);
  assert.equal(line.completedCount, 1);
  assert.equal(line.failedCount, 1);
});

test("M8: settlement summary is empty when no payments match range", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "settle-range");

  const future = new Date(Date.now() + 60_000).toISOString();
  const empty = api.reportSettlement({ from: future });
  assert.equal(empty.length, 0);
});

// --- Metrics snapshot ---

test("M8: metrics snapshot reflects current platform state", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "metrics-a");
  await makeFlow(api, "metrics-b");

  const metrics = api.metricsSnapshot();
  assert.ok(typeof metrics.paymentFailureRate === "number");
  assert.ok(typeof metrics.webhookFailureCount === "number");
  assert.ok(typeof metrics.queueBacklog === "number");
  assert.ok(typeof metrics.ledgerPostingFailures === "number");
  assert.ok(typeof metrics.reconciliationExceptionCount === "number");
  assert.ok(typeof metrics.providerOutageStatus === "object");
  assert.ok(metrics.calculatedAt);

  assert.equal(metrics.paymentFailureRate, 0, "no failures — rate should be 0");
  assert.ok("mock-emi" in metrics.providerOutageStatus);
  assert.equal(metrics.providerOutageStatus["mock-emi"], "healthy");
});

test("M8: metrics failure rate rises when payments fail", async () => {
  const api = new GranvilleApi();
  await makeFlow(api, "rate-ok");
  const { payment } = await makeFlow(api, "rate-fail");
  api.store.updatePaymentOrder(payment.id, { status: "failed" });

  const metrics = api.metricsSnapshot();
  assert.ok(metrics.paymentFailureRate > 0, "failure rate should be > 0");
  assert.equal(metrics.paymentFailureRate, 0.5);
});

test("M8: metrics queue backlog counts pending provider commands and queued webhooks", async () => {
  const api = new GranvilleApi();

  const beforeMetrics = api.metricsSnapshot();
  assert.equal(beforeMetrics.queueBacklog, 0);

  // Create a payment but don't submit (no pending commands yet)
  const customer = api.postCustomer({ legalName: "Backlog User" });
  const account = api.postPaymentAccount({ customerId: customer.id });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "100",
    asset: "GBP/2",
  });
  // Submit which enqueues a provider command, then don't drain
  api.orchestrator.submitPayment(payment.id);

  const afterMetrics = api.metricsSnapshot();
  assert.ok(afterMetrics.queueBacklog >= 1, "pending provider command should add to backlog");
});

test("M8: metrics shows provider disabled after admin disables it", async () => {
  const api = new GranvilleApi();
  api.adminDisableProvider("mock-emi");

  const metrics = api.metricsSnapshot();
  assert.equal(metrics.providerOutageStatus["mock-emi"], "disabled");
});

// --- HTTP routes ---

test("M8: GET /admin/metrics returns metrics object", async () => {
  const controllers = new GranvilleHttpControllers();
  await makeFlow(controllers.api, "http-metrics");

  const result = await controllers.route("GET", "/admin/metrics", {}, adminCtx);
  assert.equal(result.statusCode, 200);
  const body = result.body as Record<string, unknown>;
  assert.ok("paymentFailureRate" in body);
  assert.ok("providerOutageStatus" in body);
  assert.ok("calculatedAt" in body);
});

test("M8: GET /admin/reports/payment-history returns array", async () => {
  const controllers = new GranvilleHttpControllers();
  await makeFlow(controllers.api, "http-history");

  const result = await controllers.route("GET", "/admin/reports/payment-history", {}, adminCtx);
  assert.equal(result.statusCode, 200);
  assert.ok(Array.isArray(result.body));
  assert.ok((result.body as unknown[]).length >= 1);
});

test("M8: GET /admin/reports/payment-history respects ?status= query param", async () => {
  const controllers = new GranvilleHttpControllers();
  await makeFlow(controllers.api, "http-status-filter");

  const completed = await controllers.route(
    "GET",
    "/admin/reports/payment-history?status=completed",
    {},
    adminCtx,
  );
  const failed = await controllers.route(
    "GET",
    "/admin/reports/payment-history?status=failed",
    {},
    adminCtx,
  );
  assert.equal((completed.body as unknown[]).length, 1);
  assert.equal((failed.body as unknown[]).length, 0);
});

test("M8: GET /admin/reports/settlement returns array", async () => {
  const controllers = new GranvilleHttpControllers();
  await makeFlow(controllers.api, "http-settle");

  const result = await controllers.route("GET", "/admin/reports/settlement", {}, adminCtx);
  assert.equal(result.statusCode, 200);
  assert.ok(Array.isArray(result.body));
  assert.ok((result.body as unknown[]).length >= 1);
});

test("M8: report routes require admin:read role", async () => {
  const controllers = new GranvilleHttpControllers();
  const limited = { principal: { id: "ops", roles: ["payment:read"] } };

  await assert.rejects(
    () => controllers.route("GET", "/admin/metrics", {}, limited),
    /Missing role admin:read/,
  );
  await assert.rejects(
    () => controllers.route("GET", "/admin/reports/payment-history", {}, limited),
    /Missing role admin:read/,
  );
});
