# Claim Guardrails — What We Can and Cannot Say

> Owner: _TBD_ · Status: `LIVE` · Last reviewed: 2026-07-07

**This is the most important doc in the hub.** It exists to stop us saying things that aren't
true. Everything else is strategy; this is discipline.

---

## The governing rule

> **Every external claim must map to a capability that exists in the product today. If it isn't
> shipped and verified, we don't say it. When in doubt, don't claim.**

We will sell whatever people are willing to buy — the segment focus is where we *aim*, not a
cage. But **the guardrails below are fixed regardless of who we're selling to.** A claim doesn't
become true because a prospect wants it to be.

Two failure modes to avoid, both fatal for a company that touches money:
1. **Capability claims** — saying we do something we don't (e.g. "real-time accounting records").
2. **Regulatory claims** — implying a licence, coverage, or safety we haven't confirmed.

---

## The claims table

Legend: ✅ can say · ⚠️ only with the stated condition · ❌ do not say.

| Claim | Verdict | Why / condition |
|---|---|---|
| "Real-time accounting records" / "syncs with your accounting" / "updates your QuickBooks/Xero" | ❌ | **No accounting-provider integration exists.** There is no QBO/Xero/NetSuite sync. Do not imply one. |
| "Your books" / "we're your accounting system" / "one source of truth for your accounting" | ❌ | Granville is not an accounting system. It records the payments *it* makes — not your general ledger. |
| "Every payment is recorded in an immutable ledger" | ⚠️ | A Formance ledger exists but must be **activated** (`FORMANCE_LEDGER_URL`), and it is Granville's *internal* record of Granville payments — not the customer's books. Verify it's live before claiming. |
| "Automated reconciliation of payments against the rail" | ⚠️ | Roadmap marks reconciliation complete — **verify it's running** in the deployed build before claiming, and scope it to rail↔ledger, not "reconciles your accounts." |
| "Full audit trail" | ⚠️ | Audit is **partial** (event capture done; state diffs / approval chain pending per roadmap). Say "audit-ready event history," not "complete audit trail," until verified. |
| "Your finance team cues up payments; the principal approves" (maker/checker) | ⚠️ | **Institutional maker/checker is parked** on the roadmap (enforcement + endpoints exist; roles + maker/checker not). **Verify the actual approval flow before pitching it as a feature.** This is core to our current story — confirm it works or soften it. |
| "We move money in production" / "live payments" | ❌ (today) | **No production rail is live.** Airwallex was dropped; Rapyd is in negotiation. Until a rail is live, this is roadmap. |
| "Powered by Rapyd" / "our Rapyd partnership" | ❌ | The Rapyd rev-share is **in negotiation, not signed.** Keep external messaging provider-agnostic. |
| "Multi-provider / automatic failover across rails" | ❌ | Parked; single-rail. Provider *abstraction* exists in code — that's an architecture fact, not a live multi-provider feature. |
| "Compliant cross-border payments without your own licence" | ⚠️ | Depends entirely on the **regulated-services model**, which is unconfirmed. Do not state until counsel signs off. See [regulatory-context](../01-market/regulatory-context.md). |
| "We are an EMI / regulated / a bank" | ❌ / ⚠️ | Not a bank (never). "EMI-led" is *intent*; confirm the actual licensing/agent model with counsel before any regulated claim. |
| "FX / multi-currency balances / budgets in one platform" | ⚠️ | Portal surfaces these — **verify each is functional** in the build you're demoing before promising it. |
| Specific numbers (uptime, volume, savings, customer count) | ❌ | No metrics until we have real ones. Zero live customers today — don't imply otherwise. |

## How to phrase the honest version

| Instead of… | Say… |
|---|---|
| "Real-time accounting records" | "A record of every payment you make through Granville, reconciled against the rail." |
| "Syncs with your books" | "Export-ready records today; accounting-software integration is on our roadmap, not available yet." |
| "We move your money compliantly" | "We're building to provide compliant movement; here's exactly what's live today." |
| "Powered by Rapyd" | "Provider-agnostic; we're finalizing our primary payments partner." |
| "Complete audit trail" | "Every event is captured and timestamped." |

## When a prospect asks for something we don't have

We sell what people will buy — so when a prospect wants a capability we don't have (e.g. QBO
sync):
1. **Don't claim it exists.** Ever.
2. Say plainly what's live today and what isn't.
3. If there's real demand, log it as a **build signal** (not a promise) and note who asked.
4. Only commit to a timeline engineering has actually agreed to.

A design partner who buys the real thing is worth ten who bought a story we couldn't deliver.

## Maintenance

- This doc is **`LIVE`** — it governs the website, decks, emails, and every call.
- When the product ships something (rail goes live, QBO integration lands, maker/checker
  confirmed), **update the verdict here first**, then let positioning and the website follow.
- The banned-phrase list in
  [positioning-and-messaging.md](../03-positioning/positioning-and-messaging.md) is a subset of
  this doc — this table is the authority.
