# Pricing & Packaging

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

How Granville makes money. Governed by [claims-guardrails.md](../00-overview/claims-guardrails.md):
don't publish prices, rev-share numbers, or "free forever" promises until the economics are
confirmed. **The whole model below hinges on the unsigned Rapyd revenue-share deal.**

---

## The model

**Free base → revenue-share engine → future premium tier(s).**

1. **The software is free.** The core product — pay your global team, cue up + approve, FX,
   balances, payment records — is given away. No subscription to onboard. Free removes the
   friction that would otherwise slow adoption of a young platform that touches money.
2. **We make money on revenue sharing.** Granville earns a share of the economics on money
   moved through the platform (payment / FX revenue), via the **Rapyd revenue-share
   partnership**. Revenue scales with **volume moved**, not with software seats. This is what
   recovers cost and — hopefully — turns a profit.
3. **Premium paid tier(s) come later.** Advanced capability sold on top of the free base, once
   there's a live product and real demand. **Future, not now** — do not present paid tiers as
   available today.

## The engine: revenue sharing

- **Where it comes from:** a share of the payment/FX margin generated when a customer moves
  money on Granville's rail. The customer isn't billed a Granville fee; Granville participates
  in the transaction economics.
- **What it depends on:** the **Rapyd rev-share terms — currently in negotiation, unsigned.**
  Until those terms exist, we cannot model unit economics, cannot know break-even, and cannot
  state margins. This makes the Rapyd deal the **single most load-bearing item in the whole
  business model** — see [partnerships](../04-gtm/partnerships.md#strategic-dependencies-to-manage).
- **What has to be true to profit:** (rev-share earned per unit of volume) × (volume across
  customers) must exceed cost-to-serve (rail + infra + compliance + support). Free acquisition
  only works if volume-based rev-share clears that bar.

## The free base

- **What's free:** the core pay-your-team product. Be precise with customers about what is
  actually live today vs. roadmap ([claims-guardrails](../00-overview/claims-guardrails.md)).
- **Why free:** kills onboarding friction, accelerates the volume that the rev-share monetizes,
  and lowers the trust barrier for a new platform.
- **The tension to watch:** "free" plus real cost-to-serve means **every free customer costs
  money until their volume produces enough rev-share to cover them.** Free is an acquisition
  bet on volume — not a give-away with no downside.

## Future premium tier(s) — placeholder, do not build out yet

Reserved for advanced capability layered on the free base (candidates only, unvalidated:
advanced controls/approvals, deeper reporting, higher limits, priority support, SLAs). **Not a
current offer.** Do not detail, price, or promise premium tiers until there's a live product and
evidence of demand — that would be fantasizing about the future.

## Current stage — design partners

The base is free anyway, so early deals aren't about price. They're about:
- Getting real **volume** onto the platform (to prove the rev-share engine works).
- Proof, feedback, and reference rights.
- **Validating the rev-share economics** against real transactions once a rail is live.

Keep any early terms in a short design-partner agreement (signed docs out of git — see hub README).

## Open questions / inputs needed

- [ ] **Rapyd rev-share terms** — the number that decides whether this model works at all. Blocks
      everything below.
- [ ] **Cost-to-serve model** (rail + infra + compliance + support) → break-even volume per customer.
- [ ] **Regulatory constraints** on participating in payment/FX economics — confirm with counsel
      before relying on any rev-share mechanic ([regulatory-context](../01-market/regulatory-context.md)).
- [ ] **When** does a premium tier make sense, and what would actually be worth paying for?
- [ ] Is "free base" genuinely free forever, or free-up-to-a-limit? (Decide once economics are known.)

## What NOT to do / say

- Don't quote rev-share percentages, prices, or "free forever" before the economics are confirmed.
- Don't present premium tiers as available — they don't exist.
- Don't assume free = costless; model the volume needed to cover cost-to-serve.
- Don't build the software's value story on a subscription — there isn't one.
