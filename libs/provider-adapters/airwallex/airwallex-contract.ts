import type { NormalizedProviderWebhook } from "../webhook-normalizer.ts";
import type { AirwallexBeneficiary, AirwallexClient } from "./airwallex-client.ts";
import type {
  AirwallexBeneficiaryPayload,
  AirwallexPayoutPayload,
  AirwallexTransfer,
} from "./airwallex-mapping.ts";

export interface AirwallexAdapterContract {
  createBeneficiary(payload: AirwallexBeneficiaryPayload): Promise<AirwallexBeneficiary>;
  createPayout(payload: AirwallexPayoutPayload): Promise<AirwallexTransfer>;
  getPayoutStatus(transferId: string): Promise<AirwallexTransfer>;
  handleWebhook(payload: Record<string, unknown>): NormalizedProviderWebhook;
  syncTransactions(filter?: { from?: string; to?: string }): Promise<AirwallexTransfer[]>;
}

export type AirwallexAdapterClient = Pick<
  AirwallexClient,
  "createBeneficiary" | "createPayout" | "getPayoutStatus" | "syncTransactions"
>;
