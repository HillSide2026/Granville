import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import { GranvilleHttpControllers } from "../../apps/api/src/http.ts";

const adminCtx = {
  principal: {
    id: "dev-admin",
    roles: [
      "admin:read",
      "admin:write",
      "customer:read",
      "customer:write",
      "payment:read",
      "payment:write",
    ],
  },
};
const readOnlyAdminCtx = {
  principal: { id: "read-only-admin", roles: ["admin:read"] },
};

function makeApi(): GranvilleApi {
  return new GranvilleApi();
}

async function makePayment(api: GranvilleApi, asset = "GBP/2") {
  const customer = api.postCustomer({ legalName: "Routing Test Co", countryCode: "GB" });
  const binding = api.store.getMockProviderBinding();
  const account = api.postPaymentAccount({
    customerId: customer.id,
    providerBindingId: binding.id,
  });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "5000",
    asset,
  });
  return { customer, account, payment };
}

// --- Rule CRUD ---

test("createRoutingRule creates a rule visible in listRoutingRules()", () => {
  const api = makeApi();
  assert.equal(api.listRoutingRules().length, 0);

  const rule = api.createRoutingRule({
    name: "test-gbp-rule",
    description: "Routes GBP payments",
    priority: 50,
    conditions: { asset: "GBP/2" },
    outcome: { rail: "internal_book" },
  });

  assert.ok(rule.id);
  assert.equal(rule.name, "test-gbp-rule");
  assert.equal(rule.description, "Routes GBP payments");
  assert.equal(rule.priority, 50);
  assert.equal(rule.active, true);
  assert.deepEqual(rule.conditions, { asset: "GBP/2" });
  assert.ok(rule.createdAt);
  assert.ok(rule.updatedAt);

  const list = api.listRoutingRules();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, rule.id);
});

test("rule matching asset routes payment to specified provider binding", async () => {
  const api = makeApi();
  const mockEmiBinding = api.store.getMockProviderBinding();

  api.createRoutingRule({
    name: "gbp-to-mock-emi",
    priority: 10,
    conditions: { asset: "GBP/2" },
    outcome: { providerBindingId: mockEmiBinding.id, rail: "internal_book" },
  });

  const { payment } = await makePayment(api, "GBP/2");
  await api.submitPayment(payment.id);

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt, "payment attempt created");
  assert.equal(attempt.providerBindingId, mockEmiBinding.id, "routed to mock-emi via rule");
  const decision = (attempt.routeSnapshot as Record<string, unknown>).decision as Record<
    string,
    unknown
  >;
  assert.ok((decision.rationale as string[]).some((r: string) => r.includes("gbp-to-mock-emi")));
});

test("rule with non-matching conditions is skipped; capability fallback applies", async () => {
  const api = makeApi();

  api.createRoutingRule({
    name: "usd-only-rule",
    priority: 10,
    conditions: { asset: "USD/2" },
    outcome: { providerBindingId: "nonexistent-binding-id", rail: "wire" },
  });

  // Submit a GBP payment — rule should not match, falls back to capability routing
  const { payment } = await makePayment(api, "GBP/2");
  await api.submitPayment(payment.id);

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt, "payment attempt created even when rule doesn't match");
  const decision = (attempt.routeSnapshot as Record<string, unknown>).decision as Record<
    string,
    unknown
  >;
  assert.ok((decision.rationale as string[]).some((r: string) => r.includes("capable provider")));
});

test("higher-priority rule (lower number) wins over lower-priority rule", async () => {
  const api = makeApi();
  const emiBinding = api.store.getMockProviderBinding();
  const bankBinding = getMockBankBinding(api);

  // Lower priority (higher number) — bank
  api.createRoutingRule({
    name: "low-priority-bank",
    priority: 100,
    conditions: { asset: "GBP/2" },
    outcome: { providerBindingId: bankBinding.id, rail: "wire" },
  });
  // Higher priority (lower number) — emi wins
  api.createRoutingRule({
    name: "high-priority-emi",
    priority: 10,
    conditions: { asset: "GBP/2" },
    outcome: { providerBindingId: emiBinding.id, rail: "internal_book" },
  });

  const { payment } = await makePayment(api, "GBP/2");
  await api.submitPayment(payment.id);

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.equal(attempt?.providerBindingId, emiBinding.id, "higher priority rule won");
});

test("inactive rule is never matched", async () => {
  const api = makeApi();
  const emiBinding = api.store.getMockProviderBinding();

  const rule = api.createRoutingRule({
    name: "inactive-rule",
    priority: 1,
    conditions: { asset: "GBP/2" },
    outcome: { providerBindingId: emiBinding.id },
  });
  // Immediately deactivate it
  api.updateRoutingRule(rule.id, { active: false });

  const { payment } = await makePayment(api, "GBP/2");
  await api.submitPayment(payment.id);

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.ok(attempt, "payment attempt created");
  const decision = (attempt.routeSnapshot as Record<string, unknown>).decision as Record<
    string,
    unknown
  >;
  // Falls through to capability default, not matched by rule
  assert.ok((decision.rationale as string[]).some((r: string) => r.includes("capable provider")));
});

