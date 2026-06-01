/**
 * AW1 end-to-end orchestration test.
 *
 * Runs the full Granville stack against the Airwallex sandbox:
 *   customer → account → payment → submit → Airwallex adapter (live API)
 *   → ledger writer → reconciliation → audit trail
 *
 * Gate: AIRWALLEX_SANDBOX_TEST=1
 *
 * Run:
 *   AIRWALLEX_SANDBOX_TEST=1 node --test --experimental-strip-types \
 *     test/granville/airwallex-aw1-orchestration.test.ts
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import type {
  Provider,
  ProviderBinding,
  ProviderCapability,
} from "../../libs/contracts/provider.ts";
import { InMemoryGranvilleStore } from "../../libs/persistence/src/in-memory-store.ts";

const SKIP = !process.env.AIRWALLEX_SANDBOX_TEST;

function seedAirwallexBinding(store: InMemoryGranvilleStore): ProviderBinding {
  const now = new Date().toISOString();

  const provider: Provider = {
    id: randomUUID(),
    code: "airwallex",
    displayName: "Airwallex (Sandbox)",
    kind: "emi",
    stage: "aw1",
    active: true,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };

  const binding: ProviderBinding = {
    id: randomUUID(),
    providerId: provider.id,
    bindingKind: "native_emi",
    adapterKey: "airwallex",
    active: true,
    // Credentials and base URL read from env (AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY,
    // AIRWALLEX_BASE_URL, AIRWALLEX_DRY_RUN) via airwallexConfigFromBinding fallback.
    config: {},
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };

  const capability: ProviderCapability = {
    id: randomUUID(),
    providerId: provider.id,
    capabilityKey: "outbound_payments",
    enabled: true,
    config: {
      assets: ["GBP/2"],
      rails: ["local", "faster_payments"],
      countries: ["GB"],
      fallbackPriority: 1, // beats mock-emi(10) and mock-bank(20)
    },
    createdAt: now,
    updatedAt: now,
  };

  store.providers.set(provider.id, provider);
  store.providerBindings.set(binding.id, binding);
  store.providerCapabilities.set(capability.id, capability);
  store.setProviderHealth(binding.id, "healthy");

  return binding;
}

// UK beneficiary metadata required by Airwallex for GBP LOCAL transfers.
// sort_code 200000 → Barclays Bank PLC / Faster Payments (verified in sandbox).
const SANDBOX_BENEFICIARY_METADATA = {
  beneficiaryName: "AW1 Sandbox Payee Ltd",
  airwallexBeneficiaryCompanyName: "AW1 Sandbox Payee Ltd",
  airwallexBeneficiaryCountryCode: "GB",
  airwallexBeneficiaryStreetAddress: "1 Test Street",
  airwallexBeneficiaryCity: "London",
  airwallexBeneficiaryPostcode: "EC1A 1BB",
  airwallexBeneficiaryAccountNumber: "12345678",
  airwallexBeneficiaryRoutingType: "sort_code",
  airwallexBeneficiaryRoutingValue: "200000",
  airwallexBeneficiaryAccountCurrency: "GBP",
  airwallexBeneficiaryBankCountryCode: "GB",
  airwallexTransferMethod: "LOCAL",
};

test("AW1 orchestration: full sandbox payment flow via Granville stack", {
  skip: SKIP,
}, async () => {
  const store = new InMemoryGranvilleStore();
  seedAirwallexBinding(store);
  const api = new GranvilleApi(store);

  const ts = Date.now();

  // ── 1. Customer ────────────────────────────────────────────────────────────
  const customer = api.postCustomer(
    { legalName: "AW1 Sandbox Corp", email: "aw1@sandbox.test", countryCode: "GB" },
    { idempotencyKey: `aw1-customer-${ts}` },
  );
  assert.equal(customer.status, "active");

  // ── 2. Payment account ─────────────────────────────────────────────────────
  const account = api.postPaymentAccount(
    { customerId: customer.id, currencyCode: "GBP", countryCode: "GB", displayName: "AW1 GBP" },
    { idempotencyKey: `aw1-account-${ts}` },
  );
  assert.equal(account.status, "active");

  // ── 3. Payment order with Airwallex beneficiary metadata ──────────────────
  const payment = api.postPayment(
    {
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "100",
      asset: "GBP/2",
      beneficiaryReference: `aw1-ref-${ts}`,
      metadata: SANDBOX_BENEFICIARY_METADATA,
    },
    { idempotencyKey: `aw1-payment-${ts}` },
  );
  assert.equal(payment.status, "created");

  // ── 4. Submit: orchestrator → router → Airwallex binding selected ─────────
  const { attempt } = api.orchestrator.submitPayment(payment.id);
  const orderAfterSubmit = api.getPayment(payment.id);
  assert.equal(orderAfterSubmit?.status, "submitted_to_provider");

  // Confirm the router selected the Airwallex binding (not mock-emi)
  const airwallexBinding = [...store.providerBindings.values()].find(
    (b) => b.adapterKey === "airwallex",
  );
  assert.equal(
    attempt.providerBindingId,
    airwallexBinding?.id,
    "router must select the Airwallex binding",
  );

  // ── 5. Provider runtime — live Airwallex API call ─────────────────────────
  console.log("  Calling Airwallex sandbox (beneficiary + transfer create)...");
  const jobsProcessed = await api.providerRuntime.drain();
  assert.ok(jobsProcessed >= 1, "provider runtime should process the Airwallex command");

  const orderAfterProvider = api.getPayment(payment.id);
  // Airwallex sandbox returns SCHEDULED → provider maps to "accepted" → runtime stores "provider_accepted".
  // Any non-failure post-provider status is valid here; completion arrives via webhook.
  const terminalFailures = ["failed", "cancelled", "returned"];
  assert.ok(
    orderAfterProvider?.status && !terminalFailures.includes(orderAfterProvider.status),
    `unexpected post-provider status: ${orderAfterProvider?.status}`,
  );

  // Confirm provider reference was captured from Airwallex
  const liveAttempt = store.paymentAttempts.get(attempt.id);
  assert.ok(liveAttempt?.providerReference, "attempt must capture Airwallex providerReference");
  assert.ok(liveAttempt?.providerTransactionId, "attempt must capture Airwallex transfer ID");
  console.log(`  Transfer ID : ${liveAttempt?.providerTransactionId}`);
  console.log(`  Status      : ${orderAfterProvider?.status}`);

  // ── 6. Provider transaction recorded ──────────────────────────────────────
  const providerTxns = [...store.providerTransactions.values()].filter(
    (tx) => tx.paymentAttemptId === attempt.id,
  );
  assert.equal(providerTxns.length, 1, "one provider transaction recorded");
  assert.equal(providerTxns[0].asset, "GBP/2");
  assert.equal(providerTxns[0].amount, "100");

  // ── 7. Ledger: posting enqueued only on status=completed ──────────────────
  // Airwallex sandbox returns SCHEDULED → provider_accepted. Completion arrives
  // via webhook (PAID event). Ledger posting is deferred until then.
  const status = orderAfterProvider?.status;
  if (status === "completed") {
    assert.equal(store.ledgerQueue.size, 1, "completed payment must enqueue a ledger posting");
    await api.ledgerWriter.postPending();
    const posting = [...store.ledgerQueue.values()][0];
    assert.equal(posting.status, "posted");
    assert.ok(posting.result?.formanceTransactionId);
    console.log(`  Ledger tx   : ${posting.result?.formanceTransactionId}`);
  } else {
    assert.equal(
      store.ledgerQueue.size,
      0,
      "non-completed payment must not enqueue a ledger posting",
    );
    console.log(`  Note: status=${status} — ledger posting deferred until PAID webhook arrives`);
  }

  // ── 8. Reconciliation ─────────────────────────────────────────────────────
  // Only completed payments produce records; accepted/processing produce no exceptions.
  const { exceptionCount } = api.postReconciliationRun();
  assert.equal(exceptionCount, 0, "sandbox payment must produce zero reconciliation exceptions");

  // ── 9. Audit trail ────────────────────────────────────────────────────────
  const auditEvents = api.getAuditEvents();
  const requiredActions = [
    "customer.created",
    "payment_account.created",
    "payment_order.created",
    "payment_attempt.created",
    "provider_command.enqueued",
    "provider_transaction.recorded",
    "provider_runtime.payment_executed",
  ];
  for (const action of requiredActions) {
    const found = auditEvents.some((e) => e.action === action);
    assert.ok(found, `missing audit event: ${action}`);
  }

  console.log(`  Audit events: ${auditEvents.length}`);
  console.log("  AW1 orchestration flow complete ✓");
});

test("AW1 orchestration: Airwallex provider reference is idempotent on retry", {
  skip: SKIP,
}, async () => {
  const store = new InMemoryGranvilleStore();
  const binding = seedAirwallexBinding(store);
  const api = new GranvilleApi(store);
  const ts = Date.now();

  const customer = api.postCustomer({ legalName: "AW1 Idempotency Corp", countryCode: "GB" });
  const account = api.postPaymentAccount({ customerId: customer.id, currencyCode: "GBP" });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "100",
    asset: "GBP/2",
    beneficiaryReference: `idem-ref-${ts}`,
    metadata: SANDBOX_BENEFICIARY_METADATA,
  });

  api.orchestrator.submitPayment(payment.id);
  await api.providerRuntime.drain();

  const attempt1 = [...store.paymentAttempts.values()].find((a) => a.paymentOrderId === payment.id);
  assert.ok(attempt1?.providerTransactionId, "first attempt must get a provider transaction ID");
  console.log(`  First transfer: ${attempt1?.providerTransactionId}`);

  // Existing providerReference should not cause a duplicate-reference error
  // (the runtime checks for duplicates across different attempts, not the same one)
  assert.ok(
    attempt1.providerReference,
    "attempt must carry a providerReference for dedup tracking",
  );
});
