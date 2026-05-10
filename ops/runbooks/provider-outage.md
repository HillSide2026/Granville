# Runbook: Provider Outage

## Symptoms

- `provider_outage_status` metric shows `degraded` or `disabled` for a provider binding.
- Payment submissions are failing with provider errors in the audit log.
- `payment_failure_rate` rising with `lastError` referencing provider connectivity.

## Immediate response

### 1. Confirm the outage

Check the admin API for current provider health:

```
GET /admin/metrics
```

Look at `providerOutageStatus`. Confirm the failing provider binding id via:

```
GET /admin/provider-transactions?limit=10
```

Check the most recent provider request attempts for error patterns.

### 2. Disable the affected provider

This stops new payments routing to the degraded provider:

```
POST /admin/providers/{adapterKey}/disable
Authorization: Bearer <admin-token>
```

Example: `POST /admin/providers/native-emi/disable`

This emits an audit event and sets health to `disabled`. The routing engine will skip disabled providers.

### 3. Check for stuck payments

Payments in `submitted_to_provider` or `processing` at the time of the outage may be stuck. Run a reconciliation to surface them:

```
POST /reconciliation/runs
```

Open exceptions of category `stale_pending_transaction` identify affected payments.

### 4. Communicate to stakeholders

Note the outage start time from the audit log (`admin.provider.disabled` event timestamp).

### 5. Recovery

When the provider confirms recovery:

1. Re-enable by setting health back to `healthy` via the store or admin tooling.
2. Re-run reconciliation to confirm no outstanding exceptions.
3. Retry any dead-lettered provider commands if safe to do so.
4. Monitor `payment_failure_rate` for 15 minutes post-recovery.

## Escalation

If the provider is unresponsive for more than 30 minutes, escalate to the EMI relationship contact. Do not attempt to replay payments without confirming idempotency with the provider.
