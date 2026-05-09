export interface CreateCustomerInput {
  granvilleCustomerId: string;
  legalName: string;
  email?: string;
  countryCode?: string;
  metadata?: Record<string, string>;
}

export interface ProviderCustomer {
  providerCustomerId: string;
  granvilleCustomerId: string;
  status: "created" | "active" | "pending_review" | "rejected";
  metadata: Record<string, string>;
}

export interface OpenAccountInput {
  granvilleCustomerId: string;
  granvillePaymentAccountId: string;
  currencyCode?: string;
  countryCode?: string;
  metadata?: Record<string, string>;
}

export interface ProviderAccount {
  providerAccountId: string;
  granvillePaymentAccountId?: string;
  status: "created" | "active" | "suspended" | "closed";
  currencyCode?: string;
  countryCode?: string;
  metadata: Record<string, string>;
}

export interface PaymentInstruction {
  granvillePaymentOrderId: string;
  granvillePaymentAttemptId: string;
  granvillePaymentAccountId: string;
  amount: string;
  asset: string;
  beneficiaryReference?: string;
  metadata?: Record<string, string>;
}

export interface ProviderPaymentResult {
  providerTransactionId: string;
  providerReference?: string;
  status:
    | "accepted"
    | "processing"
    | "completed"
    | "failed"
    | "returned"
    | "cancelled";
  metadata: Record<string, string>;
}

export interface ProviderTransaction {
  providerTransactionId: string;
  providerReference?: string;
  status: string;
  amount: string;
  asset: string;
  occurredAt: Date;
  metadata: Record<string, string>;
  rawPayload?: Record<string, unknown>;
}

export interface ProviderBalance {
  providerAccountId: string;
  amount: string;
  asset: string;
  asOf: Date;
}

export interface BeneficiaryInput {
  granvilleCustomerId: string;
  legalName: string;
  bankCountryCode?: string;
  iban?: string;
  accountNumber?: string;
  routingNumber?: string;
  metadata?: Record<string, string>;
}

export interface BankBeneficiary {
  beneficiaryId: string;
  status: "created" | "verified" | "rejected";
  metadata: Record<string, string>;
}

export interface BankPaymentInstruction {
  granvillePaymentOrderId: string;
  granvillePaymentAttemptId: string;
  beneficiaryId: string;
  amount: string;
  asset: string;
  metadata?: Record<string, string>;
}

export interface BankPaymentResult {
  bankPaymentId: string;
  status: "accepted" | "processing" | "completed" | "failed" | "returned";
  metadata: Record<string, string>;
}

export interface BankPaymentStatus {
  bankPaymentId: string;
  status: "accepted" | "processing" | "completed" | "failed" | "returned";
  updatedAt: Date;
}

export interface BankTransaction {
  transactionId: string;
  amount: string;
  asset: string;
  status: string;
  occurredAt: Date;
  metadata: Record<string, string>;
}

export interface BankStatement {
  accountId: string;
  from: Date;
  to: Date;
  transactions: BankTransaction[];
}
