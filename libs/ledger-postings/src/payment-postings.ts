import { randomUUID } from "node:crypto";

import type { LedgerPostingRequest } from "../../contracts/ledger.ts";
import type { PaymentAttempt, PaymentOrder } from "../../contracts/payment.ts";

export function paymentCompletedPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
): LedgerPostingRequest {
  return {
    id: randomUUID(),
    aggregateType: "payment_order",
    aggregateId: order.id,
    postingKey: "payment.completed",
    idempotencyKey: `payment:${order.id}:attempt:${attempt.id}:completed`,
    ledgerName: "default",
    description: "Granville accounting mirror for completed provider payment instruction",
    postings: [
      {
        source: `customers:${order.customerId}:pending`,
        destination: `providers:emi:${attempt.providerBindingId}:clearing`,
        amount: order.amount.amount,
        asset: order.amount.asset,
      },
    ],
    metadata: {
      paymentOrderId: order.id,
      paymentAttemptId: attempt.id,
      providerBindingId: attempt.providerBindingId,
    },
  };
}

export function paymentSubmittedPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
): LedgerPostingRequest {
  return paymentPosting(order, attempt, "payment.submitted", [
    {
      source: `customers:${order.customerId}:available`,
      destination: `customers:${order.customerId}:pending`,
      amount: order.amount.amount,
      asset: order.amount.asset,
    },
  ]);
}

export function paymentFailedPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
): LedgerPostingRequest {
  return paymentPosting(order, attempt, "payment.failed", [
    {
      source: `customers:${order.customerId}:pending`,
      destination: `customers:${order.customerId}:available`,
      amount: order.amount.amount,
      asset: order.amount.asset,
    },
  ]);
}

export function paymentReturnedPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
): LedgerPostingRequest {
  return paymentPosting(order, attempt, "payment.returned", [
    {
      source: `providers:emi:${attempt.providerBindingId}:settlement`,
      destination: `customers:${order.customerId}:available`,
      amount: order.amount.amount,
      asset: order.amount.asset,
    },
  ]);
}

export function paymentReversedPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
): LedgerPostingRequest {
  return paymentPosting(order, attempt, "payment.reversed", [
    {
      source: `providers:emi:${attempt.providerBindingId}:clearing`,
      destination: `customers:${order.customerId}:available`,
      amount: order.amount.amount,
      asset: order.amount.asset,
    },
  ]);
}

export function feeEarnedPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
  feeAmount: string,
): LedgerPostingRequest {
  return paymentPosting(order, attempt, "fee.earned", [
    {
      source: `granville:fees:receivable`,
      destination: `granville:fees:earned`,
      amount: feeAmount,
      asset: order.amount.asset,
    },
  ]);
}

export function reconciliationExceptionPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
): LedgerPostingRequest {
  return paymentPosting(order, attempt, "reconciliation.exception", [
    {
      source: `providers:emi:${attempt.providerBindingId}:clearing`,
      destination: "exceptions:reconciliation",
      amount: order.amount.amount,
      asset: order.amount.asset,
    },
  ]);
}

function paymentPosting(
  order: PaymentOrder,
  attempt: PaymentAttempt,
  postingKey: string,
  postings: LedgerPostingRequest["postings"],
): LedgerPostingRequest {
  return {
    id: randomUUID(),
    aggregateType: "payment_order",
    aggregateId: order.id,
    postingKey,
    idempotencyKey: `payment:${order.id}:attempt:${attempt.id}:${postingKey}`,
    ledgerName: "default",
    description: `Granville accounting mirror for ${postingKey}`,
    postings,
    metadata: {
      paymentOrderId: order.id,
      paymentAttemptId: attempt.id,
      providerBindingId: attempt.providerBindingId,
    },
  };
}
