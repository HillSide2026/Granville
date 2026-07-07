# Regulatory Context

> Owner: _TBD_ (founder-led — this is core domain) · Status: `DRAFT` · Last reviewed: 2026-07-07

Granville's defining choice is that **the platform provides the regulated services** so the
customer doesn't have to. That is the moat and the obligation. This doc frames the regulatory
posture for business development — it is **not legal advice** and must be confirmed with
current counsel/regulators before any external commitment.

> The founder is a Toronto payments/fintech lawyer. Regulatory fluency is why Granville can
> credibly *provide* regulated services and explain them plainly to non-expert businesses —
> a durable advantage most competitors can't replicate.

---

## The core posture

- **Granville carries the regulated surface; the customer does not.** The operating business
  consumes compliant money movement, balances, FX, and payouts as a product.
- **EMI-led for Stage 1, bank-ready for Stage 2** (per `../../README.md`). The licensing/
  partnership path that lets Granville provide these services is the foundation of the whole
  business — get it wrong and there is no product.
- **Ledger-as-truth supports the regulated posture:** immutable double-entry records,
  reconciliation, and audit trail are exactly what safeguarding, record-keeping, and audit
  expectations demand.

## Key questions this doc must resolve (with counsel)

- [ ] **How does Granville provide regulated services?** Own licence(s), agent/partner of a
      licensed EMI/bank, or a hybrid — by jurisdiction. This determines liability, timeline,
      and cost, and it gates go-live.
- [ ] **Whose money, where, held how?** Safeguarding/segregation model for customer funds and
      the flow-of-funds Granville sits in.
- [ ] **What can we say we do today** vs. what is roadmap? Regulated claims must be precise;
      mark anything not yet permissioned `[ASPIRATIONAL]`.
- [ ] **KYC/KYB and onboarding obligations** Granville owes on the businesses it serves.
- [ ] **Jurisdictional scope** — where can Granville lawfully provide services now, and what's
      the expansion order? Ties to the [geographic beachhead decision](market-landscape.md).

## Jurisdiction notes (fill in with counsel)

| Jurisdiction | Relevant regime(s) | Granville's path to provide services | Status |
|---|---|---|---|
| Canada | FINTRAC MSB, provincial rules | _TBD_ | _TBD_ |
| UK | FCA EMI / safeguarding | _TBD_ | _TBD_ |
| EU | EMI / PSD2 | _TBD_ | _TBD_ |
| US | State MTLs / partner-bank model | _TBD_ | _TBD_ |

> Do not treat the rows above as settled. They are prompts for a proper regulatory workplan.

## How regulation shows up in the product (proof, not marketing)

Pulled from `../../roadmap/` — verify before quoting:

- Immutable double-entry ledger; balances derived from journal entries only.
- Automated reconciliation + aging.
- Immutable audit/event capture; documented backup/recovery; no hardcoded secrets.
- Access control + approval workflows (institutional roles / maker-checker on roadmap).

These let Granville stand behind the regulated services it provides — and reassure customers
that "the platform handles compliance" is real, not a slogan.

## BD guardrails

- **Never let sales imply the customer is unregulated-and-safe without confirming the actual
  model.** Overstating regulatory coverage is the one mistake that can end the company.
- **The compliance burden being absorbed by Granville is a headline benefit** — quantify it
  (licences not needed, integrations not built, audits not staffed) in customer materials.
- **Keep this doc and counsel aligned.** When the licensing model changes, update here first,
  then positioning and pricing.
