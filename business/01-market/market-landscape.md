# Market Landscape

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

Where Granville plays, how big the space is, and which way the wind is blowing. Treat sizing
figures as **placeholders to be validated** — replace with sourced numbers before any external use.

---

## The category

Granville sells to **operating businesses** and gives them one platform where **accounting,
finance, and payments are merged**. Granville itself provides the regulated financial
services underneath, so the customer moves money and keeps compliant books without holding
licences or integrating rails.

That places Granville at the intersection of three categories that are usually bought
separately:

| Category the buyer knows | Example players | What Granville does differently |
|---|---|---|
| Business banking / spend | Mercury, Brex, Ramp, Revolut Business | We are money **and the ledger of record** in one system, not a bank account + export |
| Cross-border payments / FX | Wise Business, Airwallex, Currencycloud, Payoneer | We move money **and post it to the books live**; the rail is abstracted, not the product |
| Accounting / bookkeeping | QuickBooks, Xero, NetSuite | Our ledger is fed by real money movement, not manual entry / bank-feed reconciliation |
| Embedded finance / BaaS | Unit, Solaris, Griffin, Column | We deliver the *outcome* (regulated services + merged books) to the business, not toolkits to a builder |

**The wedge:** every alternative forces the business to keep money in one tool and the books
in another and reconcile the gap forever. Granville removes the gap by making the payment and
the ledger entry the same event.

## Why now (tailwinds)

- **The accounting/payments split is universal pain.** Every operating business runs a bank
  or payments tool that does not agree with its accounting system; close is manual and late.
- **Embedded/regulated finance is now deliverable** — ledger-as-truth infrastructure
  (Formance, Modern Treasury, TigerBeetle) makes "money + books as one system" buildable.
- **Businesses want outcomes, not fintech projects.** They will pay to *not* obtain licences,
  integrate EMIs, or staff a payments/compliance team.
- **Cross-border and multi-currency operations** are increasingly normal for even small
  businesses, and the FX + accounting reconciliation burden scales badly.

## Headwinds / risks

- **Category confusion** — "is it a bank? an accounting tool?" We must lead with the merged-truth
  outcome, not the plumbing. See [positioning](../03-positioning/positioning-and-messaging.md).
- **Trust to hold/route money** — a young platform providing regulated services must earn
  confidence; references and clear boundaries matter more than features early.
- **Incumbent inertia** — businesses tolerate the spreadsheet/bank/accounting stack because
  switching finance systems is scary. Migration friction is real.
- **Formance dependency** — our ledger foundation is a third party (repo `CODEOWNERS`:
  `@formancehq/backend`); concentration risk to manage in narrative and architecture.
- **Regulatory surface we carry** — providing regulated services is the moat *and* the
  obligation; scope creep here is existential, not just costly.

## Market sizing (PLACEHOLDER — validate before use)

| Layer | Definition | Rough basis to fill in |
|---|---|---|
| TAM | Operating businesses that move money + keep books (all) | # of SMB/mid-market businesses in target regions × finance-tooling spend |
| SAM | Businesses with real payment/FX volume feeling the accounting split | filtered by cross-border %, size band, region |
| SOM (Yr 1–2) | Reachable via founder network + Rapyd/Formance ecosystem proximity | design-partner count × ACV |

> **Action:** source business counts by segment/region and current spend on the tools we
> replace (banking + FX + accounting + reconciliation). Fill the table, cite sources.

## Segments: market to four, sell to one

**Publicly**, Granville addresses four segments — **agencies, influencers, marketplaces,
ecommerce** — all cross-border money movers that need their books to tie out. **Strategically**,
BD focuses the sales motion on one wedge: **Canada-based agencies paying foreign "payroll"**
(recurring cross-border contractor payouts) — the sharpest, most recurring version of the
merged-truth pain and the closest fit to the product today. Land the wedge, then expand across
the other three. Full definition: [ICP](../02-customers/icp-and-segments.md).

> Scope line: **contractor payouts, not formal employment payroll** — the latter carries
> employment-tax/jurisdiction obligations Granville is not taking on. See
> [regulatory-context.md](regulatory-context.md).

> Scope line: **contractor payouts, not formal employment payroll** — the latter carries
> employment-tax/jurisdiction obligations Granville is not taking on. See
> [regulatory-context.md](regulatory-context.md).

## Geographic beachhead (DECIDED): Canada-first

Founder is a Toronto payments/fintech lawyer → regulatory fluency to provide services safely,
warm agency/startup network, and home-jurisdiction advantage for the regulated-services path.
Broader geographies (UK/EU/US) are later waves once the model is proven. See
[regulatory-context.md](regulatory-context.md).

## Sources to gather

- [ ] Business counts by target segment and region (stats agencies, industry bodies)
- [ ] Spend benchmarks for the tools Granville consolidates (banking, FX, accounting, recon)
- [ ] 3–5 operating-business interviews to validate the merged-truth pain and willingness to pay
- [ ] Partner/ecosystem docs (Rapyd, Formance) for distribution
