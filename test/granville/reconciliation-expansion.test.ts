import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import { GranvilleHttpControllers, createGranvilleServer } from "../../apps/api/src/http.ts";

function buildApi() {
  return new GranvilleApi();
}

async function makeCompletedPayment(api: GranvilleApi, suffix: string) {
  const customer = api.postCustomer(
    { legalName: `Recon Expansion ${suffix}`, countryCode: "GB" },
    { idempotencyKey: `rexp-customer-${suffix}` },
  );
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB" },
    { idempotencyKey: `rexp-account-${suffix}` },
  );
  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "1000", asset: "GBP/2" },
    { idempotencyKey: `rexp-payment-${suffix}` },
  );
  return await api.submitPayment(payment.id);
}

async function withServer(
  fn: (baseUrl: string, token: string) => Promise<void>,
): Promise<void> {
  const controllers = new GranvilleHttpControllers();
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  try {
    await fn(`http://localhost:${port}`, "dev-admin");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

// ── Period-scoped runs ────────────────────────────────────────────────────────

test("period-scoped run: only processes orders within date range", async () => {
  const api = buildApi();
  await makeCompletedPayment(api, "period-scope");

  // Filter to a range before any orders exist
  const result = api.postReconciliationRun({ to: "2000-01-01T00:00:00.000Z" });
  assert.equal(result.exceptionCount, 0, "no orders in range should yield 0 exceptions");

  const run = api.store.reconciliationRuns.get(result.runId)!;
  assert.ok(run, "run should be created");
  const summary = run.summary as Record<string, unknown>;
  assert.equal(summary.paymentOrderCount, 0, "paymentOrderCount should be 0 (none in range)");
});

test("period-scoped run: periodStart/periodEnd populated on ReconciliationRun", () => {
  const api = buildApi();
  const from = "2024-01-01T00:00:00.000Z";
  const to = "2026-12-31T23:59:59.999Z";

  const result = api.postReconciliationRun({ from, to });
  const run = api.store.reconciliationRuns.get(result.runId)!;
  assert.equal(run.periodStart, from);
  assert.equal(run.periodEnd, to);
});

// ── Statement ingestion ───────────────────────────────────────────────────────

test("ingestProviderStatement: creates provider transactions visible to next run", async () => {
  const api = buildApi();
  const binding = api.store.getMockProviderBinding();
  const initialTxnCount = api.store.providerTransactions.size;

  const result = api.ingestProviderStatement([
    {
      providerBindingId: binding.id,
      providerReference: "stmt-ref-001",
      amount: "5000",
      asset: "GBP/2",
      valueDate: new Date().toISOString(),
      description: "Test credit",
    },
  ]);

  assert.equal(result.ingested, 1);
  assert.equal(result.duplicates, 0);
  assert.equal(api.store.providerTransactions.size, initialTxnCount + 1);
});

test("ingestProviderStatement: duplicate providerReference counted, not double-inserted", async () => {
  const api = buildApi();
  const binding = api.store.getMockProviderBinding();

  const first = api.ingestProviderStatement([
    {
      providerBindingId: binding.id,
      providerReference: "stmt-ref-dedup",
      amount: "1000",
      asset: "GBP/2",
      valueDate: new Date().toISOString(),
    },
  ]);
  assert.equal(first.ingested, 1);
  assert.equal(first.duplicates, 0);

  const txnCountAfterFirst = api.store.providerTransactions.size;

  const second = api.ingestProviderStatement([
    {
      providerBindingId: binding.id,
      providerReference: "stmt-ref-dedup",
      amount: "1000",
      asset: "GBP/2",
      valueDate: new Date().toISOString(),
    },
  ]);
  assert.equal(second.ingested, 0);
  assert.equal(second.duplicates, 1);
  assert.equal(api.store.providerTransactions.size, txnCountAfterFirst, "no new txn inserted");
});

// ── Break aging ───────────────────────────────────────────────────────────────

test("aging pass: info → warning after 1 hour", () => {
  const api = buildApi();
  const ex = api.store.createReconciliationException({
    category: "stale_pending_transaction",
    severity: "info",
    description: "Test info exception",
    evidence: {},
  });

  // Backdate to 2 hours ago
  api.store.reconciliationExceptions.set(ex.id, {
    ...api.store.reconciliationExceptions.get(ex.id)!,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  });

  const { escalated } = api.adminRunAgingPass();
  assert.equal(escalated, 1);

  const updated = api.store.reconciliationExceptions.get(ex.id)!;
  assert.equal(updated.severity, "warning");
});

test("aging pass: warning → critical after 24 hours", () => {
  const api = buildApi();
  const ex = api.store.createReconciliationException({
    category: "amount_mismatch",
    severity: "warning",
    description: "Test warning exception",
    evidence: {},
  });

  // Backdate to 25 hours ago
  api.store.reconciliationExceptions.set(ex.id, {
    ...api.store.reconciliationExceptions.get(ex.id)!,
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  });

  const { escalated } = api.adminRunAgingPass();
  assert.equal(escalated, 1);

  const updated = api.store.reconciliationExceptions.get(ex.id)!;
  assert.equal(updated.severity, "critical");
});

test("aging pass: resolved exceptions not escalated", () => {
  const api = buildApi();
  const ex = api.store.createReconciliationException({
    category: "stale_pending_transaction",
    severity: "info",
    description: "Resolved exception should not be aged",
    evidence: {},
  });

  // Backdate and mark resolved
  api.store.reconciliationExceptions.set(ex.id, {
    ...api.store.reconciliationExceptions.get(ex.id)!,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "resolved",
  });

  const { escalated } = api.adminRunAgingPass();
  assert.equal(escalated, 0, "resolved exceptions must not be escalated");

  const updated = api.store.reconciliationExceptions.get(ex.id)!;
  assert.equal(updated.severity, "info", "severity unchanged");
});

// ── Exception ignoring ────────────────────────────────────────────────────────

test("ignoreReconciliationException: status=ignored, ignoredAt/By set", () => {
  const api = buildApi();
  const ex = api.store.createReconciliationException({
    category: "status_mismatch",
    severity: "warning",
    description: "Exception to ignore",
    evidence: {},
  });

  const ignored = api.adminIgnoreException(ex.id, "test-user", "acceptable gap");
  assert.equal(ignored.status, "ignored");
  assert.ok(ignored.ignoredAt, "ignoredAt should be set");
  assert.equal(ignored.ignoredBy, "test-user");
  assert.equal(ignored.manualNote, "acceptable gap");

  // Verify in store
  const stored = api.store.reconciliationExceptions.get(ex.id)!;
  assert.equal(stored.status, "ignored");
});

test("ignored exception not re-escalated by aging pass", () => {
  const api = buildApi();
  const ex = api.store.createReconciliationException({
    category: "stale_pending_transaction",
    severity: "info",
    description: "Ignored exception",
    evidence: {},
  });

  // Backdate to 2 hours ago and mark ignored
  api.store.reconciliationExceptions.set(ex.id, {
    ...api.store.reconciliationExceptions.get(ex.id)!,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "ignored",
  });

  const { escalated } = api.adminRunAgingPass();
  assert.equal(escalated, 0, "ignored exceptions must not be escalated");
});

// ── HTTP: ?status= filter ─────────────────────────────────────────────────────

test("GET /reconciliation/exceptions?status=open returns only open exceptions", async () => {
  const controllers = new GranvilleHttpControllers();
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const base = `http://localhost:${port}`;
  const token = "dev-admin";

  try {
    // Create an open exception
    controllers.api.store.createReconciliationException({
      category: "status_mismatch",
      severity: "warning",
      description: "Open one",
      evidence: {},
    });

    // Create an ignored exception
    const ex2 = controllers.api.store.createReconciliationException({
      category: "amount_mismatch",
      severity: "critical",
      description: "Ignored one",
      evidence: {},
    });
    controllers.api.store.ignoreReconciliationException(ex2.id, "test");

    const allResp = await fetch(`${base}/reconciliation/exceptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const all = await allResp.json() as unknown[];
    assert.ok(all.length >= 2, "should have at least 2 exceptions total");

    const openResp = await fetch(`${base}/reconciliation/exceptions?status=open`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const open = await openResp.json() as Array<{ status: string }>;
    assert.ok(open.length >= 1, "should have at least one open exception");
    assert.ok(open.every((e) => e.status === "open"), "all returned exceptions must be open");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});
