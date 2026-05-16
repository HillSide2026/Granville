import type {
  PaymentInstruction,
  ProviderPaymentResult,
  ProviderTransaction,
} from "../interfaces/index.ts";

export type AirwallexTransferStatus =
  | "IN_APPROVAL"
  | "APPROVAL_RECALLED"
  | "APPROVAL_REJECTED"
  | "APPROVAL_BLOCKED"
  | "SCHEDULED"
  | "OVERDUE"
  | "PROCESSING"
  | "SENT"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface AirwallexBeneficiaryPayload {
  beneficiary: Record<string, unknown>;
  transfer_methods: string[];
}

export interface AirwallexPayoutPayload {
  beneficiary_id: string;
  transfer_amount: string;
  transfer_currency: string;
  transfer_method: string;
  reason: string;
  reference: string;
  request_id: string;
  source_currency: string;
}

export interface AirwallexTransfer {
  id: string;
  request_id?: string;
  reference?: string;
  status?: string;
  transfer_amount?: string | number;
  transfer_currency?: string;
  source_currency?: string;
  created_at?: string;
  updated_at?: string;
  beneficiary_id?: string;
  beneficiary?: Record<string, unknown>;
}

export function mapGranvilleBeneficiaryToAirwallex(
  input: PaymentInstruction,
): AirwallexBeneficiaryPayload {
  const metadata = input.metadata ?? {};
  const transferMethod = metadata.airwallexTransferMethod ?? "LOCAL";
  const beneficiaryType = metadata.airwallexBeneficiaryType ?? "BANK_ACCOUNT";
  const entityType = metadata.airwallexBeneficiaryEntityType ?? "COMPANY";
  const countryCode = metadata.airwallexBeneficiaryCountryCode ?? metadata.countryCode ?? "GB";
  const accountCurrency =
    metadata.airwallexBeneficiaryAccountCurrency ?? currencyFromAsset(input.asset);

  return {
    beneficiary: {
      type: beneficiaryType,
      entity_type: entityType,
      company_name: metadata.airwallexBeneficiaryCompanyName ?? metadata.beneficiaryName,
      first_name: metadata.airwallexBeneficiaryFirstName,
      last_name: metadata.airwallexBeneficiaryLastName,
      address: compactObject({
        country_code: countryCode,
        street_address: metadata.airwallexBeneficiaryStreetAddress,
        city: metadata.airwallexBeneficiaryCity,
        state: metadata.airwallexBeneficiaryState,
        postcode: metadata.airwallexBeneficiaryPostcode,
      }),
      bank_details: compactObject({
        account_currency: accountCurrency,
        account_name:
          metadata.airwallexBeneficiaryAccountName ??
          metadata.airwallexBeneficiaryCompanyName ??
          metadata.beneficiaryName,
        account_number: metadata.airwallexBeneficiaryAccountNumber,
        account_routing_type1: metadata.airwallexBeneficiaryRoutingType,
        account_routing_value1: metadata.airwallexBeneficiaryRoutingValue,
        bank_country_code: metadata.airwallexBeneficiaryBankCountryCode ?? countryCode,
        local_clearing_system: metadata.airwallexLocalClearingSystem,
      }),
    },
    transfer_methods: [transferMethod],
  };
}

export function mapGranvillePaymentToAirwallexPayout(
  input: PaymentInstruction,
  beneficiaryId: string,
): AirwallexPayoutPayload {
  const metadata = input.metadata ?? {};
  const transferCurrency = metadata.airwallexTransferCurrency ?? currencyFromAsset(input.asset);
  return {
    beneficiary_id: beneficiaryId,
    transfer_amount: majorAmount(input.amount, input.asset),
    transfer_currency: transferCurrency,
    transfer_method: metadata.airwallexTransferMethod ?? "LOCAL",
    reason: metadata.airwallexTransferReason ?? "business_expenses",
    reference: input.beneficiaryReference ?? input.granvillePaymentOrderId,
    request_id: input.granvillePaymentAttemptId,
    source_currency: metadata.airwallexSourceCurrency ?? transferCurrency,
  };
}

export function mapAirwallexTransferStatus(
  status: string | undefined,
): ProviderPaymentResult["status"] | undefined {
  switch (status) {
    case "IN_APPROVAL":
    case "SCHEDULED":
      return "accepted";
    case "OVERDUE":
    case "PROCESSING":
    case "SENT":
      return "processing";
    case "PAID":
      return "completed";
    case "FAILED":
    case "APPROVAL_REJECTED":
    case "APPROVAL_BLOCKED":
      return "failed";
    case "CANCELLED":
    case "APPROVAL_RECALLED":
      return "cancelled";
    default:
      return undefined;
  }
}

export function mapAirwallexTransferToProviderResult(
  transfer: AirwallexTransfer,
  beneficiaryId?: string,
): ProviderPaymentResult {
  return {
    providerTransactionId: transfer.id,
    providerReference: transfer.request_id ?? transfer.reference,
    status: mapAirwallexTransferStatus(transfer.status) ?? "processing",
    metadata: {
      provider: "airwallex",
      airwallexTransferId: transfer.id,
      ...(beneficiaryId ? { airwallexBeneficiaryId: beneficiaryId } : {}),
      ...(transfer.status ? { airwallexStatus: transfer.status } : {}),
    },
  };
}

export function mapAirwallexTransferToProviderTransaction(
  transfer: AirwallexTransfer,
): ProviderTransaction {
  const amount =
    typeof transfer.transfer_amount === "number"
      ? transfer.transfer_amount.toString()
      : (transfer.transfer_amount ?? "0");
  const asset = transfer.transfer_currency ? `${transfer.transfer_currency}/2` : "GBP/2";

  return {
    providerTransactionId: transfer.id,
    providerReference: transfer.request_id ?? transfer.reference,
    status: mapAirwallexTransferStatus(transfer.status) ?? transfer.status ?? "processing",
    amount: minorAmount(amount, asset),
    asset,
    occurredAt: transfer.updated_at ? new Date(transfer.updated_at) : new Date(),
    metadata: {
      provider: "airwallex",
      ...(transfer.status ? { airwallexStatus: transfer.status } : {}),
    },
    rawPayload: transfer,
  };
}

export function currencyFromAsset(asset: string): string {
  return asset.split("/")[0] || asset;
}

function majorAmount(amount: string, asset: string): string {
  const scale = Number(asset.split("/")[1] ?? "0");
  const value = BigInt(amount);
  const divisor = 10n ** BigInt(scale);
  const whole = value / divisor;
  const fractional = value % divisor;
  if (scale === 0) return whole.toString();
  return `${whole}.${fractional.toString().padStart(scale, "0")}`;
}

function minorAmount(amount: string, asset: string): string {
  const scale = Number(asset.split("/")[1] ?? "0");
  const [whole, fractional = ""] = amount.split(".");
  const padded = fractional.padEnd(scale, "0").slice(0, scale);
  return (BigInt(whole) * 10n ** BigInt(scale) + BigInt(padded || "0")).toString();
}

function compactObject(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== ""),
  );
}
