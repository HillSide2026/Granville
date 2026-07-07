# Product Primer (for Business Development)

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

A plain-language translation of what the engineering repo builds, written for anyone selling,
partnering, or fundraising. **When product and this primer disagree, the product wins** —
verify against [`../../README.md`](../../README.md), [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md),
and [`../../roadmap/`](../../roadmap/).

---

## The 30-second version

Granville is the platform an operating business uses to **pay its global team across countries
and currencies**. Its **finance team cues up** the payments and transfers the principal needs to
make; the **principal approves and sends** them. Granville **provides the regulated services**
underneath — compliant movement, FX, balances — and keeps an **auditable record of every
payment**. The customer doesn't hold licences, integrate rails, or build a payments function —
the platform absorbs that. It is **not** the customer's accounting system.

## What it does, in buyer terms

| Capability | What the customer gets | Why they care |
|---|---|---|
| **Pay the global team** | Compliant cross-border payouts/transfers, many currencies | Pay everyone without becoming a fintech |
| **Cue up + approve** | Finance prepares a payment run; principal reviews and releases it | Delegate the work, keep control |
| **Record of every payment** | Each payment recorded on an immutable ledger + reconciled vs. the rail | See and trust exactly what moved |
| **Balances & FX** | Multi-currency balances, wallets, FX in-platform | Treasury without a separate provider |
| **Budgets** | Operating-business finance workflows in the portal | Plan the spend, not just send it |
| **Provider abstraction** | One surface across EMI/bank rails, routing + failover | Coverage they never have to build |
| **Audit trail** | Immutable event + state history | Clean records if anyone ever asks |

> **⚠️ Scope note — the "record," not the customer's books.** Granville keeps an immutable,
> reconciled record of the payments **it** makes — so you can see and trust exactly what moved.
> That is **not** the customer's accounting system, and Granville does **NOT** integrate with
> QuickBooks / Xero / NetSuite. Syncing to the customer's accounting software is a **known
> roadmap gap — not part of the current GTM.** **Sales must never promise a QuickBooks/Xero
> sync**, and must never call Granville the customer's "books." The right claim is: "every
> payment you make *through Granville* is recorded and reconciled automatically." See
> [positioning banned phrases](../03-positioning/positioning-and-messaging.md).

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

**BD implication:** the sellable story *today* is "one platform to pay your global team —
finance cues up the run, principal approves, money goes out compliantly, every payment on the
record." The multi-provider and full institutional-controls story is **near-term roadmap, not
yet shipped** — mark it `[ASPIRATIONAL]` in customer materials. Accounting-software integration
is **not** in scope today.

## Proof points a buyer can verify

- Deterministic, replay-safe payment lifecycle (state machine).
- Reconciliation + aging pass scheduled in the running server.
- Immutable audit event capture.
- No hardcoded secrets; documented backup/recovery.

Use these as concrete diligence answers, not marketing adjectives.
