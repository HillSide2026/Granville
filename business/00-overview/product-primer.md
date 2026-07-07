# Product Primer (for Business Development)

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

A plain-language translation of what the engineering repo builds, written for anyone selling,
partnering, or fundraising. **When product and this primer disagree, the product wins** —
verify against [`../../README.md`](../../README.md), [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md),
and [`../../roadmap/`](../../roadmap/).

---

## The 30-second version

Granville is a **unified financial operating platform** that gives an operating business one
system for its money and its books. It **provides the regulated financial services** —
compliant payments, balances, FX, payouts — and records every one of them in an immutable
double-entry ledger as it happens. Accounting, finance, and payments stop being three
disagreeing tools and become one truth. The customer doesn't hold the licences, integrate the
rails, or pass the audits — the platform absorbs that.

## What it does, in buyer terms

| Capability | What the customer gets | Why they care |
|---|---|---|
| **Regulated money movement** | Compliant payments/payouts without their own licence | Move money without becoming a fintech |
| **Merged accounting** _(within Granville — see scope note)_ | Every payment writes to Granville's own immutable double-entry ledger live | The record of what Granville moved always ties out |
| **Balances & FX** | Multi-currency balances, wallets, FX in-platform | Treasury without a separate provider |
| **Budgets & sales** | Operating-business finance workflows in the portal | Run the business, not just move money |
| **Reconciliation** | Automated rail ↔ ledger matching + aging | Breaks caught automatically, not at close |
| **Provider abstraction** | One surface across EMI/bank rails, routing + failover | Coverage they never have to build |
| **Audit trail** | Immutable event + state history | Clean records if anyone ever asks |

> **⚠️ Scope note — what "merged accounting" means TODAY.** Granville is its *own* immutable
> ledger of record for the money **it** moves — the payout and its ledger entry are one event
> *inside Granville*. Granville does **NOT** currently integrate with the customer's existing
> accounting provider (QuickBooks / Xero / NetSuite). Getting Granville's ledger into their
> books is **manual today** and a **known roadmap gap — not part of the current GTM.**
> **Sales must never promise a QuickBooks/Xero sync.** The right claim is: "everything you run
> *through Granville* is booked and reconciled automatically." See
> [positioning scope](../03-positioning/positioning-and-messaging.md#scope-what-merged-books-means-today).

## What it is *not* (say this out loud in every deal)

Not a bank. Not custody. Not core banking. Not lending. Not card issuing. And **the customer
does not need to be regulated to use it** — Granville provides the regulated services; the
customer consumes them. **Not an accounting-software integration** — it does not (yet) sync to
QuickBooks/Xero. Setting these boundaries early prevents mis-sold expectations.

## Architecture in one breath

Frontend (`portal`, `ops-ui`) → Granville API → orchestrator/provider-runtime/ledger-writer/
reconciler/webhook-ingest → Formance Ledger (accounting) + EMI/bank rails + mpcium (crypto
wallets, optional). Full picture: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md).

> **⚠️ Rail note — business ≠ codebase.** The codebase/roadmap wires **Airwallex** as the
> first rail (AW1–AW3). **The business has dropped Airwallex** (cost to get started is
> prohibitive) and is moving to **Rapyd** as the primary payments channel, via a revenue-share
> partnership currently **in negotiation**. Until Rapyd is integrated, the repo and the
> go-to-market plan disagree on the rail — that's expected during the switch; see
> [partnerships](../04-gtm/partnerships.md). Keep external messaging **provider-agnostic**.

## Where the product actually is (as of last review)

Pulled from [`../../roadmap/README.md`](../../roadmap/README.md) — **re-check before quoting to a prospect:**

- **Provider integration** — the codebase's Airwallex MVP (AW1 complete, AW2 in progress) is
  **being retired from the plan**: Airwallex is dropped on cost, and go-live now depends on the
  **Rapyd** integration (partnership in negotiation). Treat the AW milestones as legacy.
- **Granville MVP** — persistence, portal/ops workflows, reporting, durable events. Postgres
  checkpoint done (123/123 tests). Design-system + ops-ui approvals in flight.
- **Version 1** — hardening. Several milestones complete (ledger state machine, reconciliation,
  durable events, secrets, backup/recovery); multi-provider parked until after MVP.

**BD implication:** the sellable story *today* is "one platform that moves real money and keeps
the books in the same immutable ledger, first rail going live." The multi-provider and full
institutional-controls story is **near-term roadmap, not yet shipped** — mark it
`[ASPIRATIONAL]` in customer materials.

## Proof points a buyer can verify

- Deterministic, replay-safe payment lifecycle (state machine).
- Reconciliation + aging pass scheduled in the running server.
- Immutable audit event capture.
- No hardcoded secrets; documented backup/recovery.

Use these as concrete diligence answers, not marketing adjectives.
