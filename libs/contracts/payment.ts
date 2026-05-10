import type { Money } from "./account.ts";

export const canonicalPaymentStatuses = [
  "created",
  "pending_review",
  "submitted_to_provider",
  "provider_accepted",
  "processing",
  "completed",
  "failed",
  "returned",
  "cancelled",
] as const;

export type CanonicalPaymentStatus =
  (typeof canonicalPaymentStatuses)[number];

export const paymentDirections = ["outbound", "inbound"] as const;

export type PaymentDirection = (typeof paymentDirections)[number];

export const paymentTransactionTypes = [
  "payment",
  "refund",
  "payout",
  "transfer",
] as const;

export type PaymentTransactionType =
  (typeof paymentTransactionTypes)[number];

export interface PaymentOrder {
  id: string;
  customerId: string;
  paymentAccountId: string;
  direction: PaymentDirection;
  transactionType: PaymentTransactionType;
  amount: Money;
  beneficiaryReference?: string;
  providerReference?: string;
  status: CanonicalPaymentStatus;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface PaymentAttempt {
  id: string;
  paymentOrderId: string;
  providerBindingId: string;
  attemptNumber: number;
  status: CanonicalPaymentStatus;
  providerRequestId?: string;
  providerTransactionId?: string;
  providerReference?: string;
  routeSnapshot: Record<string, unknown>;
  lastError?: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}
