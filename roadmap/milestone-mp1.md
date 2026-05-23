# Milestone MP1 — EMI Provider Integration

**Status: Partial — Airwallex sandbox complete (AW1); AW2 certification in progress; second provider not started.**
**Track: Multi-Provider Orchestration**

---

## Objective

Integrate one or more EMI providers in sandbox, proving the adapter interface, webhook ingestion, and account orchestration patterns against real provider infrastructure.

---

## Scope

- EMI sandbox integration
- Provider adapter implementation
- Webhook ingestion
- Account orchestration

---

## What Is Done

**Airwallex (AW1 — complete):**
- Full payout flow: auth → beneficiary create → transfer create → `SCHEDULED`
- All six `PaymentAccountProvider` operations implemented in live mode
- HMAC-SHA256 webhook signature verification
- Transient error handling: 429/502/503/504 reset without burning retry budget
- 8 sandbox-gated acceptance tests passing

**AW2 — in progress:**
- Ops runbooks: all five created (`ops/runbooks/airwallex/`)
- Webhook signature verification: implemented and tested
- Open: webhook endpoint registration (external), Balances API scope (external), compliance review (legal), PAID event path validation

---

## What Is Outstanding

| Item | Blocked by |
|---|---|
| AW2 webhook endpoint registration | Matthew: register public HTTPS endpoint in Airwallex sandbox portal |
| AW2 balance API scope | Matthew: add Balances read scope in Airwallex portal |
| AW2 PAID event path validation | AW2 webhook endpoint |
| AW2 compliance review | Legal team |
| Second EMI provider | Provider contract + AW2 completion |
| Production credential activation | AW2 sandbox acceptance + compliance sign-off |

---

## Acceptance Criteria

- Provider integration operational in sandbox: complete payment lifecycle from initiation to settlement confirmation
- Provider events normalized into canonical flows: webhook payloads map to standard internal events without leaking provider-specific structure into orchestration
