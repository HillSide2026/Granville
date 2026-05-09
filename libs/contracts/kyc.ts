export const kycStatuses = [
  "not_started",
  "pending",
  "approved",
  "rejected",
  "needs_review",
] as const;

export type KycStatus = (typeof kycStatuses)[number];

export interface KycRecord {
  id: string;
  customerId: string;
  providerName: string;
  providerReference?: string;
  status: KycStatus;
  submittedAt?: string;
  completedAt?: string;
  rawResult: Record<string, unknown>;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
