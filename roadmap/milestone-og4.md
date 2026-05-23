# Milestone OG4 — Incident & Recovery Operations

**Status: Partial — retry tooling done; rollback and formal incident procedures pending.**
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

## What Is Outstanding

| Item | Notes |
|---|---|
| Ledger rollback | No compensating entry path for incorrectly posted ledger entries — correction requires manual Formance intervention |
| Formal incident workflow | No structured incident workflow document covering detection → triage → mitigation → post-mortem |
| Non-Airwallex provider runbooks | Runbooks exist only for Airwallex; each new provider needs its own set |
| Recovery testing | No automated test that validates a dead-letter → replay → completion sequence end-to-end |

---

## Acceptance Criteria

- Failed events recoverable operationally: webhook and ledger dead-letters can be replayed to completion without data loss
- Incident handling procedures documented: at minimum, auth failure, provider outage, ledger posting failure, settlement delay, and reconciliation exception are covered
- Replay operations auditable: every retry or replay action emits an audit event with the operator identity
