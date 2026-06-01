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
    // Airwallex is a payout rail, not an EMI — it has no customer registration concept.
    // The customer identity lives in Granville; Airwallex only needs the beneficiary at payout time.
    return {
      providerCustomerId: `airwallex:customer:${input.granvilleCustomerId}`,
      granvilleCustomerId: input.granvilleCustomerId,
      status: "active",
      metadata: {
        ...input.metadata,
        provider: "airwallex",
        ...(this.client.config.dryRun ? { mode: "dry_run" } : {}),
      },
    };
  }

  async openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount> {
    // Airwallex uses org-level currency wallets, not per-customer accounts.
    // We encode the currency in the providerAccountId so getBalance can resolve it later.
    const currency = input.currencyCode ?? "GBP";
    return {
      providerAccountId: `airwallex:wallet:${currency}:${input.granvillePaymentAccountId}`,
      granvillePaymentAccountId: input.granvillePaymentAccountId,
      status: "active",
      currencyCode: currency,
      countryCode: input.countryCode,
      metadata: {
        ...input.metadata,
        provider: "airwallex",
        airwallexWalletCurrency: currency,
        ...(this.client.config.dryRun ? { mode: "dry_run" } : {}),
      },
    };
  }

  async getAccount(accountId: string): Promise<ProviderAccount> {
    // Derive currency from the structured provider account ID.
    const currency = parseCurrencyFromAccountId(accountId);
    return {
      providerAccountId: accountId,
      status: "active",
      ...(currency ? { currencyCode: currency } : {}),
      metadata: {
        provider: "airwallex",
        ...(currency ? { airwallexWalletCurrency: currency } : {}),
        ...(this.client.config.dryRun ? { mode: "dry_run" } : {}),
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
    if (!this.client.config.dryRun) {
      const currency = parseCurrencyFromAccountId(accountId) ?? "GBP";
      const balances = await this.client.getBalances();
      const match = balances.find((b) => b.currency.toUpperCase() === currency.toUpperCase());
      const asset = `${currency}/2`;
      const rawAmount = match?.available_amount ?? "0";
      return {
        providerAccountId: accountId,
        amount: normalizeBalanceAmount(rawAmount, asset),
        asset,
        asOf: match?.updated_at ? new Date(match.updated_at) : now(),
      };
    }
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
}

function parseCurrencyFromAccountId(accountId: string): string | undefined {
  // Format: airwallex:wallet:{CURRENCY}:{granvillePaymentAccountId}
  const parts = accountId.split(":");
  if (parts[0] === "airwallex" && parts[1] === "wallet" && parts[2]) {
    return parts[2];
  }
  return undefined;
}

function normalizeBalanceAmount(raw: string | number, asset: string): string {
  // Airwallex balance amounts are in major units (e.g. "1000.50"); convert to minor units.
  const scale = Number(asset.split("/")[1] ?? "0");
  const str = typeof raw === "number" ? raw.toFixed(scale) : String(raw);
  const [whole, frac = ""] = str.split(".");
  const padded = frac.padEnd(scale, "0").slice(0, scale);
  return (BigInt(whole) * 10n ** BigInt(scale) + BigInt(padded || "0")).toString();
}
