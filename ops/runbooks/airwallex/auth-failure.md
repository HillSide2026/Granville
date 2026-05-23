# Airwallex Auth Failure Runbook

## Symptoms

- Provider commands returning `AirwallexApiError` with status `401`
- Audit events: `provider_command.failed` with `error` containing "unauthorized" or "token"
- Payments stuck in `processing` with `lastError` referencing auth
- Metrics: elevated `paymentFailureRate`

## Background

Airwallex issues short-lived Bearer tokens via `POST /api/v1/authentication/login`. The Granville adapter caches the token in memory and re-authenticates on the next request if the token has expired. Token expiry is typically 30 minutes. Auth failure does NOT count as a transient error — it immediately fails the command.

## Diagnosis

1. Check the most recent audit events for the affected payment:
   ```
   GET /admin/audit-events?resourceType=provider_command
   ```
   Look for `provider_command.failed` with `error` containing `401`.

2. Confirm the Airwallex binding is still `healthy`:
   ```
   GET /admin/providers
   ```

3. Verify that `AIRWALLEX_CLIENT_ID` and `AIRWALLEX_API_KEY` env vars are set and match the sandbox/production credentials in the Airwallex portal.

4. Run the auth probe script to confirm credentials are valid:
   ```
   node --experimental-strip-types scripts/airwallex-auth-probe.ts
   ```

## Resolution

**If credentials are valid but the request failed transiently:**
The adapter re-authenticates on the next attempt. Retry the failed command:
```
POST /admin/payments/:id/retry
```

**If credentials have been rotated or are invalid:**
1. Update `AIRWALLEX_CLIENT_ID` and `AIRWALLEX_API_KEY` in the environment / secrets manager.
2. Restart the Granville API server so the adapter picks up the new credentials.
3. Retry any dead-lettered commands via `POST /admin/payments/:id/retry`.

**If the Airwallex binding was disabled due to repeated failures:**
1. Confirm the root cause is resolved (credentials valid, Airwallex API reachable).
2. Re-enable the provider:
   ```
   POST /admin/providers/airwallex/enable
   ```
3. Monitor the audit log for new `provider_command.executed` events.

## Escalation

If re-authentication fails after credential update, raise a ticket with Airwallex support referencing the `CLIENT_ID` and the error code returned in the auth response body.
