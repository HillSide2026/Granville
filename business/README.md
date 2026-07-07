# Granville — Business Development Knowledge Hub

This directory is the single source of truth for **how Granville goes to market**: strategy,
positioning, market analysis, go-to-market plans, pricing, and the active pipeline.

It is deliberately **segregated from the codebase**. Nothing here is code, and no code
depends on anything here. Engineers can ignore this folder entirely; business owners never
need to touch application source. The boundary is the point.

> **Product truth lives in `../roadmap/` and `../README.md`.** This hub *references* the
> product but does not restate it. When the product changes, update `../roadmap/`; then
> reflect the business consequence here. Keep the two in sync but never merge them.

---

## How to navigate

| Folder | What lives here | Start with |
|---|---|---|
| [00-overview/](00-overview/) | The strategy in one page; a BD-facing product primer | [strategy-on-a-page.md](00-overview/strategy-on-a-page.md) |
| [01-market/](01-market/) | Market landscape, competitors, regulatory context | [market-landscape.md](01-market/market-landscape.md) |
| [02-customers/](02-customers/) | Ideal customer profile, segments, personas | [icp-and-segments.md](02-customers/icp-and-segments.md) |
| [03-positioning/](03-positioning/) | Value proposition, messaging, the sales narrative | [positioning-and-messaging.md](03-positioning/positioning-and-messaging.md) |
| [04-gtm/](04-gtm/) | Go-to-market motion, partnerships, sales playbook | [gtm-strategy.md](04-gtm/gtm-strategy.md) |
| [05-pricing/](05-pricing/) | Business model, pricing, packaging | [pricing-and-packaging.md](05-pricing/pricing-and-packaging.md) |
| [06-plan/](06-plan/) | The BD plan, OKRs/metrics, live pipeline | [business-development-plan.md](06-plan/business-development-plan.md) |
| [_templates/](_templates/) | Reusable account plan / partnership brief templates | — |

---

## Operating rules

1. **One idea per file.** If a doc is doing two jobs, split it.
2. **Everything is a draft until dated and owned.** Each doc has a front-matter block with
   `Owner`, `Status`, and `Last reviewed`. Stale > 1 quarter → re-review or archive.
3. **Ground claims in the product.** If a positioning claim is not yet true in
   `../roadmap/`, mark it `[ASPIRATIONAL]` so sales never oversells.
4. **No customer PII or signed contracts in git.** Track deals by pseudonym in
   [06-plan/pipeline.md](06-plan/pipeline.md); keep executed legal docs out of the repo.
5. **This folder is business-owned.** See the segregation note below.

---

## Segregation & access

This hub is committed to the repo but is **not** engineering territory. Two follow-ups keep
the boundary clean:

- **CODEOWNERS:** the root `CODEOWNERS` currently assigns `* @formancehq/backend`, which would
  route business-doc reviews to the backend team. Add a business owner override, e.g.
  `/business/ @<your-github-handle>`, so BD changes are not auto-assigned to engineers.
- **Sensitivity:** anyone with repo read access can see this folder. Keep genuinely
  confidential material (cap table, term sheets, named-account financials) out of git and
  reference it by pointer only.

---

## Document status legend

- `DRAFT` — first pass, expect gaps. Most of this hub starts here.
- `REVIEW` — content believed correct, awaiting owner sign-off.
- `LIVE` — current working truth; act on it.
- `ARCHIVED` — kept for history, no longer authoritative.
