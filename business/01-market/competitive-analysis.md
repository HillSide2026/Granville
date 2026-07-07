# Competitive Analysis

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

Who an operating business could buy *instead of* Granville, and why the merged
money-plus-books story beats each. **Validate every competitor claim before external use** —
positioning against a named competitor incorrectly is a credibility risk.

---

## The honest framing

No single competitor does what Granville does — **that is both the opportunity and the
problem.** Businesses today assemble the outcome from several tools. So our real competitor is
**the status quo stack**: a business bank/payments tool + an FX provider + an accounting
package + a person reconciling them in spreadsheets.

Granville wins by collapsing that stack into one system where the payment *is* the ledger
entry. We lose when a business decides the stack is "fine for now."

## Competitive map

| Competitor type | Examples | Where they're strong | Where Granville wins |
|---|---|---|---|
| **The status quo stack** | Bank + FX tool + Xero/QBO + spreadsheets | Familiar, cheap, "good enough" | One truth, live reconciliation, no manual close, no glue |
| **Contractor-payout / global-payroll tools** _(key incumbent for the agency wedge)_ | Deel, Remote, Wise, PayPal, Payoneer | Purpose-built for paying foreign contractors | They pay, then hand you a report; we pay **and** book it into an immutable ledger, live |
| **Business banking / spend** | Mercury, Brex, Ramp, Revolut Business | Great UX, cards, spend controls | They export to accounting; we *are* the accounting record |
| **Cross-border / FX** | Wise Business, Airwallex, Currencycloud, Payoneer | Deep rails, rates, coverage | They move money; we move money *and* book it immutably. We can even sit on top of them |
| **Accounting / ERP** | QuickBooks, Xero, NetSuite | System of record, ecosystem | Their ledger is fed by manual entry/bank feeds; ours by real settled movement |
| **Embedded finance / BaaS** | Unit, Solaris, Griffin, Column | Powerful for *builders* | They sell toolkits to fintech builders; we sell a finished outcome to operating businesses |
| **Ledger / treasury infra** | Modern Treasury, Formance, Fragment | Strong primitives | Infra for engineers; we package it as a business product (and build on Formance) |

## Per-competitor talk tracks (DRAFT — validate)

### vs. the status quo stack
- "How long does your month-end close take, and how often does the bank tie out to the books
  on the first pass?" The stack's cost is hidden in labour and lateness. Granville's payment
  and ledger entry are the same event, so the answer is *always* and *now*.

### vs. business banking / spend platforms (Mercury/Brex/Ramp/Revolut)
- They give a great account and then hand you a CSV. Granville is the account **and** the
  double-entry books, with regulated movement and FX in one place. If they're on one of these,
  ask what happens between that tool and their accounting system.

### vs. contractor-payout / global-payroll tools (Deel/Wise/PayPal/Payoneer) — the wedge fight
- This is who the beachhead agency is *actually* using to pay foreign contractors today. They
  solve the *payment*; they do **not** solve the *books*. The agency still exports payouts, FX,
  and fees into QuickBooks/Xero and reconciles by hand every month.
- Talk track: "Deel/Wise gets the money to your contractor. Then what? How does that payout,
  the FX, and the fee land in your books — and how long does reconciling it take each month?"
- **Scope discipline:** Deel/Remote also sell *employment payroll, contracts, compliance,
  EOR.* Granville is **not** that — we do the payout + the books. Don't get dragged into
  competing on employment/EOR; win on merged money-and-books. (See
  [regulatory-context](regulatory-context.md).)

### vs. cross-border / FX (Wise/Airwallex/Currencycloud)
- These are rails, and Granville **abstracts rails**. We are not trying to beat their FX rate;
  we make the movement disappear into the books. Potential *partners* as much as competitors —
  our intended primary channel is a rev-share partnership with **Rapyd** (in negotiation; keep
  external messaging provider-agnostic). See [partnerships](../04-gtm/partnerships.md).

### vs. accounting/ERP (QuickBooks/Xero/NetSuite)
- Their ledger is only as true as the last manual reconciliation. Ours is fed by settled
  money movement with an immutable audit trail. Complement or replace depending on customer
  maturity — decide our stance (integrate vs. displace). **Open question.**

### vs. embedded finance / BaaS (Unit/Solaris/Griffin/Column)
- They sell to teams *building* a fintech. Our customer does not want to build a fintech —
  they want to run their business. We deliver the outcome; they deliver Lego.

## Where we are genuinely weak (say it internally, plan for it)

- **Breadth/maturity** — incumbents have years of features, integrations, and trust.
- **No production rail live yet** — Airwallex was dropped on cost and the primary channel
  (Rapyd) is a pending partnership. Provider abstraction is proven in code, but there is real
  execution risk until Rapyd is integrated. This is the single biggest gap to close.
- **Brand/references** — zero live logos until first go-live. This is the top priority to fix.
- **Accounting-feature depth** — we own the *ledger truth*, not (yet) full AP/AR, tax, payroll.

## Open competitive questions

- [ ] Do we **integrate with** or **replace** the incumbent accounting system? (Big GTM fork.)
- [ ] Are FX/payment providers (Rapyd as intended primary partner; Wise/Airwallex/Payoneer as
      what customers compare us to) partners, competitors, or both — and how do we message it?
- [ ] Which competitor's customers are most winnable given our current product state?

## Battlecard maintenance

Keep this current. When a competitor ships something that changes a talk track, update the row
and the `Last reviewed` date. A stale battlecard loses deals.
