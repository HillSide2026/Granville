import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import test from "node:test";

import { createGranvilleServer, GranvilleHttpControllers } from "../../apps/api/src/http.ts";
import { GranvilleClient } from "../../pkg/client/granville/src/client.ts";
import { GranvilleApiError } from "../../pkg/client/granville/src/errors.ts";

const TEST_TOKENS = { adminToken: "test-admin", operatorToken: "test-operator" };

async function withServer(
  fn: (client: GranvilleClient, controllers: GranvilleHttpControllers) => Promise<void>,
): Promise<void> {
  const controllers = new GranvilleHttpControllers(undefined, TEST_TOKENS);
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const client = new GranvilleClient({ baseUrl: `http://localhost:${port}`, token: "test-admin" });
  try {
    await fn(client, controllers);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

test("createCustomer round-trip returns typed Customer", async () => {
  await withServer(async (client) => {
    const customer = await client.createCustomer({
      legalName: "SDK Test Corp",
      countryCode: "GB",
    });
    assert.ok(customer.id);
    assert.equal(customer.legalName, "SDK Test Corp");
    assert.equal(customer.countryCode, "GB");
    assert.equal(customer.status, "active");
    assert.ok(customer.createdAt);
  });
});

test("idempotency: same key + same body → same customer returned (no duplicate)", async () => {
  await withServer(async (client) => {
    const first = await client.createCustomer(
      { legalName: "Idempotent Corp" },
      "idem-test-same-body",
    );
    const second = await client.createCustomer(
      { legalName: "Idempotent Corp" },
      "idem-test-same-body",
    );
    assert.equal(first.id, second.id, "same customer returned on duplicate key+body");
  });
});

test("idempotency: same key + different body → GranvilleApiError(409, IDEMPOTENCY_CONFLICT)", async () => {
  await withServer(async (client) => {
    await client.createCustomer({ legalName: "Original Name" }, "idem-conflict-key");

    await assert.rejects(
      () => client.createCustomer({ legalName: "Different Name" }, "idem-conflict-key"),
      (err: unknown) => {
        assert.ok(err instanceof GranvilleApiError, "should be GranvilleApiError");
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, "IDEMPOTENCY_CONFLICT");
        return true;
      },
    );
  });
});

test("createPayment + submitPayment returns typed PaymentOrder", async () => {
  await withServer(async (client, controllers) => {
    const customer = await client.createCustomer({ legalName: "Payment SDK Test" });
    const binding = controllers.api.store.getMockProviderBinding();
    const account = await client.createPaymentAccount({
      customerId: customer.id,
      providerBindingId: binding.id,
    });
    const payment = await client.createPayment({
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "5000",
      asset: "GBP/2",
    });
    assert.ok(payment.id);
    assert.equal(payment.status, "created");

    const submitted = await client.submitPayment(payment.id);
    assert.ok(submitted.id);
    assert.equal(submitted.id, payment.id);
    assert.ok(submitted.status !== "created", "status should have advanced");
  });
});

test("unknown customer ID → GranvilleApiError(404, NOT_FOUND)", async () => {
  await withServer(async (client) => {
    await assert.rejects(
      () => client.getCustomer("00000000-0000-0000-0000-000000000000"),
      (err: unknown) => {
        assert.ok(err instanceof GranvilleApiError);
        assert.equal(err.statusCode, 404);
        assert.equal(err.code, "NOT_FOUND");
        return true;
      },
    );
  });
});

test("unauthenticated request → GranvilleApiError(401, UNAUTHORIZED)", async () => {
  const controllers = new GranvilleHttpControllers(undefined, TEST_TOKENS);
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const unauthClient = new GranvilleClient({
    baseUrl: `http://localhost:${port}`,
    token: "invalid-token",
  });
  try {
    await assert.rejects(
      () => unauthClient.getCustomer("any-id"),
      (err: unknown) => {
        assert.ok(err instanceof GranvilleApiError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "FORBIDDEN");
        return true;
      },
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});

test("POST /webhooks/:provider bypasses Bearer auth and returns 202", async () => {
  const controllers = new GranvilleHttpControllers(undefined, TEST_TOKENS);
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const baseUrl = `http://localhost:${port}`;

  // Use the SDK client (with auth) to create a payment and get a provider reference.
  const authClient = new GranvilleClient({ baseUrl, token: "test-admin" });
  const customer = await authClient.createCustomer({ legalName: "Webhook Bypass Test" });
  const account = await authClient.createPaymentAccount({ customerId: customer.id });
  const payment = await authClient.createPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "100",
    asset: "GBP/2",
  });
  await authClient.submitPayment(payment.id);
  await controllers.api.providerRuntime.drain();

  const attempt = [...controllers.api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  const ref = attempt?.providerReference ?? attempt?.providerTransactionId ?? "dummy-ref";

  try {
    // POST to /webhooks/mock-emi WITHOUT an Authorization header.
    const body = JSON.stringify({ providerReference: ref, status: "completed" });
    const res = await fetch(`${baseUrl}/webhooks/mock-emi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    assert.equal(res.status, 202, "webhook endpoint should return 202 without auth");

    const event = [...controllers.api.store.webhooks.values()].at(-1);
    assert.ok(event, "webhook event should be stored");
    assert.equal(event?.processingStatus, "queued");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});

function seedAirwallexBinding(
  store: GranvilleHttpControllers["api"]["store"],
  webhookSecret?: string,
) {
  const id = randomUUID();
  const providerId = randomUUID();
  const now = new Date().toISOString();
  store.providers.set(providerId, {
    id: providerId,
    code: "airwallex",
    displayName: "Airwallex",
    kind: "emi",
    stage: "aw1",
    active: true,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  });
  store.providerBindings.set(id, {
    id,
    providerId,
    bindingKind: "native_emi",
    adapterKey: "airwallex",
    active: true,
    config: webhookSecret ? { webhookSecret } : {},
    metadata: {},
    createdAt: now,
    updatedAt: now,
  });
  store.setProviderHealth(id, "healthy");
}

test("POST /webhooks/airwallex accepts valid HMAC signature without Bearer token", async () => {
  const controllers = new GranvilleHttpControllers(undefined, TEST_TOKENS);
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const baseUrl = `http://localhost:${port}`;

  const secret = "test-webhook-secret-abc123";
  seedAirwallexBinding(controllers.api.store, secret);

  const ts = Date.now().toString();
  const body = JSON.stringify({
    name: "payout.transfer.paid",
    data: { transfer: { id: "aw-tx-001", request_id: "aw-ref-001", status: "PAID" } },
  });
  const sig = createHmac("sha256", secret).update(`${ts}${body}`).digest("hex");

  try {
    const res = await fetch(`${baseUrl}/webhooks/airwallex`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-timestamp": ts,
        "x-signature": sig,
      },
      body,
    });
    assert.equal(res.status, 202, "valid HMAC webhook should return 202");

    const event = [...controllers.api.store.webhooks.values()].at(-1);
    assert.ok(event, "webhook event should be stored");
    assert.equal(event?.signatureValid, true, "signature should be marked valid");
    assert.equal(
      event?.processingStatus,
      "queued",
      "valid webhook should be queued for processing",
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});

test("POST /webhooks/airwallex with bad signature stores event as ignored", async () => {
  const controllers = new GranvilleHttpControllers(undefined, TEST_TOKENS);
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;

  const secret = "correct-secret";
  seedAirwallexBinding(controllers.api.store, secret);

  const ts = Date.now().toString();
  const body = JSON.stringify({ name: "payout.transfer.paid", data: {} });

  try {
    const res = await fetch(`http://localhost:${port}/webhooks/airwallex`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-timestamp": ts,
        "x-signature": "badsignature",
      },
      body,
    });
    assert.equal(res.status, 202, "invalid HMAC should still return 202 (not rejected at HTTP)");

    const event = [...controllers.api.store.webhooks.values()].at(-1);
    assert.ok(event, "webhook event should be stored even with bad signature");
    assert.equal(event?.signatureValid, false, "signature should be marked invalid");
    assert.equal(event?.processingStatus, "ignored", "bad-signature webhook should be ignored");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});

test("admin:read-only token cannot createCustomer → GranvilleApiError(403, FORBIDDEN)", async () => {
  const controllers = new GranvilleHttpControllers(undefined, TEST_TOKENS);
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const operatorClient = new GranvilleClient({
    baseUrl: `http://localhost:${port}`,
    token: "test-operator",
  });
  try {
    await assert.rejects(
      () => operatorClient.createCustomer({ legalName: "Should Fail" }),
      (err: unknown) => {
        assert.ok(err instanceof GranvilleApiError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "FORBIDDEN");
        return true;
      },
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});
