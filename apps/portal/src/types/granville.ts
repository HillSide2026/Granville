// Granville domain types — mirrored from libs/contracts/

export interface Money {
  amount: string;
  asset: string;
}

// ── Customer ──────────────────────────────────────────────────────────────────

export type CustomerStatus = "created" | "active" | "restricted" | "closed";
export type CustomerType = "individual" | "business";

export interface Customer {
  id: string;
  externalReference?: string;
  type: CustomerType;
  status: CustomerStatus;
  legalName: string;
  email?: string;
  countryCode?: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  legalName: string;
  email?: string;
  countryCode?: string;
  externalReference?: string;
  metadata?: Record<string, string>;
}

// ── Payment Account ───────────────────────────────────────────────────────────

export type PaymentAccountStatus = "created" | "active" | "suspended" | "closed";
export type PaymentAccountKind = "virtual" | "settlement" | "clearing" | "external";

export interface PaymentAccount {
  id: string;
  customerId: string;
  providerBindingId: string;
  kind: PaymentAccountKind;
  status: PaymentAccountStatus;
  currencyCode?: string;
  countryCode?: string;
  displayName?: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentAccountInput {
  customerId: string;
  providerBindingId?: string;
  currencyCode?: string;
  countryCode?: string;
  displayName?: string;
  kind?: PaymentAccountKind;
  metadata?: Record<string, string>;
}

// ── Payment ───────────────────────────────────────────────────────────────────

export type CanonicalPaymentStatus =
  | "created"
  | "pending_review"
  | "submitted_to_provider"
  | "provider_accepted"
  | "processing"
  | "completed"
  | "failed"
  | "returned"
  | "cancelled";

export type PaymentDirection = "outbound" | "inbound";
export type PaymentTransactionType = "payment" | "refund" | "payout" | "transfer";

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

export interface CreatePaymentOrderInput {
  customerId: string;
  paymentAccountId: string;
  amount: string;
  asset: string;
  direction?: PaymentDirection;
  transactionType?: PaymentTransactionType;
  beneficiaryReference?: string;
  metadata?: Record<string, string>;
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

// ── Reconciliation ────────────────────────────────────────────────────────────

export type ReconciliationExceptionCategory =
  | "missing_provider_transaction"
  | "missing_internal_transaction"
  | "amount_mismatch"
  | "currency_mismatch"
  | "status_mismatch"
  | "duplicate_provider_reference"
  | "stale_pending_transaction"
  | "ledger_posting_missing";

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
  ignoredAt?: string;
}

export interface ReconciliationRun {
  id: string;
  providerBindingId?: string;
  runType: string;
  status: "queued" | "running" | "completed" | "failed";
  periodStart?: string;
  periodEnd?: string;
  summary: Record<string, unknown>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// ── Platform Metrics ──────────────────────────────────────────────────────────

export interface PlatformMetrics {
  totalCustomers: number;
  totalPaymentAccounts: number;
  totalPaymentOrders: number;
  completedPayments: number;
  failedPayments: number;
  pendingPayments: number;
  openReconciliationExceptions: number;
  activeRoutingRules: number;
  ledgerPostingQueueDepth: number;
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  actorType: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ── Routing Rule ──────────────────────────────────────────────────────────────

export interface RoutingRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  active: boolean;
  conditions: Record<string, unknown>;
  outcome: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Beneficiary ───────────────────────────────────────────────────────────────

export interface Beneficiary {
  id: string;
  displayName: string;
  accountNumber: string;
  sortCode?: string;
  iban?: string;
  bankName?: string;
  countryCode: string;
  currency: string;
  createdAt: string;
}

export interface CreateBeneficiaryInput {
  displayName: string;
  accountNumber: string;
  sortCode?: string;
  iban?: string;
  bankName?: string;
  countryCode: string;
  currency: string;
}

// ── API error ─────────────────────────────────────────────────────────────────

export type GranvilleErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR"
  | "IDEMPOTENCY_CONFLICT";

export interface GranvilleError {
  error: {
    code: GranvilleErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}
