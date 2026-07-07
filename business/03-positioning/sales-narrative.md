# Sales Narrative

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

The story arc used in a pitch, a deck, or a first call. Positioning is the *words*; this is the
*journey* you walk a buyer through. Structured on the classic change → stakes → promised-land →
proof spine.

---

## 1. The change in the world (why now)

Businesses now move money everywhere — multiple currencies, corridors, providers. But the
tools didn't keep up: money lives in a bank and an FX app, the books live in an accounting
package, and a human spends days making them agree. As money movement grows, that gap grows
with it.

## 2. The stakes (what it costs to stay put)

Every business running the stitched stack pays a tax it rarely measures:
- **Time** — manual reconciliation and a slow, painful month-end close.
- **Risk** — books that don't tie out; audit findings; investor questions you can't answer fast.
- **Ceiling** — you can't move money you're not licensed for, so growth stalls or you get
  dragged into a fintech/compliance project you never wanted to run.

The longer you wait, the more money you move through a system that can't prove itself.

## 3. The promised land (what good looks like)

One platform. A payment goes out and, in the same instant, it's booked in an immutable ledger.
Balances, FX, budgets, payouts — all in one place. Close is not an event; the books are always
current and always tie out. And the regulated part — the licences, the rails, the audit-grade
records — is handled by the platform, not by you.

**You run your business. Granville runs the money and the books.**

## 4. Why Granville can deliver it (proof, not adjectives)

- The payment *is* the ledger entry — immutable double-entry, balances derived from journal
  entries only. (Not a CSV export bolted onto a bank.)
- Regulated services provided by the platform — EMI-led, provider-abstracted (stay
  provider-agnostic externally; intended primary channel Rapyd is a pending partnership).
- Reconciliation and audit trail are native primitives, already running in the product.
- Built by a payments/fintech lawyer — the regulated part is understood, not hand-waved.

(Verify each against [product-primer.md](../00-overview/product-primer.md) and `../../roadmap/`.)

## 5. The ask (what happens next)

Stage-appropriate — we are early, so the ask is a **design-partnership**, not a mass rollout:
- "Let's take one real money flow you run today and put it on Granville, and watch it post to
  the ledger live."
- Land small, prove the merged truth, expand usage.

---

## Objection handling (DRAFT)

| Objection | Response |
|---|---|
| "Why trust a young platform with our money?" | Staged rollout, references, clear regulatory posture and boundaries; the ledger is immutable and auditable from day one. |
| "We already have QuickBooks/Xero." | Their ledger is only as true as the last manual reconciliation. Ours is fed by real settled movement — complement or replace, your call. |
| "Isn't this just Wise/Airwallex?" | Those are rails; we sit *on top of* them and book every movement into your accounts automatically. We're the system, not the pipe. |
| "Are you a bank?" | No — and you don't need to be regulated to use us. We provide the regulated services; you consume them. |
| "What can you actually do today?" | Be precise: first rail live, ledger + reconciliation running. Mark roadmap items `[ASPIRATIONAL]`. Never oversell regulated scope. |

## Demo spine (what to show, in order)

1. Initiate a real payment in the portal.
2. Show it settle on the rail.
3. Show the **same event** appear as an immutable ledger posting — books already tie out.
4. Show reconciliation/audit trail confirming it.
5. Show balances/FX/budgets in the same place.

The "same event becomes the ledger entry" moment is the whole pitch. Land it.
