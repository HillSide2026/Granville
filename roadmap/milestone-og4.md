# Milestone OG4 — Incident & Recovery Operations

**Status: Complete (V1 scope)**
**Track: Operational Governance**

---

## Objective

Give operators the tools and procedures to recover from failures confidently: replay failed events, inspect dead-letter queues, roll back incorrect operations, and follow documented incident workflows.

---

## Scope

- Webhook replay tooling
- Dead-letter queue inspection and recovery
- Retry inspection (history of retry attempts)
- Rollback procedures for incorrect ledger entries
- Formal incident workflow documentation

---

## What Is Done

- Webhook replay: `adminRetryWebhook` re-queues a failed or ignored webhook; ops-ui retry button on each event
- Ledger posting retry: `adminRetryLedgerPosting` replays a dead-lettered posting; ops-ui retry button
- Dead-letter inspection: dead-lettered provider commands and ledger postings visible in ops-ui
- Retry attempt history: `processingAttempts` logged on each webhook; `retryCount` on provider commands and ledger postings
- AW2 runbooks: all five created in `ops/runbooks/airwallex/` (auth failure, rate limit burst, settlement delay, webhook signature mismatch, webhook replay)
- General runbooks in `ops/runbooks/`: ledger-writer-failure, payment-stuck-processing, provider-outage, reconciliation-exception, webhook-replay

---

## Also Done (added for V1 completion)

- Database backup and recovery procedure documented in `ops/runbooks/database-backup-recovery.md`

## Architecture: Beyond V1

Ledger rollback (compensating entries for incorrectly posted transactions) and formal incident post-mortem procedures are the natural next additions. Each new payment provider should also have its own runbook set following the Airwallex pattern.
