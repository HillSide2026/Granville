# Runbook: Webhook Replay

## Symptoms

- `webhook_failure_count` metric is non-zero.
- Payments stuck in `processing` or `submitted_to_provider` after the provider confirms completion.
- `GET /admin/webhook-events` shows events with `processingStatus: failed`.

## Cause

Webhook events enter the `failed` state after 3 processing attempts. Common causes:

- Provider sent a webhook before the payment attempt record existed (timing race).
- Transient error during processing (DB unavailable, dependency timeout).
- Malformed payload that the normalizer could not parse.

## Replay a single failed webhook

```
POST /admin/webhooks/{webhookId}/retry
Authorization: Bearer <admin-token>
```

This re-queues the webhook for processing. The next `drain()` cycle will pick it up.

## Bulk identify and replay

List all failed webhooks:

```
GET /admin/webhook-events
```

Filter for `processingStatus: failed`. For each, call the retry endpoint above.

If the webhook processor worker is not running, the re-queued events will sit until the worker resumes. Confirm the worker is active before replaying in bulk.

## Identify the root cause first

Before replaying:

1. Check the audit log for `webhook.processing_failed` events and read the `error` field.
2. If the error is `Unknown payment_order`, the webhook arrived before submit completed — safe to replay after a few seconds.
3. If the error is a normalizer panic or unknown provider code, fix the normalizer before replaying.

## After replay

1. Confirm the webhook moves to `processingStatus: processed`.
2. Confirm the linked payment order status updated.
3. Confirm the ledger posting was enqueued and posted.
4. Re-run reconciliation to verify the exception clears.
