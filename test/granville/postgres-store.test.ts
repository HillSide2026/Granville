import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";

const TEST_DB = process.env.TEST_DATABASE_URL;

if (!TEST_DB) {
  console.log("Skipping postgres-store integration tests (set TEST_DATABASE_URL to run)");
  process.exit(0);
}

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import { ProviderRuntime } from "../../apps/provider-runtime/src/provider-runtime.ts";
import { Reconciler } from "../../apps/reconciler/src/reconciler.ts";
import { createPool } from "../../libs/db/client.ts";
import { runGranvilleMigrations } from "../../libs/db/migrate.ts";
import { PostgresGranvilleStore } from "../../libs/persistence/src/postgres-store.ts";
import { ProviderAdapterRegistry } from "../../libs/provider-adapters/adapter-registry.ts";
import {
  AirwallexClient,
  AirwallexEmiProvider,
} from "../../libs/provider-adapters/airwallex/index.ts";

let migrated = false;

async function ensureMigrated(): Promise<void> {
  if (migrated) return;
  const client = createPool(TEST_DB);
  try {
    await runGranvilleMigrations(client, { includeSeeds: true });
  } finally {
    await client.close();
  }
  migrated = true;
}

async function freshStore(): Promise<PostgresGranvilleStore> {
  await ensureMigrated();
  return PostgresGranvilleStore.initialize(createPool(TEST_DB));
}

async function flush(store: PostgresGranvilleStore): Promise<void> {
  await store.flushPersistence();
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
  await flush(store1);

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
  await flush(store1);

  const store2 = await freshStore();
  const reloaded = store2.paymentOrders.get(order.id);
  assert.ok(reloaded, "payment order reloaded from DB");
  assert.equal(reloaded.status, "created");
  assert.equal(reloaded.amount.amount, "10000");
  assert.equal(reloaded.amount.asset, "GBP/2");
});

