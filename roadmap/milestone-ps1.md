# Milestone PS1 — Durable Event Infrastructure

**Status: Partial — durability patterns implemented in-memory; persistence blocked on M1 Postgres.**
**Track: Platform Reliability & Security**

---

## Objective

Ensure that async event infrastructure — provider commands, webhooks, ledger postings — survives process restarts, partial failures, and concurrent execution without data loss or double-processing.

---

## Scope

- Durable async queues (persist across restarts)
- Retry orchestration with backoff
- Event persistence (not in-memory only)
- Replay-safe processing

---

## What Is Done

- Webhook storage before processing: every inbound webhook is written to the store before execution begins
- Provider command queue: `providerCommandQueue` persists commands between claim and execution
- Ledger posting queue: `ledgerQueue` persists postings between enqueue and write
- Processing attempt logs: each attempt records start time, outcome, and error
- Backoff on transient errors: `markProviderCommandTransient` applies a minimum 30-second backoff; interval grows with retry count
- Dead-letter thresholds: 3 non-transient failures dead-letter provider commands; ledger dead-letter path also implemented
- Idempotency on replay: all queue consumers check idempotency keys before re-executing

---

## What Is Outstanding

| Item | Notes |
|---|---|
| Persistent queue | All queues live in `InMemoryGranvilleStore` — a process restart loses all pending work |
| Queue recovery after restart | No mechanism to resume in-flight work after an unclean shutdown |
| Distributed queue safety | With multiple API instances, the same command could be claimed by multiple workers |
| Postgres-backed queues | `PostgresGranvilleStore` queue methods not confirmed equivalent to in-memory behavior |

---

## What Is Blocked

- Persistent queue blocked on M1 Postgres checkpoint

---

## Acceptance Criteria

- Event delivery resilient under failure conditions: a process restart does not lose pending provider commands, webhooks, or ledger postings
- Queue recovery operationally validated: after an unclean shutdown, all in-flight events are replayed to completion without duplicates
