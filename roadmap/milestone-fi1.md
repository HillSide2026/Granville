# Milestone FI1 — Ledger & Payment State Machine

**Status: Partial — core lifecycle and mock ledger done; real Formance, canonical states, and reversal flow pending.**

---

## Objective

Establish the ledger as the canonical financial source of truth, and implement a provider-independent payment lifecycle that is auditable, replay-safe, and compliance-gate-aware. Balances are derived from the ledger, not stored as mutable fields.

---

## Scope

- Immutable double-entry journal entries
- Compensating entries for reversals and corrections
- Derived balances only (no stored balance fields)
- Canonical Version 1 payment states with valid transition enforcement
- `compliance_review` gate before routing
- `reversed` state with compensating ledger entry

---

## Canonical Version 1 States

| State | Meaning |
|---|---|
| `initiated` | Payment order created, pre-compliance |
| `compliance_review` | Held for KYC/AML review |
| `approved` | Cleared compliance, ready for routing |
| `submitted` | Sent to provider |
| `pending_settlement` | Provider accepted; awaiting settlement confirmation |
| `settled` | Provider confirmed settlement |
| `failed` | Non-recoverable failure |
| `reversed` | Payment reversed; compensating ledger entry posted |

---

## What Is Done

**Ledger:**
- `LedgerWriter` with idempotent posting: deterministic `transactionId` keyed on `paymentOrderId + attemptId`
- `paymentCompletedPosting` constructs a balanced Formance-compatible transaction with canonical account taxonomy (`customers:{id}`, `providers:{key}`, `fees`, `suspense`)
- Mock Formance client accepts all postings in-memory and returns synthetic `formanceTransactionId` values
- Admin retry path: dead-lettered postings replayed via `adminRetryLedgerPosting`

**State machine:**
- Full payment lifecycle in `GranvilleOrchestrator`: create, submit, cancel, retry, fail
- State transitions emit audit events
- Invalid transition enforcement
- `pending_review` state exists as a manual approval gate

---

## What Is Outstanding

| Item | Notes |
|---|---|
| Real Formance Ledger proof | Swap mock client for live `FORMANCE_LEDGER_URL` once M1 Postgres checkpoint passes |
| Compensating entries | No reversal/correction posting template — corrections require manual Formance intervention |
| Balance derivation from ledger | `PaymentAccount.balance` is a stored field updated by the orchestrator, not derived from journal entries |
| Canonical state migration | Granville MVP states (`created`, `processing`, `provider_accepted`, `completed`) need to map to Version 1 states (`initiated`, `submitted`, `pending_settlement`, `settled`) |
| `compliance_review` gate | `pending_review` exists but is not wired to a KYC/AML step; payments can bypass it |
| `reversed` state and posting | No reversal flow; no compensating posting template |

---

## What Is Blocked

- Real Formance Ledger proof blocked on M1 Postgres checkpoint

---

## Acceptance Criteria

- Balances derived exclusively from journal entries — no stored balance fields
- All ledger movements mathematically balanced
- Entries immutable after commit — no update or delete path
- Corrections handled through compensating entries only
- Invalid state transitions blocked at the orchestrator level
- All transitions emit auditable events with previous and new state recorded
- `compliance_review` gate enforced: payments do not route until approved
- `reversed` state reached only via explicit reversal flow with compensating ledger entry
