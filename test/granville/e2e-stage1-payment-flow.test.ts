/**
 * Stage 1 end-to-end acceptance test.
 *
 * Proves the full async payment flow:
 *   customer → account → payment → submit → provider runtime
 *   → webhook ingestion → ledger writer → reconciliation → audit trail
 *
 * This is the MVP acceptance gate. All steps must pass for Stage 1 to be
 * considered complete.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";

test("Stage 1 acceptance: full mock EMI payment flow via webhook path", async () => {
  const api = new GranvilleApi();

  // ── 1. Customer creation (idempotent) ────────────────────────────────────
  const customer = api.postCustomer(
    { legalName: "Grace Hopper", email: "grace@example.com", countryCode: "GB" },
    { idempotencyKey: "e2e-customer-grace" },
  );
  assert.equal(customer.status, "active");

  const duplicateCustomer = api.postCustomer(
    { legalName: "Grace Hopper", email: "grace@example.com", countryCode: "GB" },
    { idempotencyKey: "e2e-customer-grace" },
  );
  assert.equal(duplicateCustomer.id, customer.id, "idempotent customer creation");

  // ── 2. Payment account ────────────────────────────────────────────────────
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB", displayName: "Grace GBP" },
    { idempotencyKey: "e2e-account-grace-gbp" },
  );
  assert.equal(account.status, "active");
  assert.equal(account.customerId, customer.id);

  // ── 3. Payment creation (idempotent) ─────────────────────────────────────
  const payment = api.postPayment(
    {
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "5000",
      asset: "GBP/2",
      beneficiaryReference: "e2e-invoice-001",
    },
    { idempotencyKey: "e2e-payment-grace-001" },
  );
  assert.equal(payment.status, "created");

  const duplicatePayment = api.postPayment(
    {
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "5000",
      asset: "GBP/2",
      beneficiaryReference: "e2e-invoice-001",
    },
    { idempotencyKey: "e2e-payment-grace-001" },
  );
  assert.equal(duplicatePayment.id, payment.id, "idempotent payment creation");

  // ── 4. Submit: orchestrator → router → provider command enqueued ──────────
  const { attempt } = api.orchestrator.submitPayment(payment.id);
  const orderAfterSubmit = api.getPayment(payment.id)!;
  assert.equal(orderAfterSubmit.status, "submitted_to_provider");
  assert.equal(attempt.paymentOrderId, payment.id);

  // ── 5. Provider runtime executes the command ──────────────────────────────
  const jobsProcessed = await api.providerRuntime.drain();
  assert.ok(jobsProcessed >= 1, "provider runtime should process at least one command");

  const orderAfterProvider = api.getPayment(payment.id)!;
  assert.equal(orderAfterProvider.status, "completed", "mock EMI completes synchronously");

  assert.equal(api.store.providerTransactions.size, 1, "one provider transaction recorded");
  const providerTxn = [...api.store.providerTransactions.values()][0];
  assert.equal(providerTxn.amount, "5000");
  assert.equal(providerTxn.asset, "GBP/2");

  // ── 6. Ledger writer posts the entry ──────────────────────────────────────
  // The provider runtime enqueues a ledger posting on completion.
  assert.equal(api.store.ledgerQueue.size, 1, "one ledger posting enqueued");
  assert.equal([...api.store.ledgerQueue.values()][0].status, "pending");

  api.ledgerWriter.postPending();
  const posting = [...api.store.ledgerQueue.values()][0];
  assert.equal(posting.status, "posted", "ledger posting must be posted");
  assert.ok(posting.result?.formanceTransactionId, "must have a Formance transaction id");

  // ── 7. Webhook ingestion path (independent of provider runtime result) ────
  // Simulate a provider status webhook arriving after the fact.
  // The webhook processor must handle a webhook for an already-completed payment
  // gracefully (idempotent — no double-posting).
  // Re-read the attempt from the store: providerReference is set by the runtime after drain.
  const liveAttempt = api.store.paymentAttempts.get(attempt.id)!;
  const providerRef = liveAttempt.providerReference ?? liveAttempt.providerTransactionId;
  assert.ok(providerRef, "attempt must have a provider reference");

  const webhookResult = api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: providerRef, status: "completed" }),
  );
  assert.equal(webhookResult.status, "queued");

  const webhooksProcessed = api.drainWebhooks();
  assert.ok(webhooksProcessed >= 1, "webhook processor should handle the event");

  const webhookEvent = api.store.webhooks.get(webhookResult.id)!;
  assert.equal(webhookEvent.processingStatus, "processed");

  // No duplicate ledger posting — idempotency key prevents it.
  assert.equal(
    api.store.ledgerQueue.size,
    1,
    "webhook for already-completed payment must not enqueue a second posting",
  );

  // ── 8. Reconciliation ─────────────────────────────────────────────────────
  const { runId, exceptionCount } = api.postReconciliationRun();
  assert.equal(exceptionCount, 0, "clean flow must produce zero reconciliation exceptions");

  const run = api.store.reconciliationRuns.get(runId)!;
  assert.equal(run.status, "completed");
  assert.ok(Number(run.summary.paymentOrderCount) >= 1);

  const records = [...api.store.reconciliationRecords.values()].filter(
    (r) => r.reconciliationRunId === runId,
  );
  assert.ok(records.length >= 1, "at least one reconciliation record");
  const matchedRecord = records.find((r) => r.paymentOrderId === payment.id);
  assert.ok(matchedRecord, "payment should have a reconciliation record");
  assert.equal(matchedRecord.matchStatus, "matched");

  // ── 9. Audit trail ────────────────────────────────────────────────────────
  const auditEvents = api.getAuditEvents();
  assert.ok(auditEvents.length >= 10, `expected ≥10 audit events, got ${auditEvents.length}`);

  const requiredActions = [
    "customer.created",
    "payment_account.created",
    "payment_order.created",
    "payment_attempt.created",
    "provider_command.enqueued",
    "provider_transaction.recorded",
    "ledger_posting.enqueued",
    "ledger_posting.posted",
    "webhook.received",
    "webhook.processed",
    "reconciliation.completed",
  ];

  for (const action of requiredActions) {
    const found = auditEvents.some((e) => e.action === action);
    assert.ok(found, `missing audit event: ${action}`);
  }

  // ── 10. Reporting ─────────────────────────────────────────────────────────
  const history = api.reportPaymentHistory({ status: "completed" });
  assert.equal(history.length, 1);
  assert.equal(history[0].paymentOrderId, payment.id);
  assert.equal(history[0].amount, "5000");

  const settlement = api.reportSettlement({});
  assert.ok(settlement.length >= 1);
  assert.equal(settlement[0].completedCount, 1);
  assert.equal(settlement[0].totalAmount, "5000");

  const metrics = api.metricsSnapshot();
  assert.equal(metrics.paymentFailureRate, 0);
  assert.equal(metrics.reconciliationExceptionCount, 0);
  assert.equal(metrics.ledgerPostingFailures, 0);
  assert.equal(metrics.webhookFailureCount, 0);
  assert.equal(metrics.queueBacklog, 0);
  assert.equal(metrics.providerOutageStatus["mock-emi"], "healthy");
});

test("Stage 1 acceptance: cancelled payment does not produce reconciliation exceptions", async () => {
  const api = new GranvilleApi();

  const customer = api.postCustomer({ legalName: "Cancel Test", countryCode: "GB" });
  const account = api.postPaymentAccount({ customerId: customer.id });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "1000",
    asset: "GBP/2",
  });

  api.cancelPayment(payment.id, "e2e cancel test");
  assert.equal(api.getPayment(payment.id)?.status, "cancelled");

  const { exceptionCount } = api.postReconciliationRun();
  assert.equal(exceptionCount, 0, "cancelled payment should not produce exceptions");
});

test("Stage 1 acceptance: failed payment retry succeeds and reconciles cleanly", async () => {
  const api = new GranvilleApi();

  const customer = api.postCustomer({ legalName: "Retry Test", countryCode: "GB" });
  const account = api.postPaymentAccount({ customerId: customer.id });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "750",
    asset: "GBP/2",
  });

  // Force first attempt to fail
  const { attempt } = api.orchestrator.submitPayment(payment.id);
  api.orchestrator.markPaymentFailed(attempt.id, "simulated first failure");
  assert.equal(api.getPayment(payment.id)?.status, "failed");

  // Retry — second attempt should succeed via mock EMI
  const retried = await api.submitPayment(payment.id);
  assert.equal(retried.status, "completed", "retry should complete via mock EMI");

  const { exceptionCount } = api.postReconciliationRun();
  assert.equal(exceptionCount, 0, "retry flow should reconcile cleanly");

  const history = api.reportPaymentHistory({ status: "completed" });
  assert.equal(history.length, 1);
  assert.ok(history[0].attemptCount >= 1);
});
