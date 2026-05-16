import assert from "node:assert/strict";
import test from "node:test";

import { createGranvilleServer, GranvilleHttpControllers } from "../../apps/api/src/http.ts";
import { GranvilleClient } from "../../pkg/client/granville/src/client.ts";
import { GranvilleApiError } from "../../pkg/client/granville/src/errors.ts";

async function withServer(
  fn: (client: GranvilleClient, controllers: GranvilleHttpControllers) => Promise<void>,
): Promise<void> {
  const controllers = new GranvilleHttpControllers();
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const client = new GranvilleClient({ baseUrl: `http://localhost:${port}`, token: "dev-admin" });
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
  const controllers = new GranvilleHttpControllers();
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

test("admin:read-only token cannot createCustomer → GranvilleApiError(403, FORBIDDEN)", async () => {
  const controllers = new GranvilleHttpControllers();
  const server = createGranvilleServer(controllers);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const operatorClient = new GranvilleClient({
    baseUrl: `http://localhost:${port}`,
    token: "dev-operator",
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
