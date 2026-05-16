import { createHmac, timingSafeEqual } from "node:crypto";

import type { NormalizedProviderWebhook } from "../webhook-normalizer.ts";
import { mapAirwallexTransferStatus } from "./airwallex-mapping.ts";

export interface AirwallexWebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

export function verifyAirwallexWebhookSignature(
  body: string,
  headers: Record<string, string>,
  secret: string | undefined,
  now = Date.now(),
): AirwallexWebhookVerificationResult {
  if (!secret) return { valid: true };
  const timestamp = headerValue(headers, "x-timestamp");
  const signature = headerValue(headers, "x-signature");
  if (!timestamp || !signature) {
    return { valid: false, reason: "missing_signature_headers" };
  }
  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs)) {
    return { valid: false, reason: "invalid_timestamp" };
  }
  if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
    return { valid: false, reason: "timestamp_outside_tolerance" };
  }
  const expected = createHmac("sha256", secret).update(`${timestamp}${body}`).digest("hex");
  if (!safeEqualHex(expected, signature)) {
    return { valid: false, reason: "signature_mismatch" };
  }
  return { valid: true };
}

export function normalizeAirwallexWebhook(
  payload: Record<string, unknown>,
): NormalizedProviderWebhook {
  const data = objectField(payload.data) ?? objectField(payload.resource) ?? payload;
  const transfer = objectField(data.transfer) ?? data;
  const eventType = stringField(payload.name) ?? stringField(payload.event_type);
  const status =
    stringField(transfer.status) ?? statusFromEventType(eventType) ?? stringField(payload.status);
  const providerTransactionId =
    stringField(transfer.id) ?? stringField(payload.resource_id) ?? stringField(payload.id);

  return {
    providerCode: "airwallex",
    providerReference: stringField(transfer.request_id) ?? stringField(transfer.reference),
    providerTransactionId,
    status: mapAirwallexTransferStatus(status),
    rawPayload: payload,
  };
}

function statusFromEventType(eventType: string | undefined): string | undefined {
  if (!eventType?.startsWith("payout.transfer.")) return undefined;
  return eventType.split(".").at(-1)?.toUpperCase();
}

function headerValue(headers: Record<string, string>, name: string): string | undefined {
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  return entry?.[1];
}

function safeEqualHex(left: string, right: string): boolean {
  try {
    const leftBuffer = Buffer.from(left, "hex");
    const rightBuffer = Buffer.from(right, "hex");
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  } catch {
    return false;
  }
}

function objectField(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
