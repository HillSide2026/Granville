# Airwallex Webhook Replay Runbook

## When to use this runbook

- A webhook event was delivered but Granville was unavailable or returned a non-2xx response
- A webhook event failed signature verification after `AIRWALLEX_WEBHOOK_SECRET` was corrected
- The public endpoint was registered after the original event was delivered (AW2 setup scenario)
- Airwallex shows a transfer as `PAID` but no corresponding webhook arrived in Granville

## Option 1: Replay via Granville admin API (preferred)

If the webhook was received by Granville but failed during processing:

1. Find the failed event:
   ```
   GET /admin/webhooks?processingStatus=failed&providerCode=airwallex
   ```

2. Inspect the failure reason:
   ```
   GET /admin/webhooks/:id
   ```

3. Fix the root cause (signature key, endpoint availability, processing bug).

4. Replay the event:
   ```
   POST /admin/webhooks/:id/retry
   ```
   Granville will re-process the stored payload. The idempotency check prevents duplicate state transitions if the payment was already completed by another path.

## Option 2: Request re-delivery via Airwallex portal

If the webhook was never received by Granville (endpoint was down or not yet registered):

1. Log into the Airwallex portal (sandbox: `app-demo.airwallex.com`, production: `app.airwallex.com`).
2. Navigate to **Developers → Webhooks**.
3. Find the registered endpoint and click through to the event delivery history.
4. Locate the event by date and event type (`TRANSFER.PAID`, `PAYMENT.PAID`).
5. Click **Resend** or **Retry delivery** on the specific event.

Airwallex retains event delivery history for a limited window (typically 72 hours). For events outside this window, proceed to Option 3.

## Option 3: Manual webhook injection (break-glass)

If neither replay option is available and you have confirmed the Airwallex transfer status directly via the API:

1. Retrieve the transfer record from Airwallex:
   ```
   GET https://api-demo.airwallex.com/api/v1/transfers/:transferId
   Authorization: Bearer <token>
   ```

2. Construct a minimal webhook payload matching the Granville normalizer's expected shape:
   ```json
   {
     "name": "TRANSFER.PAID",
     "data": {
       "transfer_id": "<transferId>",
       "status": "PAID",
       "source_currency": "USD",
       "payment_amount": "100.00",
       "payment_currency": "USD"
     }
   }
   ```

3. POST directly to the Granville webhook ingest endpoint:
   ```
   POST /webhooks/airwallex
   Content-Type: application/json
   x-timestamp: <current unix timestamp>
   x-signature: <computed HMAC>
   ```
   Computing the HMAC requires access to `AIRWALLEX_WEBHOOK_SECRET`. This step must be performed by an engineer with access to the secret.

4. Verify the payment transitioned to `completed` and the ledger posting was enqueued:
   ```
   GET /admin/payments/:id
   GET /admin/ledger-postings?paymentOrderId=:id
   ```

## Idempotency guarantee

Granville's webhook processor uses the provider event ID (or body hash) as a dedup key. Re-delivering the same event multiple times is safe — only the first delivery will trigger a state transition.
