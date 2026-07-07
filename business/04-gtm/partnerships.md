# Partnerships & Ecosystem

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

Who Granville works *with* — for the regulated rails it provides, for distribution, and for
credibility. Distinct from competitors (see [competitive-analysis.md](../01-market/competitive-analysis.md));
some players are both.

---

## Partnership types

| Type | Purpose | Examples |
|---|---|---|
| **Rail / provider partners** | The regulated money movement Granville provides sits on their rails | **Rapyd (primary channel, rev-share — in negotiation)**; future providers. _(Airwallex dropped — cost to onboard too high.)_ |
| **Regulated-service enablers** | Licensing/partner-bank/EMI relationships that let Granville provide services | _TBD with counsel_ |
| **Infrastructure partners** | Core tech Granville builds on | Formance (ledger) |
| **Distribution partners** | Reach operating businesses at scale | Accountants/bookkeepers, industry associations, ecosystem partner programs |
| **Credibility partners** | Trust signals for a young platform | Advisors, design-partner logos, ecosystem listings |

## Strategic dependencies to manage

- **Rapyd — intended PRIMARY payments channel (revenue-share partnership IN NEGOTIATION).**
  This is the current top commercial dependency. A rev-share deal with Rapyd would make it the
  primary rail Granville routes through and would materially shape unit economics
  ([pricing](../05-pricing/pricing-and-packaging.md)) and go-to-market. **Status: exploratory /
  under negotiation — not signed.** Until it closes, treat Rapyd-as-primary as the *plan*, not a
  fact, and keep customer-facing marketing provider-agnostic. Owner: founder. See the
  [dependency note in the BD plan](../06-plan/business-development-plan.md#dependencies--risks-bd-owned-watchlist).
- **Airwallex — DROPPED as a rail (cost to get started is prohibitive).** The *codebase* still
  contains an Airwallex integration (roadmap AW1–AW3), but the business has decided **not** to
  launch on it. Consequence to track: the go-live path re-anchors entirely onto **Rapyd**, and
  the AW1–AW3 roadmap milestones are effectively deprecated from a go-to-market standpoint.
  This is a live product-vs-business divergence — engineering should be told the primary rail
  is now Rapyd, not Airwallex.
- **Formance** — ledger foundation. Note the repo `CODEOWNERS` (`@formancehq/backend`) reflects
  a real technical dependency. Manage concentration risk; explore partner-program upside.
- **Regulated-service model** — the partner(s) that let Granville lawfully provide services are
  the most load-bearing relationships in the company. Owned by the founder + counsel. See
  [regulatory-context.md](../01-market/regulatory-context.md).

## Accountants / bookkeepers — a special case

They are simultaneously a **distribution channel** (they see the reconciliation pain across many
clients) and a potential **blocker** (they may fear displacement). Strategy:

- Position Granville as making their job easier (immutable, audit-ready ledger), not replacing
  them.
- Build a referral motion once the product and a case study exist.
- Decide the integrate-vs-replace stance on accounting systems first
  (see [competitive-analysis.md](../01-market/competitive-analysis.md)) — it shapes this relationship.

## Partnership principles

1. **Don't create new single points of failure.** Especially on rails and regulated services —
   provider abstraction exists partly to reduce this; use it.
2. **Partner for reach and trust, not to outsource the core.** The merged-truth product and the
   regulated posture are ours.
3. **Every partnership needs an owner and a next step.** Track using
   [../_templates/partnership-brief-template.md](../_templates/partnership-brief-template.md).

## Active / target partnerships (tracker)

| Partner | Type | Status | Owner | Next step |
|---|---|---|---|---|
| **Rapyd** | Rail / provider + **rev-share (primary channel)** | **In negotiation** | Founder | Progress rev-share terms; define integration + go-live path |
| Airwallex | Rail / provider | **Dropped** — cost to onboard too high | Founder | Tell engineering; retire AW1–AW3 from the GTM path |
| Formance | Infrastructure | In use | _TBD_ | Assess partner program / concentration risk |
| _regulated-service partner_ | Enabler | _TBD_ | Founder | Confirm model with counsel |
| _accountant network_ | Distribution | Not started | _TBD_ | Design referral motion post-case-study |

## Open questions

- [ ] **Rapyd rev-share:** what terms, what integration lift, and what's the go-live path if it
      becomes primary? Does it cover the beachhead (Canada → foreign-contractor payouts)?
- [ ] If Rapyd stalls, what's the fallback rail? (Airwallex is out on cost — need a
      low-cost-to-onboard alternative identified before it becomes a go-live blocker.)
- [ ] What is the minimum partner set required to provide regulated services in the beachhead geography?
- [ ] Do accountants become our primary channel once we have proof?
