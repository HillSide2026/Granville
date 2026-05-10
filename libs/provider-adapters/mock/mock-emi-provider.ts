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

function now(): Date {
  return new Date();
}

export class MockEmiProvider implements PaymentAccountProvider {
  async createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer> {
    return {
      providerCustomerId: `mock-customer-${randomUUID()}`,
      granvilleCustomerId: input.granvilleCustomerId,
      status: "active",
      metadata: input.metadata ?? {},
    };
  }

  async openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount> {
    return {
      providerAccountId: `mock-account-${randomUUID()}`,
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
      providerTransactionId: `mock-tx-${input.granvillePaymentAttemptId}`,
      providerReference: input.granvillePaymentAttemptId,
      status: "completed",
      metadata: input.metadata ?? {},
    };
  }

  async getTransaction(transactionId: string): Promise<ProviderTransaction> {
    return {
      providerTransactionId: transactionId,
      status: "completed",
      amount: "100",
      asset: "GBP/2",
      occurredAt: now(),
      metadata: {},
      rawPayload: {},
    };
  }

  async listTransactions(accountId: string, from: Date, to: Date): Promise<ProviderTransaction[]> {
    return [
      {
        providerTransactionId: `mock-list-${accountId}`,
        providerReference: `${from.toISOString()}-${to.toISOString()}`,
        status: "completed",
        amount: "100",
        asset: "GBP/2",
        occurredAt: now(),
        metadata: {},
        rawPayload: {},
      },
    ];
  }

  async getBalance(accountId: string): Promise<ProviderBalance> {
    return {
      providerAccountId: accountId,
      amount: "100000",
      asset: "GBP/2",
      asOf: now(),
    };
  }
}
