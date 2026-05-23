# Airwallex Rate Limit Burst Runbook

## Symptoms

- `AirwallexApiError` with status `429` in audit events
- Audit events: `provider_command.transient_error` (429 is classified transient — retry budget is NOT consumed)
- Payments in `processing` for longer than usual; command queue backlog rising
- Metrics: `queueBacklog` elevated, `paymentFailureRate` normal or slightly elevated

## Background

Airwallex enforces per-key rate limits. HTTP 429 responses are classified as transient errors in Granville's provider runtime. The command is reset to `pending` with a backoff delay (minimum 30 seconds, increasing with prior retry count) and will be re-attempted automatically. No retry budget is consumed.

A rate limit burst means payment processing slows but does not permanently fail unless the burst persists long enough that other non-transient failures accumulate on the same commands.

## Diagnosis

1. Check queue backlog:
   ```
   GET /admin/metrics
   ```
   Look at `queueBacklog`. A spike without a corresponding spike in `paymentFailureRate` confirms a transient slowdown.

2. Identify affected commands via audit events:
   ```
   GET /admin/audit-events
   ```
   Filter for `provider_command.transient_error` with `status: 429`.

3. Check the time distribution — a burst is a spike over seconds/minutes; a sustained 429 stream may indicate a misconfigured key or an ongoing Airwallex incident.

## Resolution

**Burst (short-duration):**
No action required. Commands automatically re-queue with backoff. Monitor `queueBacklog` until it returns to baseline. Processing will complete without intervention.

**Sustained (minutes or longer):**
1. Check Airwallex status page for an ongoing incident.
2. If the burst is caused by a runaway process (e.g., a bulk retry loop), stop the source.
3. If Airwallex has elevated limits available (higher-tier API key), request an upgrade via the Airwallex portal.
4. Do NOT manually retry commands — backoff is already in place; manual retries will worsen the rate limit situation.

**If payments have been in `processing` beyond SLA:**
Even with transient backoff in place, very long delays may be customer-visible. Communicate via your SLA process and monitor for eventual completion. If a command transitions to `dead_lettered` despite only transient errors (unexpected), that is a separate bug — capture the audit event and escalate.

## Monitoring

The relevant metrics to watch during a rate limit event:
- `queueBacklog` — should rise then fall as backoff drains
- `paymentFailureRate` — should NOT rise (429 is transient)
- Audit event counts for `provider_command.transient_error` vs `provider_command.failed`
