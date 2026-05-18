// ledgerRef is an opaque reference to the underlying ledger system (e.g. Formance transaction ID).
// It lives here as a string rather than a typed Formance identifier so the domain model
// remains independent of which ledger backend is in use.
export interface LedgerEffect {
  id: string;
  paymentAttemptId: string;
  ledgerName: string;
  ledgerRef?: string;
  postedAt: string;
}
