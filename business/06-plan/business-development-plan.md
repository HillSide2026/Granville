# Business Development Plan

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

The actual plan: what BD does, in what order, gated by where the product is. Every phase here
maps to a product gate in [`../../roadmap/`](../../roadmap/) — BD and product move together.

---

## The through-line

**Get one operating business moving real money on Granville, with the books tying out, then
make that repeatable.** Everything is sequenced toward, and then out from, first go-live.

## Phase gating (BD phase ↔ product gate)

| BD Phase | Business goal | Product gate (roadmap) | Status |
|---|---|---|---|
| **0. Foundation** | Strategy, ICP, positioning, regulatory model defined | — (this hub) | In progress |
| **1. Line up design partners** | 3–5 fit conversations; 1–2 committed pilots scoped | Granville MVP maturing | Not started |
| **2. First go-live** | One customer moving real money; ledger ties out | **Rapyd rail live** (Airwallex dropped) | Blocked on Rapyd partnership + integration |
| **3. Prove & package** | Case study, references, repeatable demo + terms | Granville MVP complete | Not started |
| **4. Repeatable motion** | Small pipeline in one segment; early revenue | Version 1 hardening | Not started |
| **5. Expand** | Second segment / geography / provider | Multi-provider (post-MVP) | Not started |

> BD's current job (Phase 0→1): **have design partners lined up so the day the Rapyd rail goes
> live, a real customer flow switches on.** Don't wait for go-live to start conversations.

## Phase 0 — Foundation (now)

**Goal:** a coherent, decided strategy so every conversation is consistent.

- [x] **Beachhead + geography chosen** — Canada-based **agencies paying foreign "payroll"**
      (wedge); publicly four segments (agencies/influencers/marketplaces/ecommerce).
      ([ICP](../02-customers/icp-and-segments.md), [market-landscape](../01-market/market-landscape.md).)
- [ ] Resolve the **positioning fork** ([positioning](../03-positioning/positioning-and-messaging.md))
      — for the wedge, lead with the cross-border-payout pain.
- [ ] Confirm the **contractor-payouts vs. employment-payroll scope line** with counsel.
- [ ] Confirm the **regulatory model** for providing services in the beachhead
      ([regulatory-context](../01-market/regulatory-context.md)) — **hard gate** on any promise.
- [ ] Validate pain + willingness to pay in **5 buyer interviews**.
- [ ] Draft the **design-partner offer + terms** ([pricing](../05-pricing/pricing-and-packaging.md)).

## Phase 1 — Line up design partners

**Goal:** a shortlist of committed pilots ready for go-live.

- [ ] Build a target list (founder network + ecosystem) in the chosen segment.
- [ ] Run founder-led discovery ([sales-playbook](../04-gtm/sales-playbook.md)).
- [ ] Scope one real money flow per committed partner.
- [ ] Track everything in [pipeline.md](pipeline.md).
- **Exit:** 1–2 partners with a scoped flow, waiting on go-live.

## Phase 2 — First go-live

**Goal:** the number that matters — real money, live, tying out.

- [ ] Close the Rapyd rev-share partnership and land the Rapyd integration to production (BD +
      founder own the deal; engineering owns the integration). Airwallex is not the path.
- [ ] Confirm regulatory model covers the live flow (counsel checkpoint).
- [ ] Switch on the first design-partner flow; watch it post to the ledger.
- **Exit:** one customer live; payment → ledger → reconciled, in production.

## Phase 3 — Prove & package

**Goal:** turn one proof into a repeatable story.

- [ ] Capture a case study + reference rights.
- [ ] Finalize packaging/pricing from real data.
- [ ] Tighten the demo + assets ([sales-playbook checklist](../04-gtm/sales-playbook.md#assets-checklist-build-as-needed)).
- **Exit:** a named reference + a repeatable pitch.

## Phase 4 — Repeatable motion

**Goal:** a small, real pipeline and early revenue in one segment.

- [ ] Turn on referral/content/ecosystem channels ([gtm](../04-gtm/gtm-strategy.md)).
- [ ] Convert pipeline at a measurable rate; track [OKRs](okrs-and-metrics.md).
- **Exit:** repeatable land motion; unit economics validated.

## Phase 5 — Expand

- [ ] Second segment/geography or second provider (gated on product multi-provider work).

## Dependencies & risks (BD-owned watchlist)

| Risk | Impact | Mitigation |
|---|---|---|
| **Rapyd rev-share partnership stalls or fails** | No payments channel at all → no go-live (Airwallex already dropped on cost, so there's no fallback rail today) | Founder-owned negotiation; **identify a low-cost-to-onboard backup rail** before this blocks go-live; don't market Rapyd-primary as fact until signed. See [partnerships](../04-gtm/partnerships.md#strategic-dependencies-to-manage) |
| Product-vs-business divergence on the rail | Codebase still builds Airwallex (AW1–AW3); business is on Rapyd | Tell engineering the primary rail is Rapyd; retire AW milestones from the GTM path; redirect integration effort |
| Go-live slips (whatever the rail) | No customer can go live | Line up partners now; keep pilots warm |
| Regulatory model unclear | Can't promise "we handle compliance" | Founder + counsel resolve in Phase 0 |
| No references / cold start | Slow trust, slow deals | Design-partner motion is designed to fix this |
| Formance dependency | Technical + narrative risk | Provider abstraction; monitor concentration |
| Founder bandwidth | Founder-led motion doesn't scale | Package + case study to enable delegation later |

## Cadence

- **Weekly:** update [pipeline.md](pipeline.md); review next steps on every active deal.
- **Monthly:** review [OKRs/metrics](okrs-and-metrics.md); re-check phase gate vs. roadmap.
- **Quarterly:** re-review this plan and the whole hub; archive stale docs.
