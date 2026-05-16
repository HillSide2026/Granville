import type { ProviderBinding } from "../../contracts/provider.ts";
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
import { AirwallexClient, airwallexConfigFromBinding } from "./airwallex-client.ts";
import type { AirwallexBeneficiaryPayload, AirwallexPayoutPayload } from "./airwallex-mapping.ts";
import {
  mapAirwallexTransferToProviderResult,
  mapAirwallexTransferToProviderTransaction,
  mapGranvilleBeneficiaryToAirwallex,
  mapGranvillePaymentToAirwallexPayout,
} from "./airwallex-mapping.ts";
import { normalizeAirwallexWebhook } from "./airwallex-webhooks.ts";

function now(): Date {
  return new Date();
}

export class AirwallexEmiProvider implements PaymentAccountProvider {
  readonly client: AirwallexClient;

  constructor(client: AirwallexClient) {
    this.client = client;
  }

  static fromBinding(binding: ProviderBinding): AirwallexEmiProvider {
    return new AirwallexEmiProvider(new AirwallexClient(airwallexConfigFromBinding(binding)));
  }

  createBeneficiary(payload: AirwallexBeneficiaryPayload) {
    return this.client.createBeneficiary(payload);
  }

  createPayout(payload: AirwallexPayoutPayload) {
    return this.client.createPayout(payload);
  }

  getPayoutStatus(transferId: string) {
    return this.client.getPayoutStatus(transferId);
  }

  syncTransactions(filter?: { from?: string; to?: string }) {
    return this.client.syncTransactions(filter);
  }

  async createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer> {
    this.#ensureDryRun("createCustomer");
    return {
      providerCustomerId: `airwallex-dry-run-customer-${input.granvilleCustomerId}`,
      granvilleCustomerId: input.granvilleCustomerId,
      status: "active",
      metadata: {
        ...input.metadata,
        provider: "airwallex",
        mode: "dry_run",
      },
    };
  }

  async openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount> {
    this.#ensureDryRun("openPaymentAccount");
    return {
      providerAccountId: `airwallex-dry-run-account-${input.granvillePaymentAccountId}`,
      granvillePaymentAccountId: input.granvillePaymentAccountId,
      status: "active",
      currencyCode: input.currencyCode,
      countryCode: input.countryCode,
      metadata: {
        ...input.metadata,
        provider: "airwallex",
        mode: "dry_run",
      },
    };
  }

  async getAccount(accountId: string): Promise<ProviderAccount> {
    this.#ensureDryRun("getAccount");
    return {
      providerAccountId: accountId,
      status: "active",
      metadata: {
        provider: "airwallex",
        mode: "dry_run",
      },
    };
  }

  async initiatePayment(input: PaymentInstruction): Promise<ProviderPaymentResult> {
    if (!this.client.config.dryRun) {
      const existingBeneficiaryId = input.metadata?.airwallexBeneficiaryId;
      const beneficiaryId =
        existingBeneficiaryId ??
        (await this.client.createBeneficiary(mapGranvilleBeneficiaryToAirwallex(input))).id;
      const transfer = await this.client.createPayout(
        mapGranvillePaymentToAirwallexPayout(input, beneficiaryId),
      );
      return mapAirwallexTransferToProviderResult(transfer, beneficiaryId);
    }
    return {
      providerTransactionId: `airwallex-dry-run-tx-${input.granvillePaymentAttemptId}`,
      providerReference: input.granvillePaymentAttemptId,
      status: "accepted",
      metadata: {
        ...input.metadata,
        provider: "airwallex",
        mode: "dry_run",
      },
    };
  }

  async getTransaction(transactionId: string): Promise<ProviderTransaction> {
    if (!this.client.config.dryRun) {
      return mapAirwallexTransferToProviderTransaction(
        await this.client.getPayoutStatus(transactionId),
      );
    }
    return {
      providerTransactionId: transactionId,
      status: "accepted",
      amount: "0",
      asset: "GBP/2",
      occurredAt: now(),
      metadata: {
        provider: "airwallex",
        mode: "dry_run",
      },
      rawPayload: {},
    };
  }

  async listTransactions(accountId: string, from: Date, to: Date): Promise<ProviderTransaction[]> {
    if (!this.client.config.dryRun) {
      const transfers = await this.client.syncTransactions({
        from: from.toISOString(),
        to: to.toISOString(),
      });
      return transfers.map(mapAirwallexTransferToProviderTransaction);
    }
    return [
      {
        providerTransactionId: `airwallex-dry-run-list-${accountId}`,
        providerReference: `${from.toISOString()}-${to.toISOString()}`,
        status: "accepted",
        amount: "0",
        asset: "GBP/2",
        occurredAt: now(),
        metadata: {
          provider: "airwallex",
          mode: "dry_run",
        },
        rawPayload: {},
      },
    ];
  }

  async getBalance(accountId: string): Promise<ProviderBalance> {
    this.#ensureDryRun("getBalance");
    return {
      providerAccountId: accountId,
      amount: "0",
      asset: "GBP/2",
      asOf: now(),
    };
  }

  handleWebhook(payload: Record<string, unknown>) {
    return normalizeAirwallexWebhook(payload);
  }

  #ensureDryRun(operation: string): void {
    if (this.client.config.dryRun) return;
    throw new Error(
      `Airwallex ${operation} is not live-enabled yet; wire the provider-native payload mapping before disabling dry run`,
    );
  }
}
