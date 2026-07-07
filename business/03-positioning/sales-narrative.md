# Sales Narrative

> Owner: _TBD_ · Status: `DRAFT` · Last reviewed: 2026-07-07

The story arc used in a pitch, a deck, or a first call. Positioning is the *words*; this is the
*journey* you walk a buyer through. Structured on the classic change → stakes → promised-land →
proof spine.

> Do not use the banned phrases (see [positioning](positioning-and-messaging.md)). Granville is
> not the customer's accounting system.

---

## 1. The change in the world (why now)

Teams went global. A Toronto agency now has a designer in Manila, a developer in Lagos, and a
writer in Buenos Aires. But paying them is stuck in the old world: a business bank, Wise or
PayPal or Deel, maybe a spreadsheet to track who got what — and the founder personally pushing
payments every month. As the team grows, the monthly payment run gets slower, riskier, and
more personal.

## 2. The stakes (what it costs to stay put)

Every business paying a distributed team the old way pays a tax it rarely measures:
- **Founder time** — the person who should be running the business is personally sending payments.
- **No delegation without risk** — hand the bank login to an ops person and you've lost control;
  keep it yourself and you're the bottleneck.
- **FX + fees leaking** across a patchwork of tools nobody fully tracks.
- **No clean record** — when you need to see exactly what you paid whom, it's scattered across
  four tools and a spreadsheet.

The bigger the team, the worse each of these gets.

## 3. The promised land (what good looks like)

One platform for paying your global team. Your **finance person cues up the payment run** — who
gets paid, how much, in which currency. **You review and approve it in one place, and it goes
out** — compliantly, across currencies, without you touching a bank portal. Every payment is
recorded, reconciled, and on the record, so you can always see exactly what moved. Balances,
FX, and budgets sit right there too.

**Your finance team lines it up. You approve. Granville sends the money.**

## 4. Why Granville can deliver it (proof, not adjectives)

- **Cue-up + approve is built in** — finance prepares, the principal releases. Delegation with
  control. `[verify approval-workflow status in ../../roadmap/]`
- **Regulated services are provided by the platform** — compliant movement, provider-abstracted
  rails (primary channel Rapyd, partnership in negotiation). The business doesn't need licences.
- **Every payment is recorded and reconciled** against the rail, with an audit trail — a record
  you can trust (not an accounting integration; a reliable record of what Granville sent).
- **Built by a payments/fintech lawyer** — the regulated part is understood, not hand-waved.

(Verify each against [product-primer.md](../00-overview/product-primer.md) and `../../roadmap/`.)

## 5. The ask (what happens next)

Stage-appropriate — we are early, so the ask is a **design-partnership**, not a mass rollout:
- "Let's take your next monthly contractor run, have your ops person cue it up in Granville, and
  you approve and send it — once, together."
- Land the first real payment run, prove the workflow, expand usage.

---

## Objection handling (DRAFT)

| Objection | Response |
|---|---|
| "Why trust a young platform with our money?" | Staged rollout, references, clear regulatory posture and boundaries; every payment is recorded and reconciled, and you approve each run. |
| "We already use Wise / Deel / PayPal for this." | Those send the money. They don't give you the *cue-up-and-approve workflow*, the FX + balances in one place, or one clean record of every payment. And you're still the one pushing each payment. |
| "We already have QuickBooks/Xero." | Different job. Granville pays your team and keeps a record of those payments; it is **not** your accounting system and doesn't replace it. (Accounting-provider integration is future roadmap, not today — don't promise it.) |
| "Can't my finance person just use our bank?" | Then they either have your bank login (no control) or you're the bottleneck. Granville separates *preparing* a payment from *approving* it. |
| "What can you actually do today?" | Be precise: cross-border payouts + FX + record of every payment; primary rail (Rapyd) is a pending partnership. Mark roadmap `[ASPIRATIONAL]`; never overstate regulated scope. |

## Demo spine (what to show, in order)

1. **Finance view:** an ops user cues up a payment run — several contractors, several currencies.
2. **Approval:** the principal reviews the queued run and approves/releases it in one place.
3. **Movement:** the payments go out across currencies (compliant, provider-abstracted).
4. **The record:** every payment appears recorded and reconciled against the rail — you can see
   exactly what moved.
5. **The finance surface:** balances, FX, budgets in the same platform.

The **cue-up → approve → sent** moment is the whole pitch. Land it. (Do **not** claim the ledger
is the customer's books.)
