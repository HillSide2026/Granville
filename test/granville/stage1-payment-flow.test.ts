import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";

test("Milestone 1 mock EMI payment flow", async () => {
  const api = new GranvilleApi();

  const customer = api.postCustomer(
    {
      legalName: "Ada Lovelace",
      email: "ada@example.com",
      countryCode: "GB",
    },
    { idempotencyKey: "customer-ada" },
  );
  const duplicateCustomer = api.postCustomer(
    {
      legalName: "Ada Lovelace",
      email: "ada@example.com",
      countryCode: "GB",
    },
    { idempotencyKey: "customer-ada" },
  );
  assert.equal(duplicateCustomer.id, customer.id);

  const account = api.postPaymentAccount(
    {
      customerId: customer.id,
      currencyCode: "GBP",
      countryCode: "GB",
      displayName: "Ada GBP Account",
    },
    { idempotencyKey: "account-ada-gbp" },
  );

  const payment = api.postPayment(
    {
      customerId: customer.id,
      paymentAccountId: account.id,
      amount: "2500",
      asset: "GBP/2",
      beneficiaryReference: "invoice-1001",
    },
    { idempotencyKey: "payment-invoice-1001" },
  );

  const completedPayment = await api.submitPayment(payment.id);
  assert.equal(completedPayment.status, "completed");
  assert.equal(api.getPaymentStatus(payment.id)?.status, "completed");
  assert.equal(api.store.providerTransactions.size, 1);
  assert.equal(api.store.ledgerQueue.size, 1);
  assert.equal([...api.store.ledgerQueue.values()][0]?.status, "posted");

  const reconciliation = api.postReconciliationRun();
  assert.equal(reconciliation.exceptionCount, 0);
  assert.equal(api.getReconciliationExceptions().length, 0);
  assert.ok(api.getAuditEvents().length >= 8);
});
