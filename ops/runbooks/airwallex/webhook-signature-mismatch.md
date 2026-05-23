# Airwallex Webhook Signature Mismatch Runbook

## Symptoms

- Webhook events in `failed` status with `lastError` containing "invalid signature" or "signature mismatch"
- Payments stuck in `provider_accepted` — PAID webhook received but rejected
- Audit events: `webhook.signature_invalid`

## Background

Granville verifies Airwallex webhooks using HMAC-SHA256 over `x-timestamp + "." + raw_body` using the Airwallex webhook secret. The implementation is in `libs/provider-adapters/airwallex/airwallex-webhooks.ts`. Verification fails if:

1. The `AIRWALLEX_WEBHOOK_SECRET` env var is wrong or missing
2. The raw body was modified in transit (e.g., by a proxy that re-encodes JSON)
3. The `x-timestamp` is more than 5 minutes old (replay protection)
4. The webhook is a spoofed/malformed delivery

## Diagnosis

1. Find the failed webhook:
   ```
   GET /admin/webhooks/:id
   ```
   Check `lastError` and `processingAttempts`.

2. Verify the `AIRWALLEX_WEBHOOK_SECRET` matches the secret shown in the Airwallex portal:
   - Airwallex sandbox portal → Developers → Webhooks → [endpoint] → Signing secret

3. Check whether the request passed through a proxy or load balancer that may have altered the body:
   - Compare `Content-Length` in the access log against the body length received by Granville
   - Confirm the proxy is passing the raw body without re-encoding

4. Check the `x-timestamp` header on the failed delivery. If it is more than 5 minutes behind the server clock, the 5-minute tolerance window rejected it. This can happen if Airwallex retried a webhook much later than the original delivery.

## Resolution

**Wrong `AIRWALLEX_WEBHOOK_SECRET`:**
1. Retrieve the correct signing secret from the Airwallex portal for the registered endpoint.
2. Update `AIRWALLEX_WEBHOOK_SECRET` in the environment / secrets manager.
3. Restart the Granville API server.
4. Replay the failed webhook(s):
   ```
   POST /admin/webhooks/:id/retry
   ```

**Proxy body modification:**
Configure the proxy to pass the raw request body without transformation. JSON pretty-printing or charset normalization will break the HMAC.

**Timestamp out of tolerance (old retry):**
Airwallex will typically retry delivery several times. If the original delivery is old, request a fresh re-delivery via the Airwallex portal (see [webhook-replay.md](webhook-replay.md)). Do not extend the 5-minute window — it exists to prevent replay attacks.

**Suspected spoofed delivery:**
Do not replay. Log the source IP and raw payload for security review. Airwallex webhooks originate from documented IP ranges; verify the source matches.

## Prevention

- Store `AIRWALLEX_WEBHOOK_SECRET` in the secrets manager, not in `.env` committed to version control.
- Ensure the public endpoint is TLS-terminated before reaching Granville.
- Do not use a proxy that modifies request bodies.
