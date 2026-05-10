import assert from "node:assert/strict";
import test from "node:test";
import { GranvilleApi } from "../../apps/api/src/granville-api.ts";
import { LedgerWriter } from "../../apps/ledger-writer/src/ledger-writer.ts";

test("duplicate provider results do not create duplicate ledger postings", async () => {
  const api = new GranvilleApi();
  const customer = api.postCustomer({ legalName: "Ledger Customer", countryCode: "GB" });
  const account = api.postPaymentAccount({ customerId: customer.id, countryCode: "GB" });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "500",
    asset: "GBP/2",
  });

  const submission = api.orchestrator.submitPayment(payment.id);
  await api.providerRuntime.executePaymentAttempt(submission.attempt.id);
  await api.providerRuntime.executePaymentAttempt(submission.attempt.id);
  api.ledgerWriter.postPending();
  api.ledgerWriter.postPending();

  assert.equal(api.store.providerTransactions.size, 1);
  assert.equal(api.store.ledgerQueue.size, 1);
  assert.equal([...api.store.ledgerQueue.values()][0]?.status, "posted");
  assert.equal(
    api.store.ledgerPostingAttempts.get([...api.store.ledgerQueue.keys()][0])?.length,
    1,
  );
});

test("ledger writer can replay failed postings with deterministic transaction ids", async () => {
  const api = new GranvilleApi();
  const customer = api.postCustomer({ legalName: "Replay Customer", countryCode: "GB" });
  const account = api.postPaymentAccount({ customerId: customer.id, countryCode: "GB" });
  const payment = api.postPayment({
    customerId: customer.id,
    paymentAccountId: account.id,
    amount: "750",
    asset: "GBP/2",
  });
  await api.submitPayment(payment.id);

  const writer = new LedgerWriter(api.store);
  const item = [...api.store.ledgerQueue.values()][0];
  api.store.resetLedgerPosting(item.id);
  writer.postPending({ failIds: new Set([item.id]) });
  assert.equal(api.store.ledgerQueue.get(item.id)?.status, "failed");

  const replayed = writer.replay(item.id);
  assert.equal(api.store.ledgerQueue.get(item.id)?.status, "posted");
  assert.equal(replayed[0]?.formanceTransactionId, item.result?.formanceTransactionId);
});
