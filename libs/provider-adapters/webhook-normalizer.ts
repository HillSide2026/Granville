import { normalizeAirwallexWebhook } from "./airwallex/index.ts";

export function parseWebhookBody(body: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export interface NormalizedProviderWebhook {
  providerCode: string;
  providerReference?: string;
  providerTransactionId?: string;
  status?: "accepted" | "processing" | "completed" | "failed" | "returned" | "cancelled";
  rawPayload: Record<string, unknown>;
}

export function normalizeProviderWebhook(
  providerCode: string,
  payload: Record<string, unknown>,
): NormalizedProviderWebhook {
  if (providerCode === "airwallex") {
    return normalizeAirwallexWebhook(payload);
  }
  if (providerCode === "mock-bank") {
    return {
      providerCode,
      providerReference: stringField(payload.reference),
      providerTransactionId: stringField(payload.transactionId),
      status: statusField(payload.state),
      rawPayload: payload,
    };
  }
  return {
    providerCode,
    providerReference: stringField(payload.providerReference),
    providerTransactionId: stringField(payload.providerTransactionId),
    status: statusField(payload.status),
    rawPayload: payload,
  };
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function statusField(value: unknown): NormalizedProviderWebhook["status"] {
  if (
    value === "accepted" ||
    value === "processing" ||
    value === "completed" ||
    value === "failed" ||
    value === "returned" ||
    value === "cancelled"
  ) {
    return value;
  }
  return undefined;
}
