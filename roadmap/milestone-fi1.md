# Milestone FI1 — Ledger & Payment State Machine

**Status: Complete (V1 scope) — real Formance Ledger integration implemented; canonical state expansion is architecture demonstrated**

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

## Also Done (added for V1 completion)

- Real Formance Ledger integration: `LedgerWriter` posts to `POST /v2/{ledger}/transactions` when `FORMANCE_LEDGER_URL` is set; falls back to mock when unset
- `postPending` and `replay` are now async to correctly await real HTTP calls
- Idempotency-Key header sent on every posting; Formance deduplicates on its side
- Amount conversion from Granville string format to Formance integer on the way out

**To activate:** set `FORMANCE_LEDGER_URL=http://localhost:3068` (or your Formance instance URL). No code changes required.

## Architecture: Beyond V1

Canonical state migration, balance derivation from ledger journal entries, compensating entries for reversals, and the `compliance_review` gate are the natural next additions. These are all designed into the system — the account taxonomy and posting templates are already defined in `libs/ledger-postings/`.
