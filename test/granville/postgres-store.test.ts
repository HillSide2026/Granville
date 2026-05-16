import { strict as assert } from "node:assert";
import { test } from "node:test";

const TEST_DB = process.env.TEST_DATABASE_URL;

if (!TEST_DB) {
  console.log("Skipping postgres-store integration tests (set TEST_DATABASE_URL to run)");
  process.exit(0);
}

import { createPool } from "../../libs/db/client.ts";
import { PostgresGranvilleStore } from "../../libs/persistence/src/postgres-store.ts";

async function freshStore(): Promise<PostgresGranvilleStore> {
  return PostgresGranvilleStore.initialize(createPool(TEST_DB));
}

test("mock provider seed data present on first init", async () => {
  const store = await freshStore();
  const emi = [...store.providerBindings.values()].find((b) => b.adapterKey === "mock-emi");
  const bank = [...store.providerBindings.values()].find((b) => b.adapterKey === "mock-bank");
  assert.ok(emi, "mock-emi binding seeded");
  assert.ok(bank, "mock-bank binding seeded");
  assert.ok(store.providerHealth.get(emi.id), "mock-emi health seeded");
});

test("customer survives store restart", async () => {
  const store1 = await freshStore();
  const customer = store1.createCustomer({ legalName: "Persist Test Co", countryCode: "GB" });

  const store2 = await freshStore();
  const reloaded = store2.customers.get(customer.id);
  assert.ok(reloaded, "customer reloaded from DB");
  assert.equal(reloaded.legalName, "Persist Test Co");
  assert.equal(reloaded.countryCode, "GB");
});

test("payment order survives store restart", async () => {
  const store1 = await freshStore();
  const binding = store1.getMockProviderBinding();
  const customer = store1.createCustomer({ legalName: "Order Test", countryCode: "GB" });
  const account = store1.createPaymentAccount({
    customerId: customer.id,
    providerBindingId: binding.id,
    currencyCode: "GBP",
  });
  const order = store1.createPaymentOrder({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "10000",
    asset: "GBP/2",
  });

  const store2 = await freshStore();
  const reloaded = store2.paymentOrders.get(order.id);
  assert.ok(reloaded, "payment order reloaded from DB");
  assert.equal(reloaded.status, "created");
  assert.equal(reloaded.amount.amount, "10000");
  assert.equal(reloaded.amount.asset, "GBP/2");
});

test("idempotency key survives store restart", async () => {
  const store1 = await freshStore();
  const binding = store1.getMockProviderBinding();
  const customer = store1.withIdempotency("customer", "idem-restart-test", "hash-abc", () => {
    const c = store1.createCustomer({ legalName: "Idem Test" });
    return { resourceType: "customer", resourceId: c.id, response: c };
  });

  const store2 = await freshStore();
  const record = store2.idempotency.get(`customer:idem-restart-test`);
  assert.ok(record, "idempotency record reloaded from DB");
  assert.equal(record.status, "completed");
  assert.equal(record.resourceId, customer.id);

  // Re-running with same key returns same customer
  const store3 = await freshStore();
  const again = store3.withIdempotency("customer", "idem-restart-test", "hash-abc", () => {
    const c = store3.createCustomer({ legalName: "Should Not Create" });
    return { resourceType: "customer", resourceId: c.id, response: c };
  });
  assert.equal(again.id, customer.id, "idempotent: same customer returned");
});

test("ledger queue item survives store restart", async () => {
  const store1 = await freshStore();
  const binding = store1.getMockProviderBinding();
  const customer = store1.createCustomer({ legalName: "Ledger Persist" });
  const account = store1.createPaymentAccount({
    customerId: customer.id,
    providerBindingId: binding.id,
  });
  const order = store1.createPaymentOrder({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "5000",
    asset: "GBP/2",
  });
  const attempt = store1.createPaymentAttempt(order, binding.id, {});
  const idemKey = `ledger-persist-test:${order.id}`;
  store1.enqueueLedgerPosting({
    id: crypto.randomUUID(),
    aggregateType: "payment_order",
    aggregateId: order.id,
    postingKey: "payment.completed",
    idempotencyKey: idemKey,
    ledgerName: "default",
    description: "test posting",
    postings: [],
    metadata: {},
  });

  const store2 = await freshStore();
  const item = [...store2.ledgerQueue.values()].find((i) => i.idempotencyKey === idemKey);
  assert.ok(item, "ledger queue item reloaded from DB");
  assert.equal(item.status, "pending");
  assert.equal(item.description, "test posting");
});

test("webhook event survives store restart", async () => {
  const store1 = await freshStore();
  const binding = store1.getMockProviderBinding();
  const eventId = crypto.randomUUID();
  store1.storeWebhookEvent({
    id: eventId,
    providerBindingId: binding.id,
    providerCode: "mock-emi",
    processingStatus: "queued",
    requestPath: "/webhooks/mock-emi",
    headers: {},
    queryParams: {},
    body: '{"test":true}',
    receivedAt: new Date().toISOString(),
    metadata: {},
  });

  const store2 = await freshStore();
  const event = store2.webhooks.get(eventId);
  assert.ok(event, "webhook event reloaded from DB");
  assert.equal(event.providerCode, "mock-emi");
  assert.equal(event.body, '{"test":true}');
});

test("provider health update survives restart", async () => {
  const store1 = await freshStore();
  const binding = store1.getMockProviderBinding();
  store1.setProviderHealth(binding.id, "degraded", { reason: "test degraded", failureCount: 3 });

  const store2 = await freshStore();
  const health = store2.providerHealth.get(binding.id);
  assert.ok(health, "provider health reloaded");
  assert.equal(health.status, "degraded");
  assert.equal(health.failureCount, 3);
  assert.equal(health.reason, "test degraded");
});
