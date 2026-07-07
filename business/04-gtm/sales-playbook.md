# Sales Playbook

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

The repeatable "how we run a deal" — from first touch to live customer. Built for the current
founder-led, design-partner stage. Tighten it as real deals teach us what works.

---

## Deal stages (mirror the GTM funnel)

See [gtm-strategy.md](gtm-strategy.md) for definitions. Track live deals in
[../06-plan/pipeline.md](../06-plan/pipeline.md).

`Fit → Conversation → Design partner → Live → Reference → Expansion`

## Qualification: is this a real deal?

Use the ICP qualifiers ([icp-and-segments.md](../02-customers/icp-and-segments.md)). Fast
disqualify if:
- No meaningful money movement (no pain).
- Wants a toolkit to build their own fintech (→ not our buyer).
- Needs a decade-old incumbent to sign off (too early for them).
- Use would push Granville into regulatory scope it hasn't cleared.

**Lightweight qualification frame (BANT-ish, adapted):**
- **Pain** — is reconciliation/close/compliant-movement a real, present fire?
- **Authority** — is the finance owner + economic buyer in the room?
- **Trust** — will they run real money through a young platform with references + staging?
- **Timing** — is there a trigger event (bad close, new corridor, audit)?

## Discovery questions (the good ones)

- "Who actually sends your contractor/team payments each month, and how?"
- "Could you hand that off to your ops person *without* giving them the bank login?"
- "How many tools does a single payment run touch before everyone's paid?"
- "Is there money you *want* to move but can't do compliantly today?"
- "When someone asks you exactly what you paid whom last month, how easily can you show it?"

**Wedge-specific (agencies paying foreign contractors):**
- "How many foreign contractors do you pay, in how many currencies, and how often?"
- "What do you use to pay them today — Wise, PayPal, Deel, a bank?"
- "Who lines up the run, and who approves it? How much of that is still you plus a spreadsheet?"

Listen for the exact words they use for the pain — feed them back into
[messaging](../03-positioning/positioning-and-messaging.md).

## The pitch (follow the narrative)

Run the [sales-narrative.md](../03-positioning/sales-narrative.md) arc: change → stakes →
promised land → proof → ask. Then the **demo spine** — land the **cue-up → approve → sent**
moment. (Do not claim the record is the customer's books.)

## Handling the big objections

Full table in [sales-narrative.md](../03-positioning/sales-narrative.md#objection-handling-draft).
The ones that decide deals:
1. **Trust with our money** → staged rollout + references + regulatory clarity; you approve every run.
2. **We already use Wise/Deel/PayPal** → they send money; they don't give you the cue-up/approve
   workflow, one place for FX + balances, or one clean record — and you're still pushing each payment.
3. **We already have QuickBooks/Xero** → different job; Granville is not your accounting system
   and doesn't replace it. Never promise a sync (not built, not GTM).
4. **What can you do *today*** → be precise and honest; mark roadmap `[ASPIRATIONAL]`; never
   overstate regulated scope.

## The design-partner offer (current stage)

We are not selling a finished product to the mass market yet. The offer is:
- Put **one real money flow** on Granville.
- Founder-level attention and co-build.
- Favourable early terms in exchange for feedback + reference rights.
- Clear, staged rollout with the customer's money safety front and center.

Define the exact terms in [pricing-and-packaging.md](../05-pricing/pricing-and-packaging.md).

## What to do after "yes"

1. Scope the first real flow.
2. Confirm the regulatory model covers it (checkpoint with counsel).
3. Get it live (gated on the Rapyd rail going to production — Airwallex dropped on cost).
4. Prove it ties out; capture the moment as a reference/case study.
5. Expand volume/flows.

## Sales hygiene

- Every active deal has a stage, an owner, and a dated next step in
  [pipeline.md](../06-plan/pipeline.md).
- Use pseudonyms in git; keep PII and signed docs out of the repo (see hub README).
- Update the playbook when a real deal contradicts it. This is a living document.

## Assets checklist (build as needed)

- [ ] One-pager / short deck (source of truth: [positioning](../03-positioning/positioning-and-messaging.md))
- [ ] Demo environment + script (the "same event" moment)
- [ ] Design-partner agreement (terms from pricing)
- [ ] First case study (unlocks the scaled motion)
