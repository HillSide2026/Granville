import assert from "node:assert/strict";
import test from "node:test";

import type { ProviderBinding } from "../../libs/contracts/provider.ts";
import {
  AirwallexClient,
  AirwallexEmiProvider,
  airwallexConfigFromBinding,
} from "../../libs/provider-adapters/airwallex/index.ts";

test("airwallexConfigFromBinding prefers binding config over defaults", () => {
  const config = airwallexConfigFromBinding({
    ...binding(),
    config: {
      baseUrl: "https://example.airwallex.test/",
      clientId: "client-from-config",
      apiKey: "key-from-config",
      loginAs: "acct-from-config",
      dryRun: false,
    },
  });

  assert.equal(config.baseUrl, "https://example.airwallex.test");
  assert.equal(config.clientId, "client-from-config");
  assert.equal(config.apiKey, "key-from-config");
  assert.equal(config.loginAs, "acct-from-config");
  assert.equal(config.dryRun, false);
});

test("AirwallexClient authenticate posts client credentials as headers", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const client = new AirwallexClient(
    {
      baseUrl: "https://api-demo.airwallex.com",
      clientId: "client-id",
      apiKey: "api-key",
      loginAs: "account-id",
      dryRun: true,
    },
    async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(
        JSON.stringify({ token: "token-123", expires_at: "2999-01-01T00:00:00Z" }),
        { status: 200 },
      );
    },
  );

  const token = await client.authenticate();

  assert.equal(token.token, "token-123");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api-demo.airwallex.com/api/v1/authentication/login");
  assert.equal(requests[0].init?.method, "POST");
  assert.deepEqual(requests[0].init?.headers, {
    "Content-Type": "application/json",
    "x-client-id": "client-id",
    "x-api-key": "api-key",
    "x-login-as": "account-id",
  });

  await client.authenticate();
  assert.equal(requests.length, 1, "token is cached until expiry");
});

test("AirwallexEmiProvider creates beneficiary and payout in live mode", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const provider = new AirwallexEmiProvider(
    new AirwallexClient(
      {
        baseUrl: "https://api-demo.airwallex.com",
        clientId: "client-id",
        apiKey: "api-key",
        dryRun: false,
      },
      async (url, init) => {
        requests.push({ url: String(url), init });
        if (String(url).endsWith("/authentication/login")) {
          return new Response(JSON.stringify({ token: "token-123" }), { status: 200 });
        }
        if (String(url).endsWith("/beneficiaries/create")) {
          return new Response(JSON.stringify({ id: "bene-123" }), { status: 200 });
        }
        return new Response(
          JSON.stringify({
            id: "tr-123",
            request_id: "attempt-1",
            status: "SCHEDULED",
          }),
          { status: 200 },
        );
      },
    ),
  );

  const result = await provider.initiatePayment({
    granvillePaymentOrderId: "payment-1",
    granvillePaymentAttemptId: "attempt-1",
    granvillePaymentAccountId: "account-1",
    amount: "100",
    asset: "GBP/2",
    metadata: {
      beneficiaryName: "Sandbox Beneficiary",
      airwallexBeneficiaryAccountNumber: "12345678",
      airwallexBeneficiaryRoutingType: "sort_code",
      airwallexBeneficiaryRoutingValue: "010203",
    },
  });

  assert.equal(result.providerTransactionId, "tr-123");
  assert.equal(result.providerReference, "attempt-1");
  assert.equal(result.status, "accepted");
  assert.equal(result.metadata.airwallexBeneficiaryId, "bene-123");
  assert.equal(requests.length, 3);
});

function binding(): ProviderBinding {
  return {
    id: "binding-airwallex",
    providerId: "provider-airwallex",
    bindingKind: "native_emi",
    adapterKey: "airwallex",
    active: true,
    config: {},
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
