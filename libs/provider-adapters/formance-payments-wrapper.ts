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
} from "./interfaces/index.ts";

export class FormancePaymentsWrapperAdapter implements PaymentAccountProvider {
  connectorId?: string;

  constructor(connectorId?: string) {
    this.connectorId = connectorId;
  }

  async createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer> {
    return {
      providerCustomerId: `formance-customer-${input.granvilleCustomerId}`,
      granvilleCustomerId: input.granvilleCustomerId,
      status: "active",
      metadata: {
        ...(input.metadata ?? {}),
        connectorId: this.connectorId ?? "unconfigured",
      },
    };
  }

  async openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount> {
    return {
      providerAccountId: `formance-account-${input.granvillePaymentAccountId}`,
      granvillePaymentAccountId: input.granvillePaymentAccountId,
      status: "active",
      currencyCode: input.currencyCode,
      countryCode: input.countryCode,
      metadata: {
        ...(input.metadata ?? {}),
        connectorId: this.connectorId ?? "unconfigured",
      },
    };
  }

  async getAccount(accountId: string): Promise<ProviderAccount> {
    return {
      providerAccountId: accountId,
      status: "active",
      metadata: {
        connectorId: this.connectorId ?? "unconfigured",
      },
    };
  }

  async initiatePayment(
    input: PaymentInstruction,
  ): Promise<ProviderPaymentResult> {
    return {
      providerTransactionId: `formance-payment-${input.granvillePaymentAttemptId}`,
      providerReference: input.granvillePaymentOrderId,
      status: "accepted",
      metadata: {
        ...(input.metadata ?? {}),
        connectorId: this.connectorId ?? "unconfigured",
      },
    };
  }

  async getTransaction(transactionId: string): Promise<ProviderTransaction> {
    return {
      providerTransactionId: transactionId,
      status: "accepted",
      amount: "0",
      asset: "UNKNOWN/0",
      occurredAt: new Date(),
      metadata: {
        connectorId: this.connectorId ?? "unconfigured",
      },
      rawPayload: {},
    };
  }

  async listTransactions(): Promise<ProviderTransaction[]> {
    return [];
  }

  async getBalance(accountId: string): Promise<ProviderBalance> {
    return {
      providerAccountId: accountId,
      amount: "0",
      asset: "UNKNOWN/0",
      asOf: new Date(),
    };
  }
}
