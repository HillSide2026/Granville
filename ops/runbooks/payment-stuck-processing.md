# Runbook: Payment Stuck in Processing

## Symptoms

- A payment order has been in `submitted_to_provider` or `processing` for more than 1 hour.
- Reconciliation surfaces a `stale_pending_transaction` exception for the payment.
- The customer or upstream system reports no completion confirmation.

## Step 1: Identify the stuck payment

Run reconciliation to surface stale payments:

```
POST /reconciliation/runs
GET /admin/reconciliation/exceptions
```

Filter for `category: stale_pending_transaction`. Note the `paymentOrderId`.

Inspect the payment:

```
GET /payments/{paymentOrderId}
GET /admin/payment-attempts   (filter by paymentOrderId in evidence)
```

Note the `providerReference` on the most recent attempt.

## Step 2: Query the provider

Use the `providerReference` to check the payment status in the provider's portal or API.

**Possible outcomes:**

### Provider says: Completed

The provider processed the payment but the result was not received (webhook missed or failed).

1. Check `GET /admin/webhook-events` for a webhook with the matching `providerReference`.
2. If webhook exists and is failed: replay it via `POST /admin/webhooks/{id}/retry`.
3. If no webhook exists: manually update the payment attempt status and enqueue a ledger posting.

### Provider says: Failed or Rejected

The provider rejected the payment.

1. Update the payment order to `failed`.
2. Emit an audit event with the provider's reason.
3. Notify the originating system or customer.
4. If appropriate, the caller can retry via `POST /payments/{id}/retry`.

### Provider says: Still Processing

The provider is still processing. This is expected for some payment rails (e.g., SWIFT, ACH next-day).

1. Extend the stale threshold for this payment by updating `submittedAt` to now (resets the 1-hour clock).
2. Set a calendar reminder to re-check at the provider's expected settlement time.
3. Resolve the reconciliation exception as `ignored` with a note explaining the expected settlement window.

### Provider says: Unknown / No Record

The payment was never received by the provider.

1. Mark the payment as `failed`.
2. The provider command can be retried: `POST /payments/{id}/retry`.
3. Confirm with the provider that the original instruction is fully voided before retrying to prevent double execution.

## Step 3: Confirm resolution

After resolving:

1. Re-run reconciliation to confirm the `stale_pending_transaction` exception is gone.
2. Confirm the ledger posting exists and is posted for completed payments.
3. Resolve or ignore the reconciliation exception with a note.

## Prevention

The `stale_pending_transaction` threshold is 1 hour. Adjust this per rail if your provider's SLA is longer (e.g., SWIFT = 1-2 days). The threshold is defined in `apps/reconciler/src/reconciler.ts` as `STALE_THRESHOLD_MS`.
