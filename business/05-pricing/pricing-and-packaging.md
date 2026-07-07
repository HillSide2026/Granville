# Pricing & Packaging

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

How Granville charges. All numbers below are **hypotheses to test**, not committed prices.
Pricing a platform that provides regulated services and holds/moves money has real
constraints — validate with counsel and with real willingness-to-pay conversations.

---

## Business model

Granville replaces a **stack** (business bank/payments + FX + accounting + reconciliation
labour). The pricing frame is therefore **consolidation value**: cost less than the sum of the
tools + the people-hours it removes, while capturing a fair share of that saving.

Likely a hybrid of:

| Component | Rationale |
|---|---|
| **Platform subscription** | Predictable base for access to the merged money+books system |
| **Usage on money moved** | Scales with value delivered (per-payment, volume tiers, or bps) |
| **FX spread / margin** | Standard for multi-currency movement (where model permits) |
| **Onboarding / implementation** | For larger customers migrating real flows |

## Value metric — the key decision

What does the price scale on? Options, with trade-offs:

| Value metric | Pros | Cons |
|---|---|---|
| **Money moved (volume / bps)** | Aligns price to value; familiar in payments | Can get expensive fast; may cap adoption |
| **Per payment / transaction** | Simple, predictable | Weak link to value if payment sizes vary widely |
| **Seats / platform tier** | Predictable revenue; SaaS-like | Under-captures high-volume value |
| **Hybrid (base + usage)** | Balances predictability and alignment | More complex to explain |

> Recommendation to test: **base subscription + usage on money moved**, with FX margin where
> permitted. Keep the first design-partner deals simple and generous.

## Packaging hypothesis (tiers to test)

| Tier | For | Includes | Price (PLACEHOLDER) |
|---|---|---|---|
| **Design Partner** | First few customers | Founder support, one live flow, reference rights, favourable terms | Discounted / co-build |
| **Core** | Small operating businesses | Merged money+books, one rail, portal, reconciliation | $ base + usage — TBD |
| **Growth** | Higher volume / multi-currency | + FX, more volume, priority support | $$ base + usage — TBD |
| **Scale** | Larger / complex | + advanced controls, onboarding, SLAs | Custom — TBD |

## Design-partner pricing (current stage — the one that matters now)

For the first 3–5 customers, price is a means to **proof and references**, not revenue:
- Favourable/discounted terms.
- In exchange: real usage, deep feedback, and reference rights (named logo or case study).
- Keep it simple — a flat pilot fee or waived-base + usage is easier than a bespoke model.
- Put terms in a short design-partner agreement (keep signed docs out of git — see hub README).

## Pricing guardrails / open questions

- [ ] **Regulatory constraints** on how Granville can charge for regulated services / hold funds
      / take FX margin — confirm with counsel before publishing any price.
- [ ] **Cost-to-serve** — rail costs (primary channel Rapyd, pending rev-share terms),
      Formance, compliance, support — must sit below price. **The Rapyd revenue-share deal is a
      primary input to unit economics** — model it as soon as terms firm up
      ([partnerships](../04-gtm/partnerships.md#strategic-dependencies-to-manage)).
- [ ] **Anchoring** — do we price against the tools we replace (bank+FX+accounting) or against
      the labour we remove? (Second anchor is usually bigger.)
- [ ] **Do we publish prices** or stay "contact us" while founder-led? (Likely the latter early.)

## What NOT to do

- Don't publish prices before the regulatory model and unit economics are confirmed.
- Don't over-discount forever — design-partner pricing needs an explicit end date.
- Don't compete on being cheapest; compete on removing the whole stack and the labour.

## Inputs needed to finalize

- [ ] Rail + infra + compliance cost-to-serve model → unit economics
- [ ] 3–5 willingness-to-pay conversations with real ICP buyers
- [ ] Counsel sign-off on permissible charging models
- [ ] Competitor price points for the tools we replace (for anchoring)
