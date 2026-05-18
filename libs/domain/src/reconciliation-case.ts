export const reconciliationCaseCategories = [
  "missing_provider_transaction",
  "missing_internal_transaction",
  "amount_mismatch",
  "currency_mismatch",
  "status_mismatch",
  "duplicate_provider_reference",
  "stale_pending_transaction",
  "ledger_posting_missing",
] as const;

export type ReconciliationCaseCategory = (typeof reconciliationCaseCategories)[number];

export interface ReconciliationCase {
  id: string;
  runId: string;
  paymentAttemptId?: string;
  providerTransactionId?: string;
  category: ReconciliationCaseCategory;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved" | "ignored";
  description: string;
  evidence: Record<string, unknown>;
  manualNote?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
