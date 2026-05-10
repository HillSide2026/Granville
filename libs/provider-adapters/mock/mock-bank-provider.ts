import { randomUUID } from "node:crypto";

import type {
  CreateCustomerInput,
  OpenAccountInput,
  PaymentAccountProvider,
  PaymentInstruction,
  ProviderAccount,
  ProviderBalance,
  ProviderCustomer,
  ProviderPaymentResult,
  ProviderTransaction,
} from "../interfaces/index.ts";

export class MockBankProvider implements PaymentAccountProvider {
  async createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer> {
    return {
      providerCustomerId: `mock-bank-customer-${randomUUID()}`,
      granvilleCustomerId: input.granvilleCustomerId,
      status: "active",
      metadata: input.metadata ?? {},
    };
  }

  async openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount> {
    return {
      providerAccountId: `mock-bank-account-${randomUUID()}`,
      granvillePaymentAccountId: input.granvillePaymentAccountId,
      status: "active",
      currencyCode: input.currencyCode,
      countryCode: input.countryCode,
      metadata: input.metadata ?? {},
    };
  }

  async getAccount(accountId: string): Promise<ProviderAccount> {
    return {
      providerAccountId: accountId,
      status: "active",
      metadata: {},
    };
  }

  async initiatePayment(input: PaymentInstruction): Promise<ProviderPaymentResult> {
    return {
      providerTransactionId: `mock-bank-tx-${input.granvillePaymentAttemptId}`,
      providerReference: `bank-${input.granvillePaymentOrderId}`,
      status: "completed",
      metadata: input.metadata ?? {},
    };
  }

  async getTransaction(transactionId: string): Promise<ProviderTransaction> {
    return {
      providerTransactionId: transactionId,
      status: "completed",
      amount: "100",
      asset: "USD/2",
      occurredAt: new Date(),
      metadata: {},
      rawPayload: {},
    };
  }

  async listTransactions(accountId: string, from: Date, to: Date): Promise<ProviderTransaction[]> {
    return [
      {
        providerTransactionId: `mock-bank-list-${accountId}`,
        providerReference: `${from.toISOString()}-${to.toISOString()}`,
        status: "completed",
        amount: "100",
        asset: "USD/2",
        occurredAt: new Date(),
        metadata: {},
        rawPayload: {},
      },
    ];
  }

  async getBalance(accountId: string): Promise<ProviderBalance> {
    return {
      providerAccountId: accountId,
      amount: "250000",
      asset: "USD/2",
      asOf: new Date(),
    };
  }
}
