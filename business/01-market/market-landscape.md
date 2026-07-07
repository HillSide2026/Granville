# Market Landscape

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

Where Granville plays, how big the space is, and which way the wind is blowing. Treat sizing
figures as **placeholders to be validated** — replace with sourced numbers before any external use.

---

## The category

Granville sells to **operating businesses** and gives them one platform to **pay a global team
across countries and currencies** — where a finance person **cues up** the payments and
transfers and the principal **approves and sends** them. Granville provides the regulated
financial services underneath, so the customer moves money compliantly without holding licences
or integrating rails.

That places Granville at the intersection of categories usually bought separately:

| Category the buyer knows | Example players | What Granville does differently |
|---|---|---|
| Contractor payout / global payroll | Deel, Remote, Wise, PayPal, Payoneer | They send money; we add the cue-up→approve workflow, FX+balances in one place, and a record of every payment |
| Business banking / spend | Mercury, Brex, Ramp, Revolut Business | Not built to prepare + approve cross-border contractor runs; we are |
| Cross-border payments / FX | Wise Business, Airwallex, Currencycloud, Payoneer | We abstract the rail and wrap it in the workflow + records; the rail isn't the product |
| Accounting / bookkeeping | QuickBooks, Xero, NetSuite | **Different job — we don't compete.** We pay the team and record payments; they keep the books. We don't sync to them (yet) |
| Embedded finance / BaaS | Unit, Solaris, Griffin, Column | We deliver a finished outcome to the business, not toolkits to a fintech builder |

**The wedge:** paying a global team is split across a bank, a payout tool, an FX provider, and a
spreadsheet — and the founder personally pushes each payment. Granville collapses that into one
cue-up→approve→pay→record workflow.

## Why now (tailwinds)

- **Distributed teams are normal.** Even small businesses now pay contractors across several
  countries and currencies every month — a recurring, growing operational pain.
- **The founder-bottleneck is real.** Paying the team can't be safely delegated on a bank login;
  businesses want to hand off *preparing* payments while keeping *approval* control.
- **Regulated finance is now deliverable** — ledger + rails infrastructure (Formance, provider
  abstraction) makes it possible to provide compliant movement as a product.
- **Businesses want outcomes, not fintech projects.** They will pay to *not* obtain licences,
  integrate rails, or staff a payments/compliance team.

## Headwinds / risks

- **Category confusion** — "is it a bank? a payroll tool? an accounting tool?" Lead with the
  pay-your-team workflow, not the plumbing, and be explicit about what we're *not* (a bank, an
  accounting system, employment payroll). See [positioning](../03-positioning/positioning-and-messaging.md).
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
cross-border payout pain and the closest fit to the product today. Land the wedge, then expand across
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
- [ ] 3–5 operating-business interviews to validate the cross-border payout pain and willingness to pay
- [ ] Partner/ecosystem docs (Rapyd, Formance) for distribution