test("idempotency key survives store restart", async () => {
  const store1 = await freshStore();
  const suffix = crypto.randomUUID();
  const key = `idem-restart-test-${suffix}`;
  const hash = `hash-${suffix}`;
  const customer = store1.withIdempotency("customer", key, hash, () => {
    const c = store1.createCustomer({ legalName: "Idem Test" });
    return { resourceType: "customer", resourceId: c.id, response: c };
  });
  await flush(store1);

  const store2 = await freshStore();
  const record = store2.idempotency.get(`customer:${key}`);
  assert.ok(record, "idempotency record reloaded from DB");
  assert.equal(record.status, "completed");
  assert.equal(record.resourceId, customer.id);

  // Re-running with same key returns same customer
  const store3 = await freshStore();
  const again = store3.withIdempotency("customer", key, hash, () => {
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
  store1.createPaymentAttempt(order, binding.id, {});
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
  await flush(store1);

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
  await flush(store1);

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
  await flush(store1);

  const store2 = await freshStore();
  const health = store2.providerHealth.get(binding.id);
  assert.ok(health, "provider health reloaded");
  assert.equal(health.status, "degraded");
  assert.equal(health.failureCount, 3);
  assert.equal(health.reason, "test degraded");
});

test("Stage 1 acceptance flow survives Postgres reloads", async () => {
  const suffix = crypto.randomUUID();
  const store1 = await freshStore();
  const api1 = new GranvilleApi(store1);

  const customer = api1.postCustomer(
    { legalName: "Postgres Acceptance", email: `pg-${suffix}@example.com`, countryCode: "GB" },
    { idempotencyKey: `pg-customer-${suffix}` },
  );
  const account = api1.postPaymentAccount(
    {
      customerId: customer.id,
      currencyCode: "GBP",
      countryCode: "GB",
      displayName: "Postgres GBP",
    },
    { idempotencyKey: `pg-account-${suffix}` },
  );
  const payment = api1.postPayment(
    {
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "4200",
      asset: "GBP/2",
      beneficiaryReference: `pg-invoice-${suffix}`,
    },
    { idempotencyKey: `pg-payment-${suffix}` },
  );

  const completed = await api1.submitPayment(payment.id);
  assert.equal(completed.status, "completed");
  await flush(store1);

  const store2 = await freshStore();
  const api2 = new GranvilleApi(store2);
  assert.equal(api2.getPayment(payment.id)?.status, "completed", "payment survived reload");

  const attempt = [...store2.paymentAttempts.values()].find((a) => a.paymentOrderId === payment.id);
  assert.ok(attempt?.providerReference, "attempt provider reference survived reload");
  const webhookResult = api2.postWebhook(
    "mock-emi",
    JSON.stringify({ providerReference: attempt.providerReference, status: "completed" }),
  );
  assert.ok(api2.drainWebhooks() >= 1);
  assert.equal(api2.store.webhooks.get(webhookResult.id)?.processingStatus, "processed");
  assert.equal(
    [...api2.store.ledgerQueue.values()].filter((item) => item.aggregateId === payment.id).length,
    1,
    "webhook replay did not duplicate ledger posting",
  );

  const reconciliation = api2.postReconciliationRun();
  assert.equal(reconciliation.exceptionCount, 0);
  assert.equal(
    api2.reportPaymentHistory({ status: "completed" }).some((r) => r.paymentOrderId === payment.id),
    true,
  );
  await flush(store2);

  const store3 = await freshStore();
  assert.ok(
    store3.reconciliationRuns.get(reconciliation.runId),
    "reconciliation run survived reload",
  );
  assert.equal(
    [...store3.reconciliationRecords.values()].some(
      (record) => record.paymentOrderId === payment.id,
    ),
    true,
    "reconciliation record survived reload",
  );
});

test("Milestone 1B: Postgres-backed Airwallex sandbox payout flow", async () => {
  await seedAirwallexProvider();
  const suffix = crypto.randomUUID();
  const transferId = `awx-transfer-${suffix}`;
  const beneficiaryId = `awx-beneficiary-${suffix}`;
  const webhookSecret = `awx-secret-${suffix}`;
  const airwallex = sandboxAirwallexClient({
    transferId,
    beneficiaryId,
    transferStatus: "SCHEDULED",
    syncedStatus: "PAID",
  });
  const registry = airwallexRegistry(airwallex);

  const store1 = await freshStore();
  const api1 = airwallexApi(store1, registry);
  const binding = store1.getProviderBindingByAdapterKey("airwallex");
  binding.config.webhookSecret = webhookSecret;
  store1.providerBindings.set(binding.id, binding);

  api1.createRoutingRule({
    name: `airwallex-1b-${suffix}`,
    priority: 1,
    conditions: { asset: "GBP/2" },
    outcome: { providerBindingId: binding.id, rail: "airwallex_local" },
  });
  const customer = api1.postCustomer(
    { legalName: "Airwallex Sandbox Co", countryCode: "GB" },
    { idempotencyKey: `awx-customer-${suffix}` },
  );
  const account = api1.postPaymentAccount(
    {
      customerId: customer.id,
      providerBindingId: binding.id,
      currencyCode: "GBP",
      countryCode: "GB",
    },
    { idempotencyKey: `awx-account-${suffix}` },
  );
  const payment = api1.postPayment(
    {
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "4200",
      asset: "GBP/2",
      beneficiaryReference: `awx-ref-${suffix}`,
      metadata: {
        beneficiaryName: "Airwallex Test Beneficiary",
        airwallexBeneficiaryAccountName: "Airwallex Test Beneficiary",
        airwallexBeneficiaryAccountNumber: "12345678",
        airwallexBeneficiaryRoutingType: "sort_code",
        airwallexBeneficiaryRoutingValue: "010203",
        airwallexLocalClearingSystem: "FPS",
      },
    },
    { idempotencyKey: `awx-payment-${suffix}` },
  );
  await flush(store1);

  const persistedBeforeSubmit = await freshStore();
  assert.equal(
    persistedBeforeSubmit.paymentOrders.get(payment.id)?.status,
    "created",
    "payment persisted before provider submission",
  );

  const store2 = await freshStore();
  const api2 = airwallexApi(store2, registry);
  const submitted = await api2.submitPayment(payment.id);
  assert.equal(submitted.status, "provider_accepted");
  await flush(store2);

  const store3 = await freshStore();
  const binding3 = store3.getProviderBindingByAdapterKey("airwallex");
  binding3.config.webhookSecret = webhookSecret;
  store3.providerBindings.set(binding3.id, binding3);
  const attempt = [...store3.paymentAttempts.values()].find((a) => a.paymentOrderId === payment.id);
  assert.ok(attempt, "payment attempt persisted");
  assert.equal(attempt.providerTransactionId, transferId);
  assert.equal(attempt.providerReference, attempt.id);
  assert.equal(attempt.metadata.airwallexBeneficiaryId, beneficiaryId);

  const api3 = airwallexApi(store3, registry);
  const webhookBody = JSON.stringify({
    id: `evt-${suffix}`,
    name: "payout.transfer.paid",
    data: {
      id: transferId,
      request_id: attempt.id,
      status: "PAID",
      transfer_amount: "42.00",
      transfer_currency: "GBP",
    },
  });
  const webhookHeaders = signedAirwallexHeaders(webhookBody, webhookSecret);
  const webhook = api3.postWebhook("airwallex", webhookBody, { headers: webhookHeaders });
  assert.equal(webhook.status, "queued");
  assert.equal(api3.drainWebhooks(), 1);
  api3.postPendingLedger();

  const duplicateWebhook = api3.postWebhook("airwallex", webhookBody, { headers: webhookHeaders });
  assert.equal(duplicateWebhook.id, webhook.id);
  assert.equal(api3.drainWebhooks(), 0);
  api3.postPendingLedger();

  const completed = api3.getPayment(payment.id);
  assert.equal(completed?.status, "completed");
  assert.equal(
    [...store3.ledgerQueue.values()].filter(
      (item) => item.aggregateId === payment.id && item.status === "posted",
    ).length,
    1,
    "duplicate webhook did not double-post ledger",
  );

  const sync = await api3.syncProviderTransactions("airwallex");
  assert.equal(sync.synced, 1);
  const reconciliation = api3.postReconciliationRun();
  assert.equal(reconciliation.exceptionCount, 0);
  await flush(store3);
});

async function seedAirwallexProvider(): Promise<void> {
  const client = createPool(TEST_DB);
  try {
    await client.query(
      `INSERT INTO providers (id, code, display_name, kind, stage, active, metadata)
       VALUES ('00000000-0000-0000-0000-0000000000a1', 'airwallex', 'Airwallex Sandbox', 'emi', 'stage1b', TRUE, '{}')
       ON CONFLICT DO NOTHING`,
    );
    await client.query(
      `INSERT INTO provider_bindings (id, provider_id, binding_kind, adapter_key, active, config, metadata)
       VALUES ('00000000-0000-0000-0001-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'native_emi', 'airwallex', TRUE, '{"dryRun": false}', '{}')
       ON CONFLICT DO NOTHING`,
    );
    await client.query(
      `INSERT INTO provider_capabilities (id, provider_id, capability_key, enabled, config)
       VALUES ('00000000-0000-0000-0002-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'outbound_payments', TRUE, '{"assets":["GBP/2"],"rails":["airwallex_local"],"countries":["GB"],"fallbackPriority":1}')
       ON CONFLICT DO NOTHING`,
    );
    await client.query(
      `INSERT INTO provider_health (provider_binding_id, status, failure_count)
       VALUES ('00000000-0000-0000-0001-0000000000a1', 'healthy', 0)
       ON CONFLICT DO NOTHING`,
    );
  } finally {
    await client.close();
  }
}

function airwallexApi(
  store: PostgresGranvilleStore,
  registry: ProviderAdapterRegistry,
): GranvilleApi {
  const api = new GranvilleApi(store);
  api.providerRuntime = new ProviderRuntime(store, registry);
  api.reconciler = new Reconciler(store, registry);
  return api;
}

function airwallexRegistry(client: AirwallexClient): ProviderAdapterRegistry {
  const registry = new ProviderAdapterRegistry();
  registry.register("airwallex", () => new AirwallexEmiProvider(client));
  return registry;
}

function sandboxAirwallexClient(input: {
  beneficiaryId: string;
  transferId: string;
  transferStatus: string;
  syncedStatus: string;
}): AirwallexClient {
  let requestId = "";
  return new AirwallexClient(
    {
      baseUrl: "https://api-demo.airwallex.com",
      clientId: "client-id",
      apiKey: "api-key",
      dryRun: false,
    },
    async (url, init) => {
      const href = String(url);
      if (href.endsWith("/authentication/login")) {
        return new Response(JSON.stringify({ token: "token-123" }), { status: 200 });
      }
      if (href.endsWith("/beneficiaries/create")) {
        return new Response(JSON.stringify({ id: input.beneficiaryId }), { status: 200 });
      }
      if (href.endsWith("/transfers/create")) {
        const payload =
          typeof init?.body === "string" ? (JSON.parse(init.body) as Record<string, unknown>) : {};
        requestId = typeof payload.request_id === "string" ? payload.request_id : "";
        return new Response(
          JSON.stringify({
            id: input.transferId,
            request_id: payload.request_id,
            status: input.transferStatus,
          }),
          { status: 200 },
        );
      }
      if (href.includes("/api/v1/transfers?")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: input.transferId,
                request_id: requestId,
                status: input.syncedStatus,
                transfer_amount: "42.00",
                transfer_currency: "GBP",
                updated_at: new Date().toISOString(),
              },
            ],
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ id: input.transferId, status: input.syncedStatus }), {
        status: 200,
      });
    },
  );
}

function signedAirwallexHeaders(body: string, secret: string): Record<string, string> {
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", secret).update(`${timestamp}${body}`).digest("hex");
  return {
    "x-timestamp": timestamp,
    "x-signature": signature,
  };
}
