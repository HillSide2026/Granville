import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleApi } from "../../apps/api/src/granville-api.ts";

test("same payment command can route through EMI or bank provider without model changes", async () => {
  const emiApi = new GranvilleApi();
  const emiCustomer = emiApi.postCustomer({ legalName: "EMI Customer", countryCode: "GB" });
  const emiAccount = emiApi.postPaymentAccount({
    customerId: emiCustomer.id,
    currencyCode: "GBP",
    countryCode: "GB",
  });
  const emiPayment = emiApi.postPayment({
    customerId: emiCustomer.id,
    paymentAccountId: emiAccount.id,
    amount: "1000",
    asset: "GBP/2",
  });
  await emiApi.submitPayment(emiPayment.id);
  const emiAttempt = [...emiApi.store.paymentAttempts.values()][0];
  assert.equal(
    emiApi.store.providerBindings.get(emiAttempt.providerBindingId)?.adapterKey,
    "mock-emi",
  );

  const bankApi = new GranvilleApi();
  bankApi.setProviderHealthForTest("mock-emi", "disabled");
  const bankCustomer = bankApi.postCustomer({ legalName: "Bank Customer", countryCode: "US" });
  const bankAccount = bankApi.postPaymentAccount({
    customerId: bankCustomer.id,
    currencyCode: "USD",
    countryCode: "US",
  });
  const bankPayment = bankApi.postPayment({
    customerId: bankCustomer.id,
    paymentAccountId: bankAccount.id,
    amount: "1000",
    asset: "USD/2",
  });
  await bankApi.submitPayment(bankPayment.id);
  const bankAttempt = [...bankApi.store.paymentAttempts.values()][0];
  assert.equal(
    bankApi.store.providerBindings.get(bankAttempt.providerBindingId)?.adapterKey,
    "mock-bank",
  );
  assert.equal(bankApi.getPayment(bankPayment.id)?.status, "completed");
});
