import type { PaymentAccount } from "../../contracts/account.ts";
import type { Customer } from "../../contracts/customer.ts";
import type { PaymentAttempt, PaymentOrder } from "../../contracts/payment.ts";
import type { ProviderBinding, ProviderCapability } from "../../contracts/provider.ts";
import type {
  AuditEvent,
  CreateCustomerInput,
  CreatePaymentAccountInput,
  CreatePaymentOrderInput,
  LedgerQueueItem,
  ProviderCommandQueueItem,
  ProviderHealth,
  ProviderRequestAttempt,
  ProviderTransactionRecord,
} from "./in-memory-store.ts";

export interface GranvilleRepositories {
  createCustomer(input: CreateCustomerInput): Promise<Customer> | Customer;
  createPaymentAccount(input: CreatePaymentAccountInput): Promise<PaymentAccount> | PaymentAccount;
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> | PaymentOrder;
  updatePaymentOrder(
    id: string,
    patch: Partial<Omit<PaymentOrder, "id" | "createdAt">>,
  ): Promise<PaymentOrder> | PaymentOrder;
  updatePaymentAttempt(
    id: string,
    patch: Partial<Omit<PaymentAttempt, "id" | "createdAt">>,
  ): Promise<PaymentAttempt> | PaymentAttempt;
  enqueueProviderCommand(
    input: Omit<
      ProviderCommandQueueItem,
      "id" | "status" | "retryCount" | "availableAt" | "createdAt" | "updatedAt"
    >,
  ): Promise<ProviderCommandQueueItem> | ProviderCommandQueueItem;
  recordProviderRequestAttempt(
    input: Omit<ProviderRequestAttempt, "id" | "startedAt"> & { startedAt?: string },
  ): Promise<ProviderRequestAttempt> | ProviderRequestAttempt;
  recordProviderTransaction(
    input: Omit<ProviderTransactionRecord, "id" | "occurredAt"> & { occurredAt?: string },
  ): Promise<ProviderTransactionRecord> | ProviderTransactionRecord;
  providerBindings(): Promise<ProviderBinding[]> | ProviderBinding[];
  providerCapabilities(): Promise<ProviderCapability[]> | ProviderCapability[];
  providerHealth(): Promise<ProviderHealth[]> | ProviderHealth[];
  ledgerQueueItems(): Promise<LedgerQueueItem[]> | LedgerQueueItem[];
  auditEvents(): Promise<AuditEvent[]> | AuditEvent[];
}
