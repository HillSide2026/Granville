import type {
  CreateCustomerInput,
  OpenAccountInput,
  PaymentInstruction,
  ProviderAccount,
  ProviderBalance,
  ProviderCustomer,
  ProviderPaymentResult,
  ProviderTransaction,
} from "./provider-types.ts";

export interface PaymentAccountProvider {
  createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer>;
  openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount>;
  getAccount(accountId: string): Promise<ProviderAccount>;
  initiatePayment(input: PaymentInstruction): Promise<ProviderPaymentResult>;
  getTransaction(transactionId: string): Promise<ProviderTransaction>;
  listTransactions(
    accountId: string,
    from: Date,
    to: Date,
  ): Promise<ProviderTransaction[]>;
  getBalance(accountId: string): Promise<ProviderBalance>;
}
