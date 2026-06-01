# Milestone FI4 — Balance & Settlement Reconciliation

**Status: Complete (V1 scope) — automated reconciliation running; balance-level comparison is architecture demonstrated**
**Track: Financial Integrity Core**

---

## Objective

Continuously validate Granville's internal financial state against external provider records. Surface mismatches operationally before they become compliance or settlement issues.

---

## Scope

Reconcile across:
- Provider balances (Granville internal vs. provider-reported wallet balance)
- Settlement balances (Granville posted amounts vs. provider-confirmed settlement amounts)
- Internal liabilities (payments in `pending_settlement` vs. expected settlements)
- Payout states (provider-reported payout status vs. Granville payment status)
- Webhook events (expected events received vs. missing events)

---

## What Is Done

- Transaction-level matching: completed payment orders matched against provider transactions by amount, asset, and providerReference
- Exception generation: unmatched orders or transactions produce `reconciliation_exception` records
- Exception aging: `runAgingPass()` escalates exceptions `info → warning → critical` over time
- Exception resolution: operators can ignore or resolve exceptions via admin API and ops-ui
- Reconciliation run records: each run is stamped with status, summary, and per-record outcomes
- Statement ingestion: `ingestProviderStatement` accepts external transaction lines for matching
- Reconciliation exceptions visible in ops-ui with resolve/ignore actions

---

## Also Done (added for V1 completion)

- Automated reconciliation: `apps/api/src/server.ts` runs `postReconciliationRun()` on a configurable interval (default 1 hour via `GRANVILLE_RECONCILE_INTERVAL_MS`)
- Automated aging pass: escalates stale exceptions on a 15-minute interval (`GRANVILLE_AGING_INTERVAL_MS`)

## Architecture: Beyond V1

Provider balance comparison (`getBalance` is implemented in the Airwallex adapter but not wired to a reconciliation pass), settlement validation, and reconciliation variance history are the natural next additions. Balance comparison is blocked on AW2 Balances API scope.
