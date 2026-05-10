import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";

function buildApi() {
  return new GranvilleApi();
}

async function makeCompletedPayment(api: GranvilleApi, suffix: string) {
  const customer = api.postCustomer(
    { legalName: `Reconcile User ${suffix}`, countryCode: "GB" },
    { idempotencyKey: `recon-customer-${suffix}` },
  );
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB" },
    { idempotencyKey: `recon-account-${suffix}` },
  );
  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "1000", asset: "GBP/2" },
    { idempotencyKey: `recon-payment-${suffix}` },
  );
  const completed = await api.submitPayment(payment.id);
  return { customer, account, payment: completed };
}

test("M6: clean run has zero exceptions and creates matched records", async () => {
  const api = buildApi();
  await makeCompletedPayment(api, "clean");

  const result = api.postReconciliationRun();
  assert.equal(result.exceptionCount, 0, "clean flow should have no exceptions");

  const records = [...api.store.reconciliationRecords.values()];
  assert.ok(records.length >= 1, "reconciliation records should be created");
  const matched = records.filter((r) => r.matchStatus === "matched");
  assert.ok(matched.length >= 1, "completed payment should produce a matched record");
});

test("M6: missing_provider_transaction — completed order without provider txn", async () => {
  const api = buildApi();
  const { payment } = await makeCompletedPayment(api, "missing-provider");

  // Remove all provider transactions to simulate the gap
  api.store.providerTransactions.clear();

  const result = api.postReconciliationRun();
  assert.ok(result.exceptionCount >= 1);

  const exceptions = api.getReconciliationExceptions();
  const ex = exceptions.find((e) => e.category === "missing_provider_transaction");
  assert.ok(ex, "should flag missing_provider_transaction");
  assert.equal(ex.paymentOrderId, payment.id);
  assert.equal(ex.severity, "critical");
});

test("M6: ledger_posting_missing — completed order without posted ledger entry", async () => {
  const api = buildApi();
  const { payment } = await makeCompletedPayment(api, "missing-ledger");

  // Remove all ledger postings to simulate failure
  api.store.ledgerQueue.clear();

  const result = api.postReconciliationRun();
  assert.ok(result.exceptionCount >= 1);

  const ex = api
    .getReconciliationExceptions()
    .find((e) => e.category === "ledger_posting_missing" && e.paymentOrderId === payment.id);
  assert.ok(ex, "should flag ledger_posting_missing");
  assert.equal(ex.severity, "critical");
});

test("M6: amount_mismatch — provider transaction has different amount", async () => {
  const api = buildApi();
  const { payment } = await makeCompletedPayment(api, "amount-mismatch");

  // Tamper with the provider transaction amount
  const txn = [...api.store.providerTransactions.values()].find((t) => {
    const attempt = api.store.paymentAttempts.get(t.paymentAttemptId ?? "");
    return attempt?.paymentOrderId === payment.id;
  });
  assert.ok(txn);
  api.store.providerTransactions.set(txn.id, { ...txn, amount: "9999" });

  const result = api.postReconciliationRun();
  assert.ok(result.exceptionCount >= 1);

  const ex = api.getReconciliationExceptions().find((e) => e.category === "amount_mismatch");
  assert.ok(ex, "should flag amount_mismatch");
  assert.equal(ex.evidence.paymentAmount, "1000");
  assert.equal(ex.evidence.providerAmount, "9999");
});

test("M6: currency_mismatch — provider transaction has different asset", async () => {
  const api = buildApi();
  const { payment } = await makeCompletedPayment(api, "currency-mismatch");

  const txn = [...api.store.providerTransactions.values()].find((t) => {
    const attempt = api.store.paymentAttempts.get(t.paymentAttemptId ?? "");
    return attempt?.paymentOrderId === payment.id;
  });
  assert.ok(txn);
  api.store.providerTransactions.set(txn.id, { ...txn, asset: "USD/2" });

  api.postReconciliationRun();
  const ex = api.getReconciliationExceptions().find((e) => e.category === "currency_mismatch");
  assert.ok(ex, "should flag currency_mismatch");
  assert.equal(ex.severity, "critical");
});

test("M6: status_mismatch — provider says completed but order says failed", async () => {
  const api = buildApi();
  const { payment } = await makeCompletedPayment(api, "status-mismatch");

  // Force order to failed while provider transaction stays completed
  api.store.updatePaymentOrder(payment.id, { status: "failed" });

  api.postReconciliationRun();
  const ex = api.getReconciliationExceptions().find((e) => e.category === "status_mismatch");
  assert.ok(ex, "should flag status_mismatch");
  assert.equal(ex.severity, "warning");
  assert.equal(ex.evidence.orderStatus, "failed");
  assert.equal(ex.evidence.providerStatus, "completed");
});

