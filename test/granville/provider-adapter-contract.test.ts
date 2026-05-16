import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderBinding } from "../../libs/contracts/provider.ts";
import { ProviderAdapterRegistry } from "../../libs/provider-adapters/adapter-registry.ts";

const registry = new ProviderAdapterRegistry();

for (const adapterKey of [
  "mock-emi",
  "mock-bank",
  "native-emi",
  "airwallex",
  "formance-payments",
]) {
  test(`adapter contract: ${adapterKey}`, async () => {
    const provider = registry.resolve(binding(adapterKey));
    const customer = await provider.createCustomer({
      granvilleCustomerId: `customer-${adapterKey}`,
      legalName: "Contract Customer",
      countryCode: "GB",
    });
    assert.equal(customer.granvilleCustomerId, `customer-${adapterKey}`);

    const account = await provider.openPaymentAccount({
      granvilleCustomerId: customer.granvilleCustomerId,
      granvillePaymentAccountId: `account-${adapterKey}`,
      currencyCode: "GBP",
      countryCode: "GB",
    });
    assert.equal(account.granvillePaymentAccountId, `account-${adapterKey}`);

    const payment = await provider.initiatePayment({
      granvillePaymentOrderId: `payment-${adapterKey}`,
      granvillePaymentAttemptId: `attempt-${adapterKey}`,
      granvillePaymentAccountId: account.granvillePaymentAccountId ?? account.providerAccountId,
      amount: "100",
      asset: "GBP/2",
    });
    assert.ok(payment.providerTransactionId);

    const transaction = await provider.getTransaction(payment.providerTransactionId);
    assert.equal(transaction.providerTransactionId, payment.providerTransactionId);

    const transactions = await provider.listTransactions(
      account.providerAccountId,
      new Date(0),
      new Date(),
    );
    assert.ok(Array.isArray(transactions));

    const balance = await provider.getBalance(account.providerAccountId);
    assert.equal(balance.providerAccountId, account.providerAccountId);
  });
}

function binding(adapterKey: string): ProviderBinding {
  return {
    id: `binding-${adapterKey}`,
    providerId: `provider-${adapterKey}`,
    bindingKind: adapterKey === "formance-payments" ? "formance_payments" : "mock",
    adapterKey,
    formanceConnectorId: `connector-${adapterKey}`,
    active: true,
    config: adapterKey === "airwallex" ? { dryRun: true } : {},
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
