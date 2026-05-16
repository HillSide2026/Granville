export const reconciliationRunTypes = [
  "transaction_level",
  "balance",
  "settlement",
  "fee",
  "exception",
] as const;

export type ReconciliationRunType = (typeof reconciliationRunTypes)[number];

export const reconciliationExceptionCategories = [
  "missing_provider_transaction",
  "missing_internal_transaction",
  "amount_mismatch",
  "currency_mismatch",
  "status_mismatch",
  "duplicate_provider_reference",
  "stale_pending_transaction",
  "ledger_posting_missing",
] as const;

export type ReconciliationExceptionCategory = (typeof reconciliationExceptionCategories)[number];

export interface ReconciliationRun {
  id: string;
  providerBindingId?: string;
  runType: ReconciliationRunType;
  status: "queued" | "running" | "completed" | "failed";
  periodStart?: string;
  periodEnd?: string;
  summary: Record<string, unknown>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ReconciliationException {
  id: string;
  reconciliationRunId?: string;
  paymentOrderId?: string;
  paymentAttemptId?: string;
  providerTransactionId?: string;
  ledgerPostingId?: string;
  category: ReconciliationExceptionCategory;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved" | "ignored";
  description: string;
  evidence: Record<string, unknown>;
  manualNote?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  ignoredAt?: string;
  ignoredBy?: string;
}

export interface ProviderStatementLine {
  providerBindingId: string;
  providerReference: string;
  amount: string;
  asset: string;
  valueDate: string;
  description?: string;
}

export interface ReconciliationRecord {
  id: string;
  reconciliationRunId: string;
  paymentOrderId?: string;
  paymentAttemptId?: string;
  providerTransactionId?: string;
  ledgerPostingId?: string;
  matchStatus: "matched" | "unmatched" | "exception";
  evidence: Record<string, unknown>;
  createdAt: string;
}
