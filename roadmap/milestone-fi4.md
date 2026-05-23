# Milestone FI4 — Balance & Settlement Reconciliation

**Status: Partial — transaction-level reconciliation complete; automated and balance-level reconciliation pending.**
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

## What Is Outstanding

| Item | Notes |
|---|---|
| Automated reconciliation | Reconciliation is triggered manually today; no cron-driven scheduled runs |
| Provider balance comparison | `getBalance` implemented in the Airwallex adapter but not wired to a reconciliation pass that compares it to Granville's internal balance |
| Settlement validation | Airwallex-reported settlement amounts not yet compared to Granville-posted amounts |
| Reconciliation variance history | No historical tracking of reconciliation variance over time |
| Missing event detection | No automated check for payments stuck in `pending_settlement` beyond SLA without a corresponding webhook |

---

## What Is Blocked

- Real provider balance comparison blocked on AW2 balance API scope (Airwallex portal: add Balances read scope to API key)

---

## Acceptance Criteria

- Reconciliation automated: runs on a schedule without manual trigger
- Settlement mismatches surfaced operationally: visible in ops-ui before end-of-day
- Orphaned transactions detected automatically: provider transactions with no matching Granville payment order flagged
- Reconciliation variance tracked historically: each run's summary stored and queryable