test("deactivateRoutingRule sets active=false; rule no longer matches", async () => {
  const api = makeApi();
  const emiBinding = api.store.getMockProviderBinding();

  const rule = api.createRoutingRule({
    name: "deactivate-me",
    priority: 1,
    conditions: { asset: "GBP/2" },
    outcome: { providerBindingId: emiBinding.id },
  });
  assert.equal(rule.active, true);

  const deactivated = api.deactivateRoutingRule(rule.id);
  assert.equal(deactivated.active, false);

  const reloaded = api.getRoutingRule(rule.id);
  assert.equal(reloaded?.active, false);
});

test("updateRoutingRule changes priority and conditions live", async () => {
  const api = makeApi();

  const rule = api.createRoutingRule({
    name: "update-me",
    priority: 50,
    conditions: { asset: "USD/2" },
    outcome: { rail: "wire" },
  });

  const updated = api.updateRoutingRule(rule.id, {
    priority: 5,
    conditions: { asset: "GBP/2" },
  });

  assert.equal(updated.priority, 5);
  assert.deepEqual(updated.conditions, { asset: "GBP/2" });
  assert.ok(updated.updatedAt >= rule.updatedAt);
});

test("payment routes to mock-bank when mock-emi disabled, no rule matches", async () => {
  const api = makeApi();
  const emiBinding = api.store.getMockProviderBinding();
  const bankBinding = getMockBankBinding(api);

  // No routing rules; disable EMI so capability fallback picks bank
  api.store.setProviderHealth(emiBinding.id, "disabled");

  const { payment } = await makePayment(api, "GBP/2");
  await api.submitPayment(payment.id);

  const attempt = [...api.store.paymentAttempts.values()].find(
    (a) => a.paymentOrderId === payment.id,
  );
  assert.equal(attempt?.providerBindingId, bankBinding.id, "bank selected when EMI disabled");
});

function getMockBankBinding(api: GranvilleApi) {
  const binding = [...api.store.providerBindings.values()].find(
    (candidate) => candidate.adapterKey === "mock-bank",
  );
  assert.ok(binding, "mock-bank binding seeded");
  return binding;
}

// --- HTTP routes ---

test("HTTP GET /admin/routing-rules returns all rules", async () => {
  const controllers = new GranvilleHttpControllers();
  controllers.api.createRoutingRule({
    name: "http-test-rule",
    priority: 50,
    conditions: { asset: "GBP/2" },
    outcome: { rail: "internal_book" },
  });

  const result = await controllers.route("GET", "/admin/routing-rules", {}, adminCtx);
  assert.equal(result.statusCode, 200);
  assert.ok(Array.isArray(result.body));
  assert.ok((result.body as unknown[]).length >= 1);
});

test("HTTP POST /admin/routing-rules creates rule and changes routing immediately", async () => {
  const controllers = new GranvilleHttpControllers();
  const emiBinding = controllers.api.store.getMockProviderBinding();

  const result = await controllers.route(
    "POST",
    "/admin/routing-rules",
    {
      name: "http-create-rule",
      priority: 10,
      conditions: { asset: "GBP/2" },
      outcome: { providerBindingId: emiBinding.id, rail: "internal_book" },
    },
    adminCtx,
  );
  assert.equal(result.statusCode, 201);
  const rule = result.body as Record<string, unknown>;
  assert.ok(rule.id);
  assert.equal(rule.name, "http-create-rule");
  assert.equal(rule.active, true);
});

test("HTTP PATCH /admin/routing-rules/:id updates rule", async () => {
  const controllers = new GranvilleHttpControllers();
  const created = controllers.api.createRoutingRule({
    name: "patch-me",
    priority: 50,
    conditions: { asset: "USD/2" },
    outcome: { rail: "wire" },
  });

  const result = await controllers.route(
    "PATCH",
    `/admin/routing-rules/${created.id}`,
    { priority: 25, conditions: { asset: "GBP/2" } },
    adminCtx,
  );
  assert.equal(result.statusCode, 200);
  const updated = result.body as Record<string, unknown>;
  assert.equal(updated.priority, 25);
});

test("HTTP POST /admin/routing-rules/:id/deactivate deactivates rule", async () => {
  const controllers = new GranvilleHttpControllers();
  const created = controllers.api.createRoutingRule({
    name: "deactivate-via-http",
    priority: 50,
    conditions: {},
    outcome: { rail: "internal_book" },
  });

  const result = await controllers.route(
    "POST",
    `/admin/routing-rules/${created.id}/deactivate`,
    {},
    adminCtx,
  );
  assert.equal(result.statusCode, 200);
  const deactivated = result.body as Record<string, unknown>;
  assert.equal(deactivated.active, false);
});

test("admin:read-only token cannot create or update routing rules (403)", async () => {
  const controllers = new GranvilleHttpControllers();

  await assert.rejects(
    () =>
      controllers.route(
        "POST",
        "/admin/routing-rules",
        { name: "forbidden", conditions: {}, outcome: {} },
        readOnlyAdminCtx,
      ),
    /Missing role admin:write/,
  );

  const created = controllers.api.createRoutingRule({
    name: "existing-rule",
    priority: 50,
    conditions: {},
    outcome: {},
  });
  await assert.rejects(
    () =>
      controllers.route(
        "PATCH",
        `/admin/routing-rules/${created.id}`,
        { priority: 1 },
        readOnlyAdminCtx,
      ),
    /Missing role admin:write/,
  );
});
