import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";

function buildApi() {
  const api = new GranvilleApi();
  const customer = api.postCustomer(
    { legalName: "Test User", email: "test@example.com", countryCode: "GB" },
    { idempotencyKey: "webhook-test-customer" },
  );
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB" },
    { idempotencyKey: "webhook-test-account" },
  );
  return { api, customer, account };
}

test("M5: webhook receipt queues for async processing", async () => {
  const { api, customer, account } = buildApi();

  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "1000", asset: "GBP/2" },
    { idempotencyKey: "wh-payment-1" },
  );
  // Submit so we have a real payment attempt with a provider reference
  await api.submitPayment(payment.id);

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt, "payment attempt should exist after submit");
  const providerRef = attempt.providerReference ?? attempt.providerTransactionId;
  assert.ok(providerRef, "attempt should have a provider reference from mock EMI");

  // Post a webhook — should be queued, not yet processed
  const webhookResult = api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: providerRef, status: "completed" }),
  );
  assert.equal(webhookResult.status, "queued");

  const event = api.store.webhooks.get(webhookResult.id);
  assert.ok(event, "webhook event must be persisted immediately");
  assert.equal(event.processingStatus, "queued");
});

test("M5: webhook processor updates payment state", async () => {
  const { api, customer, account } = buildApi();

  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "2000", asset: "GBP/2" },
    { idempotencyKey: "wh-payment-2" },
  );
  // Submit but do NOT drain ledger — we want the webhook to do the completion
  api.orchestrator.submitPayment(payment.id);
  await api.providerRuntime.drain();

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt);
  const providerRef = attempt.providerReference ?? attempt.providerTransactionId;
  assert.ok(providerRef);

  // Manually set payment back to processing to simulate a status-update webhook
  api.store.updatePaymentOrder(payment.id, { status: "processing", completedAt: undefined });
  api.store.updatePaymentAttempt(attempt.id, { status: "processing", completedAt: undefined });

  api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: providerRef, status: "completed" }),
  );
  const drained = api.drainWebhooks();
  assert.equal(drained, 1, "processor should handle one webhook");

  const updatedOrder = api.getPayment(payment.id);
  assert.equal(updatedOrder?.status, "completed", "payment order should be completed via webhook");

  const updatedAttempt = api.store.paymentAttempts.get(attempt.id);
  assert.equal(updatedAttempt?.status, "completed");
});

test("M5: completed-via-webhook payment enqueues ledger posting", async () => {
  const { api, customer, account } = buildApi();

  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "3000", asset: "GBP/2" },
    { idempotencyKey: "wh-payment-3" },
  );
  api.orchestrator.submitPayment(payment.id);
  await api.providerRuntime.drain();

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt);
  const providerRef = attempt.providerReference ?? attempt.providerTransactionId;
  assert.ok(providerRef);

  // Clear ledger queue to prove it was re-enqueued by the webhook processor
  api.store.ledgerQueue.clear();

  api.store.updatePaymentOrder(payment.id, { status: "processing", completedAt: undefined });
  api.store.updatePaymentAttempt(attempt.id, { status: "processing", completedAt: undefined });

  api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: providerRef, status: "completed" }),
  );
  api.drainWebhooks();

  assert.equal(api.store.ledgerQueue.size, 1, "webhook completion should enqueue a ledger posting");
  api.ledgerWriter.postPending();
  const posting = [...api.store.ledgerQueue.values()][0];
  assert.equal(posting.status, "posted");
});

test("M5: unrecognised webhook is ignored without error", () => {
  const { api } = buildApi();

  const result = api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: "unknown-ref-xyz", status: "completed" }),
  );
  assert.equal(result.status, "queued");

  const drained = api.drainWebhooks();
  assert.equal(drained, 1);

  const event = api.store.webhooks.get(result.id);
  assert.equal(event?.processingStatus, "ignored");
});

test("M5: webhook with no matchable identifier is ignored", () => {
  const { api } = buildApi();

  const result = api.postWebhook("mock-emi", JSON.stringify({ irrelevant: "data" }));
  api.drainWebhooks();

  const event = api.store.webhooks.get(result.id);
  assert.equal(event?.processingStatus, "ignored");
});

test("M5: failed webhook records attempt and can be retried", async () => {
  const { api, customer, account } = buildApi();

  // Submit a real payment so we have a provider reference to match on
  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "777", asset: "GBP/2" },
    { idempotencyKey: "wh-fail-payment" },
  );
  api.orchestrator.submitPayment(payment.id);
  await api.providerRuntime.drain();

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt);
  const providerRef = attempt.providerReference ?? attempt.providerTransactionId;
  assert.ok(providerRef);

  // Remove the payment order so processor throws when it tries to look it up
  api.store.paymentOrders.delete(payment.id);

  const result = api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: providerRef, status: "completed" }),
  );

  api.drainWebhooks();
  const afterFail = api.store.webhooks.get(result.id);
  assert.ok(afterFail);
  assert.ok(
    ["queued", "failed"].includes(afterFail.processingStatus),
    `status should be queued (retry) or failed (dead-letter), got: ${afterFail.processingStatus}`,
  );

  const attempts = [...api.store.webhookProcessingAttempts.values()].filter(
    (a) => a.webhookEventId === result.id,
  );
  assert.ok(attempts.length >= 1, "at least one processing attempt must be recorded");
});

test("M5: webhook processing emits audit events", async () => {
  const { api, customer, account } = buildApi();

  const auditsBefore = api.getAuditEvents().length;

  const payment = api.postPayment(
    { customerId: customer.id, paymentAccountId: account.id, amount: "500", asset: "GBP/2" },
    { idempotencyKey: "wh-audit-payment" },
  );
  api.orchestrator.submitPayment(payment.id);
  await api.providerRuntime.drain();

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  const providerRef = attempt?.providerReference ?? attempt?.providerTransactionId;
  assert.ok(providerRef);
  assert.ok(attempt);

  api.store.updatePaymentOrder(payment.id, { status: "processing", completedAt: undefined });
  api.store.updatePaymentAttempt(attempt.id, { status: "processing", completedAt: undefined });

  api.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: providerRef, status: "completed" }),
  );
  api.drainWebhooks();

  const auditsAfter = api.getAuditEvents().length;
  assert.ok(auditsAfter > auditsBefore, "processing a webhook should emit audit events");

  const processedAudit = api.getAuditEvents().find((e) => e.action === "webhook.processed");
  assert.ok(processedAudit, "should have a webhook.processed audit event");
});
