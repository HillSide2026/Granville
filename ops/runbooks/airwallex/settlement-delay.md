# Settlement Delay Runbook

## Symptoms

- Payments in `provider_accepted` status longer than expected SLA (typically 1–2 business days for Airwallex payouts)
- No incoming `PAID` webhook event for the affected payment
- Ledger posting not enqueued (payment never reached `completed`)
- Customer or compliance team inquiry about a payment that appears to have been sent but not confirmed

## Background

After a successful payout initiation, Airwallex returns `SCHEDULED` and the payment moves to `provider_accepted` in Granville. The payment only moves to `completed` when Airwallex delivers a `PAID` webhook event. Until AW2 webhook certification is complete, there is no automatic signal — the payment will remain `provider_accepted` indefinitely if the webhook is not delivered.

Settlement delays are almost always one of:
1. Airwallex webhook not registered or misconfigured (AW2 prerequisite)
2. Airwallex-side settlement delay (banking partner, FX, compliance hold)
3. Webhook delivered but Granville rejected it (signature mismatch, endpoint down)

## Diagnosis

1. Find the affected payment and its providerReference:
   ```
   GET /admin/payments/:id
   ```

2. Check if a webhook was received and processed:
   ```
   GET /admin/webhooks?providerCode=airwallex
   ```
   Look for a webhook event with `providerReference` matching the payment.

3. If no webhook received — check whether the Airwallex sandbox webhook endpoint is registered:
   - Log into the Airwallex sandbox portal
   - Navigate to Developers → Webhooks
   - Confirm the Granville endpoint URL is listed and shows recent delivery attempts

4. If a webhook was received but in `failed` status:
   ```
   GET /admin/webhooks/:id
   ```
   Check `lastError` — likely a signature mismatch or processing error.

5. Query Airwallex directly for the transfer status using the `providerReference` (transfer ID):
   ```
   GET https://api-demo.airwallex.com/api/v1/transfers/:transferId
   Authorization: Bearer <token>
   ```

## Resolution

**Webhook not registered:**
Complete AW2 prerequisite: register the public HTTPS endpoint in the Airwallex sandbox portal. See [webhook-replay.md](webhook-replay.md) for triggering re-delivery once the endpoint is live.

**Airwallex-side delay:**
Payment is in transit. No action in Granville. Contact Airwallex support with the transfer ID if the delay exceeds the expected settlement window.

**Webhook received but failed:**
See [webhook-signature-mismatch.md](webhook-signature-mismatch.md) for diagnosis. Replay the event after the root cause is fixed:
```
POST /admin/webhooks/:id/retry
```

**Manual completion (break-glass — requires compliance sign-off):**
Do not manually set payments to `completed` without confirmation that the Airwallex transfer actually settled. This bypasses the ledger and reconciliation integrity guarantees.

## Escalation

If the Airwallex portal shows the transfer as `PAID` but no webhook was delivered, request manual re-delivery via Airwallex support. Provide the transfer ID and the target webhook URL.
