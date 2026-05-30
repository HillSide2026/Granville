# MVP — Design System

## Status Summary

| Milestone | Status |
|---|---|
| DS1 — Brand foundations | **Complete** |
| DS2a — Token foundation | **Complete** |
| DS2b — Component standardization | Not started |
| DS2c — Voice and content audit | Not started |
| DS2d — Icon governance | Not started |

---

## DS1 + DS2a (Complete)

Brand foundations and token rollout are done. `libs/brand/` holds the typed source of truth (`brand-foundations.ts`), framework-neutral CSS variables (`css-vars.css`), and the migration map. Both apps import `css-vars.css`. The portal `--primary` token is mapped to `--granville-color-gold-300`. Dark mode tokens remapped to the Granville navy/gold palette.

---

## DS2b — Component Standardization

**All items unblocked. Configuration and minor CSS edits, no component rewrites.**

| Item | Action |
|---|---|
| Button shape rule | Document in `brand-foundations.ts`: marketing = pill (`rounded-full`), portal = rectangle (`rounded-md`) |
| Portal `CardTitle` sizes | Audit `apps/portal/src/features/` — set `text-sm` (metric cards) or `text-base` (section cards) explicitly on unlabeled instances |
| Marketing feature typography | Replace `text-[1.3rem]` in the `Feature` component with `text-xl` or `text-2xl` |
| Letter spacing rule | Add `typography.tracking` to `brand-foundations.ts`: `tight` for portal headings/nav, `tighter` for hero/display only |
| Button label casing | Audit all `<Button>` instances across both apps; fix any title case to sentence case |
| Shadow scale rule | Add `shadow` entry to `brand-foundations.ts`: portal cards `shadow-sm`, portal inputs no shadow, marketing panels `shadow-md` |

**Exit criteria:** `brand-foundations.ts` documents button shape, casing, tracking, and shadow rules; all `CardTitle` instances have explicit sizes; no `text-[literal]` in marketing components; all button labels use sentence case.

---

## DS2c — Voice and Content Audit

**All items unblocked. Copy work, no code dependencies.**

| Item | Action |
|---|---|
| Marketing template copy | Audit against voice guidelines in `brand-foundations.ts`; replace generic SaaS claims and placeholder text with institutional language |
| Navigation labels | Review `apps/portal/src/components/layout/data/sidebar-data.ts`; confirm labels match the canonical nav structure: General (Dashboard) · Finance (Budgets, Wallets, Balances) · Transactions (Payments, Sales) · Services (FX) · Other (Settings) |
| Portal dashboard labels | Review `apps/portal/src/features/dashboard/` — current labels are Budgets, Payments, Pending, Recent Transactions, Quick Links; confirm these use institutional voice |
| CTA voice | Audit CTA labels across both apps; preferred: "Send payment", "View transactions"; avoid: "Get started", "Unlock growth" |

**Exit criteria:** Marketing site passes voice review — no generic SaaS claims, no template placeholder text; portal nav labels match capability vocabulary; all CTAs use institutional voice and sentence case.

---

## DS2d — Icon Governance

**All items unblocked. Icon replacements and gap audits are small targeted changes.**

**Rule:** Tabler icons for generic UI controls only (chevrons, close, search, arrows). Granville institutional icons (`libs/brand/`) required for domain navigation items, dashboard metric cards, and marketing product cards.

| Item | Action |
|---|---|
| Portal sidebar icons | Review `sidebar-data.ts`; replace Tabler icons on domain nav items with institutional icons |
| Marketing feature card icons | Replace any Tabler icons in product capability cards with institutional icons |
| Icon/text gap | Confirm `gap-2` (8px) applied wherever an icon sits adjacent to a label |
| Stroke weight | Visual review of all institutional icons in `libs/brand/` against a reference; fix any inconsistencies |
| Document the rule | Add the Tabler/institutional split rule explicitly to `brand-foundations.ts` |

**Exit criteria:** No Tabler icon used for a domain navigation item, dashboard metric, or product feature card; all domain icons from `libs/brand/`; 8px gap consistent; stroke weight consistent; rule documented.