test("M6: missing_internal_transaction — provider txn with no linked attempt", async () => {
  const api = buildApi();
  await makeCompletedPayment(api, "missing-internal");

  // Inject an orphaned provider transaction (no paymentAttemptId)
  api.store.providerTransactions.set("orphan-txn", {
    id: "orphan-txn",
    providerBindingId: api.store.getMockProviderBinding().id,
    paymentAttemptId: undefined,
    paymentAccountId: undefined,
    providerTransactionId: "orphan-provider-ref",
    direction: "outbound",
    status: "completed",
    amount: "500",
    asset: "GBP/2",
    occurredAt: new Date().toISOString(),
    rawPayload: {},
    metadata: {},
  });

  api.postReconciliationRun();
  const ex = api
    .getReconciliationExceptions()
    .find((e) => e.category === "missing_internal_transaction");
  assert.ok(ex, "should flag missing_internal_transaction for orphaned provider txn");
  assert.equal(ex.severity, "critical");
});

test("M6: duplicate_provider_reference — two txns share same reference", async () => {
  const api = buildApi();
  await makeCompletedPayment(api, "dup-ref");

  const bindingId = api.store.getMockProviderBinding().id;
  const sharedRef = "DUPLICATE-REF-001";

  api.store.providerTransactions.set("dup-txn-a", {
    id: "dup-txn-a",
    providerBindingId: bindingId,
    providerTransactionId: "dup-provider-txn-a",
    providerReference: sharedRef,
    direction: "outbound",
    status: "completed",
    amount: "1000",
    asset: "GBP/2",
    occurredAt: new Date().toISOString(),
    rawPayload: {},
    metadata: {},
  });
  api.store.providerTransactions.set("dup-txn-b", {
    id: "dup-txn-b",
    providerBindingId: bindingId,
    providerTransactionId: "dup-provider-txn-b",
    providerReference: sharedRef,
    direction: "outbound",
    status: "completed",
    amount: "1000",
    asset: "GBP/2",
    occurredAt: new Date().toISOString(),
    rawPayload: {},
    metadata: {},
  });

  api.postReconciliationRun();
  const ex = api
    .getReconciliationExceptions()
    .find((e) => e.category === "duplicate_provider_reference");
  assert.ok(ex, "should flag duplicate_provider_reference");
  assert.equal(ex.severity, "critical");
  const dupeIds = ex.evidence.duplicateTransactionIds as string[];
  assert.ok(dupeIds.includes("dup-txn-a") && dupeIds.includes("dup-txn-b"));
});

test("M6: stale_pending_transaction — order stuck in submitted_to_provider", async () => {
  const api = buildApi();

  const customer = api.postCustomer({ legalName: "Stale User" });
  const account = api.postPaymentAccount({ customerId: customer.id });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "500",
    asset: "GBP/2",
  });

  // Manually set order to submitted with a timestamp 2 hours ago
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  api.store.updatePaymentOrder(payment.id, {
    status: "submitted_to_provider",
    submittedAt: twoHoursAgo,
  });

  api.postReconciliationRun();
  const ex = api
    .getReconciliationExceptions()
    .find((e) => e.category === "stale_pending_transaction");
  assert.ok(ex, "should flag stale_pending_transaction");
  assert.equal(ex.severity, "warning");
  assert.equal(ex.paymentOrderId, payment.id);
});

test("M6: reconciliation run produces summary with counts", async () => {
  const api = buildApi();
  await makeCompletedPayment(api, "summary-a");
  await makeCompletedPayment(api, "summary-b");

  const { runId } = api.postReconciliationRun();
  const run = api.store.reconciliationRuns.get(runId);
  assert.ok(run, "run should be stored");
  assert.equal(run.status, "completed");
  assert.ok(typeof run.summary.paymentOrderCount === "number");
  assert.equal(run.summary.paymentOrderCount, 2);
});

test("M6: reconciliation records are created for each payment order", async () => {
  const api = buildApi();
  await makeCompletedPayment(api, "records-a");
  await makeCompletedPayment(api, "records-b");

  api.postReconciliationRun();

  const records = [...api.store.reconciliationRecords.values()];
  assert.ok(records.length >= 2, "one record per payment order at minimum");
  assert.ok(
    records.every((r) => r.reconciliationRunId),
    "all records should reference the run",
  );
});
