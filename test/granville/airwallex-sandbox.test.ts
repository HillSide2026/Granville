/**
 * Airwallex sandbox acceptance tests.
 *
 * Gate: only runs when AIRWALLEX_SANDBOX_TEST=1 is set.
 *
 * Required env vars:
 *   AIRWALLEX_SANDBOX_TEST=1
 *   AIRWALLEX_CLIENT_ID   — sandbox client ID
 *   AIRWALLEX_API_KEY     — sandbox API key
 *   AIRWALLEX_BASE_URL    — https://api-demo.airwallex.com (or production equivalent)
 *
 * Run with:
 *   AIRWALLEX_SANDBOX_TEST=1 npm run test:granville -- --test-name-pattern "AW1 sandbox"
 */
import assert from "node:assert/strict";
import test from "node:test";

import { AirwallexClient, AirwallexEmiProvider } from "../../libs/provider-adapters/airwallex/index.ts";

const SKIP = !process.env.AIRWALLEX_SANDBOX_TEST;

const sandboxConfig = {
  baseUrl: (process.env.AIRWALLEX_BASE_URL ?? "https://api-demo.airwallex.com").replace(/\/+$/, ""),
  clientId: process.env.AIRWALLEX_CLIENT_ID,
  apiKey: process.env.AIRWALLEX_API_KEY,
  loginAs: process.env.AIRWALLEX_LOGIN_AS,
  dryRun: false as const,
};

test("AW1 sandbox: authenticate returns a bearer token", { skip: SKIP }, async () => {
  const client = new AirwallexClient(sandboxConfig);
  const token = await client.authenticate();
  assert.ok(token.token.length > 0, "token should be non-empty");
});

test("AW1 sandbox: list transfers returns without error", { skip: SKIP }, async () => {
  const client = new AirwallexClient(sandboxConfig);
  const transfers = await client.syncTransactions({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
  });
  assert.ok(Array.isArray(transfers), "syncTransactions should return an array");
});

test("AW1 sandbox: createCustomer pass-through returns stable reference", { skip: SKIP }, async () => {
  const provider = new AirwallexEmiProvider(new AirwallexClient(sandboxConfig));
  const result = await provider.createCustomer({
    granvilleCustomerId: "sandbox-customer-001",
    legalName: "Sandbox Test Corp",
    countryCode: "GB",
  });
  assert.equal(result.status, "active");
  assert.ok(result.providerCustomerId.includes("sandbox-customer-001"));
});

test("AW1 sandbox: openPaymentAccount encodes currency in providerAccountId", { skip: SKIP }, async () => {
  const provider = new AirwallexEmiProvider(new AirwallexClient(sandboxConfig));
  const result = await provider.openPaymentAccount({
    granvilleCustomerId: "sandbox-customer-001",
    granvillePaymentAccountId: "sandbox-account-001",
    currencyCode: "GBP",
    countryCode: "GB",
  });
  assert.equal(result.status, "active");
  assert.ok(
    result.providerAccountId.startsWith("airwallex:wallet:GBP:"),
    `expected airwallex:wallet:GBP:... prefix, got ${result.providerAccountId}`,
  );
});

test("AW1 sandbox: getBalance returns a ProviderBalance (permissions permitting)", { skip: SKIP }, async () => {
  const provider = new AirwallexEmiProvider(new AirwallexClient(sandboxConfig));
  const accountId = "airwallex:wallet:GBP:sandbox-account-001";
  try {
    const balance = await provider.getBalance(accountId);
    assert.equal(balance.providerAccountId, accountId);
    assert.equal(balance.asset, "GBP/2");
    assert.ok(balance.amount.match(/^\d+$/), "amount should be a minor-unit integer string");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unauthorized") || msg.includes("Admin permissions")) {
      console.log("  Note: balance API requires elevated permissions — skipping assertion");
    } else {
      throw err;
    }
  }
});

test("AW1 sandbox: initiate payout creates beneficiary and transfer", { skip: SKIP }, async () => {
  const provider = new AirwallexEmiProvider(new AirwallexClient(sandboxConfig));
  const ts = Date.now();
  const result = await provider.initiatePayment({
    granvillePaymentOrderId: `sandbox-order-${ts}`,
    granvillePaymentAttemptId: `sandbox-attempt-${ts}`,
    granvillePaymentAccountId: "sandbox-account-001",
    amount: "100",
    asset: "GBP/2",
    metadata: {
      beneficiaryName: "AW1 Sandbox Payee Ltd",
      airwallexBeneficiaryCompanyName: "AW1 Sandbox Payee Ltd",
      airwallexBeneficiaryCountryCode: "GB",
      // UK address — required by Airwallex for LOCAL GBP transfers
      airwallexBeneficiaryStreetAddress: "1 Test Street",
      airwallexBeneficiaryCity: "London",
      airwallexBeneficiaryPostcode: "EC1A 1BB",
      // Bank details — sort code 200000 resolves to Barclays/Faster Payments in sandbox
      airwallexBeneficiaryAccountNumber: "12345678",
      airwallexBeneficiaryRoutingType: "sort_code",
      airwallexBeneficiaryRoutingValue: "200000",
      airwallexBeneficiaryAccountCurrency: "GBP",
      airwallexBeneficiaryBankCountryCode: "GB",
      airwallexTransferMethod: "LOCAL",
    },
  });

  assert.ok(result.providerTransactionId, "should return a provider transaction ID");
  assert.ok(["accepted", "processing", "completed"].includes(result.status), `unexpected status: ${result.status}`);
  console.log(`  Transfer created: ${result.providerTransactionId} status=${result.status}`);
});
