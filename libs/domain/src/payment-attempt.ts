import type { CanonicalPaymentStatus } from "./payment-order.ts";

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
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}
