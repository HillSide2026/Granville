# Positioning & Messaging

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

The words. How Granville describes itself so an operating business instantly understands what
it is and why it's different. Keep this tight — every other asset (website, deck, emails)
inherits from here.

> **Governed by [claims-guardrails.md](../00-overview/claims-guardrails.md) — read it first.**
> Banned phrases (untrue and/or clumsy): "merged books", "merged accounting", "your money and
> your books as one system", "one truth for money and books", "the payment is the ledger entry",
> "real-time accounting records", "replaces your accounting". Granville is **not** the customer's
> accounting system and does **not** integrate with QuickBooks/Xero. This list is a subset of the
> guardrails table — that table is the authority.

---

## Positioning statement (internal north star)

> For **operating businesses that pay a team spread across countries and currencies**,
> **Granville** is the platform where your **finance team cues up the payments and transfers you
> need to make, and you approve and send them** — with the regulated rails, FX, and an
> auditable record of every payment handled for you.
>
> Unlike a bank + Wise + Deel + a spreadsheet, the whole pay-your-team workflow —
> **prepare → approve → pay → record** — lives in one place.

## The core message (say this first, every time)

**"Your finance team lines up the payments. You approve. Granville sends the money — across
currencies, compliantly."**

The product is a **two-actor workflow**:

1. **The principal / owner** pays the global team.
2. **The finance team** (in-house or offshore) **cues up** the payments and transfers the
   principal needs to make — so the principal just reviews and releases them.

That prepare-and-approve flow is the heart of the pitch. It's how a busy founder pays 20
contractors in 8 currencies without doing it personally, and without losing control.

## Value pillars (the three things we always come back to)

1. **Pay your global team, compliantly.** Cross-border, multi-currency payouts and transfers.
   Granville *provides* the regulated services and the rails → no licences, no integrations, no
   fintech build.
2. **Cue up, then approve — built in.** Your finance team prepares the payment run; the person
   with authority reviews and releases it. Delegation *and* control, in one workflow.
   ⚠️ **`[VERIFY BEFORE CLAIMING]`** — institutional maker/checker is parked on the roadmap
   (enforcement + endpoints exist; roles + maker/checker not confirmed). Confirm the actual
   approval flow works before pitching it. See [claims-guardrails](../00-overview/claims-guardrails.md).
3. **Every payment on the record.** Each payment is automatically recorded, reconciled against
   the rail (so you know it actually landed), and audit-ready. You can see and trust exactly
   what moved. → *Not* your accounting system — a reliable record of what Granville sent.

Plus the finance surface around it: **FX, balances, wallets, budgets** in one platform.

Each pillar must trace to a real product capability in
[product-primer.md](../00-overview/product-primer.md). Mark anything not-yet-shipped `[ASPIRATIONAL]`.

## Messaging by pillar → proof

| Pillar | Claim | Proof point (verify in `../../roadmap/`) |
|---|---|---|
| Pay your global team | Compliant cross-border payouts, many currencies | Regulated services provided; provider-abstracted rails (primary channel Rapyd, `[in negotiation]`) |
| Cue up + approve | Finance prepares, principal approves & sends | Approval workflows; submit→approve separation (ops-ui approvals) `[verify status]` |
| On the record | See and trust every payment | Immutable ledger of payments; automated reconciliation + aging; audit trail |
| Finance surface | FX, balances, budgets in one place | Portal: Payments, Wallets, Balances, FX, Budgets |

## Words we use / words we avoid

**Use:** pay your global team, cue up / line up / queue payments, approve and send, transfers,
across currencies, compliant, on the record, auditable, one place.

**Avoid:** the banned phrases at the top of this doc; "bank" (we're not one); "orchestration
layer / control plane / infrastructure" (engineer-speak — not how a founder buys); anything
implying we sync with or replace their accounting software; overclaiming regulated coverage
(see [regulatory-context.md](../01-market/regulatory-context.md)).

## Elevator pitches (length variants)

- **5 words:** "Pay your global team, together."
- **1 sentence:** "Granville lets your finance team line up the cross-border payments you need
  to make, so you just approve and send — with the rails, FX, and records handled."
- **Tweet:** "Paying a team across countries is chaos — a bank, Wise, Deel, and a spreadsheet.
  Granville puts it in one place: your finance team cues up the payments, you approve, and every
  one goes out compliantly and stays on the record."

### Wedge message (agencies paying foreign contractors)

> **"Your ops person lines up the monthly contractor run. You approve it in one click. Everyone
> gets paid in their own currency — and every payment is on the record."**

Enter through the monthly payout chaos; the win is the cue-up/approve workflow + compliant
movement + a record you can trust. Say "pay your contractors / your global team," **never** "run
payroll" (scope line — [regulatory-context](../01-market/regulatory-context.md)).

## Consistency check

The public site lives in `../../apps/website/`. When positioning here changes, the website copy
must follow — but **edit the website in the codebase, not here.** This doc is the source; the
site is a downstream surface. Keep the boundary.
