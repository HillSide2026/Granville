import type { CanonicalPaymentStatus } from "../../contracts/payment.ts";

export const providerStatusToPaymentStatus: Record<string, CanonicalPaymentStatus> = {
  accepted: "provider_accepted",
  processing: "processing",
  completed: "completed",
  failed: "failed",
  returned: "returned",
  cancelled: "cancelled",
};
