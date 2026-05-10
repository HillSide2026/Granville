# Runbook: Ledger Writer Failure

## Symptoms

- `ledger_posting_failures` metric is non-zero.
- `GET /admin/ledger-postings` shows items with `status: dead_lettered` or `status: failed`.
- Reconciliation produces `ledger_posting_missing` exceptions for completed payments.

## Cause

A ledger posting enters `dead_lettered` after 3 consecutive failures. Common causes:

- Formance Ledger was unreachable (network issue, restart).
- Idempotency key collision (should not happen in normal operation).
- Malformed posting payload (bug in posting template).

## Check posting details

```
GET /admin/ledger-postings
```

Identify items with `status: dead_lettered`. Note the `lastError` and `retryCount` fields.

Read the posting payload to confirm the account taxonomy and amounts look correct:

- `customers:{id}:available` → `customers:{id}:pending` (on submit)
- `customers:{id}:pending` → `providers:emi:{id}:clearing` (on complete)

## Replay a dead-lettered posting

```
POST /admin/ledger-postings/{postingId}/retry
Authorization: Bearer <admin-token>
```

This resets `retryCount` to 0, sets status back to `pending`, and runs the ledger writer immediately.

The posting uses a deterministic idempotency key — replaying is safe. Formance Ledger will reject a duplicate and the writer will treat that as a successful post.

## Confirm Formance Ledger is healthy

Before replaying in bulk, confirm the Formance Ledger service is responding:

```
curl http://localhost:3068/_/healthcheck
```

If Ledger is down, resolve that first. Replaying into a down Ledger will re-dead-letter all items immediately.

## After replay

1. Confirm status changes to `posted`.
2. Re-run reconciliation to confirm `ledger_posting_missing` exceptions resolve.
3. Monitor `ledger_posting_failures` metric for 10 minutes.

## Prevention

The ledger writer retries with backoff (1s, 2s, 3s delay). If Formance Ledger has periodic restarts, increase the retry window or add a health-check gate before the posting loop.
