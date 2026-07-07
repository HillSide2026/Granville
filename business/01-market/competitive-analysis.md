# Competitive Analysis

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

Who an operating business could buy *instead of* Granville, and how the **pay-your-team
workflow** (cue up → approve → pay → record) beats each. **Validate every competitor claim
before external use** — positioning against a named competitor incorrectly is a credibility
risk. (And never claim we're the customer's accounting system — see
[positioning banned phrases](../03-positioning/positioning-and-messaging.md).)

---

## The honest framing

No single competitor does what Granville does — **that is both the opportunity and the
problem.** Businesses today assemble the outcome from several tools. So our real competitor is
**the status quo stack**: a business bank + a payout tool (Wise/PayPal/Deel) + an FX provider +
a spreadsheet, with the founder personally pushing each payment.

Granville wins by making paying a global team a **cue-up-and-approve workflow in one place** —
compliant movement, FX, and a trustworthy record of every payment. We lose when a business
decides the stack is "fine for now."

## Competitive map

| Competitor type | Examples | Where they're strong | Where Granville wins |
|---|---|---|---|
| **The status quo stack** | Bank + Wise/PayPal/Deel + FX + spreadsheet | Familiar, cheap, "good enough" | Cue-up/approve workflow, one place, compliant, one clean record — no founder bottleneck |
| **Contractor-payout / global-payroll tools** _(key incumbent for the agency wedge)_ | Deel, Remote, Wise, PayPal, Payoneer | Purpose-built for paying foreign contractors | They send money; we add the prepare→approve workflow, FX+balances+budgets in one place, and a single record of every payment |
| **Business banking / spend** | Mercury, Brex, Ramp, Revolut Business | Great UX, cards, spend controls | Not built for cueing up + approving cross-border contractor runs; we are |
| **Cross-border / FX** | Wise Business, Airwallex, Currencycloud, Payoneer | Deep rails, rates, coverage | They're a rail; we abstract rails and add the workflow + records. We can sit on top of them |
| **Accounting / ERP** | QuickBooks, Xero, NetSuite | System of record for the books | **Different job — not a competitor.** We pay the team and record those payments; they keep the books. We don't replace or (yet) integrate with them |
| **Embedded finance / BaaS** | Unit, Solaris, Griffin, Column | Powerful for *builders* | They sell toolkits to fintech builders; we sell a finished outcome to operating businesses |
| **Ledger / treasury infra** | Modern Treasury, Formance, Fragment | Strong primitives | Infra for engineers; we package it as a business product (and build on Formance) |

## Per-competitor talk tracks (DRAFT — validate)

### vs. the status quo stack
- "Who actually sends your contractor payments each month, and how? Could you hand that off to
  your ops person *without* giving them the bank login?" The stack's cost is the founder
  bottleneck and the scramble to track what was paid. Granville separates preparing from
  approving, and records every payment.

### vs. business banking / spend platforms (Mercury/Brex/Ramp/Revolut)
- Great accounts and cards — but they're not built to *cue up and approve a cross-border
  contractor run* with FX in one place, and they hand you a CSV afterward. We own that workflow.
  (We don't claim to be your accounting system either.)

### vs. contractor-payout / global-payroll tools (Deel/Wise/PayPal/Payoneer) — the wedge fight
- This is who the beachhead agency is *actually* using today. They **send** the money. They
  don't give the principal a *cue-up-and-approve* workflow, don't unify FX + balances + budgets,
  and don't leave you one clean record of every payment — and the founder is still the one
  pushing each payment.
- Talk track: "Deel/Wise gets the money out. But who lines up the run, who approves it, and
  where's the single record of everything you paid? How much of that is still you + a spreadsheet?"
- **Scope discipline:** Deel/Remote also sell *employment payroll, contracts, EOR.* Granville is
  **not** that (contractor payouts, not employment payroll) and is **not** an accounting system.
  Win on the workflow + compliant movement + records. (See [regulatory-context](regulatory-context.md).)

### vs. cross-border / FX (Wise/Airwallex/Currencycloud)
- These are rails, and Granville **abstracts rails**. We're not trying to beat their FX rate; we
  wrap the movement in the cue-up/approve workflow and a record you can trust. Potential
  *partners* as much as competitors — our intended primary channel is a rev-share partnership
  with **Rapyd** (in negotiation; keep external messaging provider-agnostic). See
  [partnerships](../04-gtm/partnerships.md).

### vs. accounting/ERP (QuickBooks/Xero/NetSuite) — NOT a competitor
- **We do not compete with the customer's accounting software and must not claim to.** Granville
  pays the team and keeps a reconciled record of *those payments*; the accounting system keeps
  the full books. We neither replace nor (today) integrate with QuickBooks/Xero — integration is
  future roadmap, not GTM. Position as complementary; the clean payment record makes the
  accountant's job easier.

### vs. embedded finance / BaaS (Unit/Solaris/Griffin/Column)
- They sell to teams *building* a fintech. Our customer does not want to build a fintech —
  they want to run their business. We deliver the outcome; they deliver Lego.

## Where we are genuinely weak (say it internally, plan for it)

- **Breadth/maturity** — incumbents have years of features, integrations, and trust.
- **No production rail live yet** — Airwallex was dropped on cost and the primary channel
  (Rapyd) is a pending partnership. Provider abstraction is proven in code, but there is real
  execution risk until Rapyd is integrated. This is the single biggest gap to close.
- **Brand/references** — zero live logos until first go-live. This is the top priority to fix.
- **No accounting integration** — we don't sync to QuickBooks/Xero, so the customer still moves
  our payment records into their books manually. By design today, but a real gap for some buyers.

## Open competitive questions

- [ ] **When** (not whether) do we build accounting-provider integration, and does its absence
      cost us deals in the meantime? (Not GTM now, but a known future need.)
- [ ] Are FX/payment providers (Rapyd as intended primary partner; Wise/Airwallex/Payoneer as
      what customers compare us to) partners, competitors, or both — and how do we message it?
- [ ] Which competitor's customers are most winnable given our current product state?

## Battlecard maintenance

Keep this current. When a competitor ships something that changes a talk track, update the row
and the `Last reviewed` date. A stale battlecard loses deals.
