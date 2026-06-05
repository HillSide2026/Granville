# Portal Roadmap — Customer Portal & Operator Console

Four tracks covering the end-customer portal (`apps/portal`) and the operator console (`apps/ops-ui`).

---

## User Types

| Type | App | Priority |
|---|---|---|
| End-customer (account owner + teammates) | `apps/portal` | Primary |
| Internal operator (ops, compliance, admin) | `apps/ops-ui` | Secondary |

---

## Track 1 — Portal Cleanup

**Status: Complete (2026-05-30)**

Removed template scaffolding, renamed features to match Granville's domain, and made identity auth-driven.

| Item | Change |
|---|---|
| Wallets → Budgets | Route `/budgets`, labels "Budgets" / "New Budget". Fiat + crypto scope. |
| `/wallets` stub | Route reserved for mpcium crypto wallet integration |
| Transfers → Payments + Sales | Payments = outbound (`/payments`); Sales = inbound (`/sales`). Two top-level nav items. |
| Beneficiaries | Sub-concept within Payments — accessible via header link, not a top-level nav item |
| Compliance, Approvals, Cards removed | Operator features removed from customer portal nav entirely |
| FX | "Soon" badge replaced with "Access required" state and "Request FX access" button |
| Dashboard | Customer-oriented: Budgets count, Payments count, Pending count, Recent Transactions, Quick Links. Operator telemetry removed. |
| Settings | Sub-nav: Account, Security, Appearance, Notifications. Social profile copy (bio, @mentions, URLs) removed. Name and email driven from auth. |
| Identity | Sidebar footer, profile dropdown, and settings all driven from `useAuthStore`. No hardcoded names or emails. Test account shows `test`. |
| URLs | All references updated to `granvillefinance.ca` |

**Nav structure (post-cleanup):**

```
General:      Dashboard
Finance:      Budgets · Wallets · Balances
Transactions: Payments · Sales
Services:     FX
Other:        Settings
```

---

## Track 2 — Feature Permission Model

**Status: Not started**

Two-layer feature gate: each of the six features (Budgets, Wallets, Balances, Payments, Sales, FX) requires approval from both layers before a user can access it.

| Layer | Granted by | Mechanism |
|---|---|---|
| System-level | Granville operator (via `apps/ops-ui`) | Operator enables feature for an account owner |
| Account-owner level | Account owner | Owner grants/restricts teammates' access to features they hold |

A teammate's effective access = system-approved features for that account ∩ features the account owner has granted.

### Items

| # | Item | Notes |
|---|---|---|
| 1 | Feature gate hook | `useFeatureAccess(feature)` — returns `{ enabled, reason }` based on auth state + API |
| 2 | Gated nav rendering | Nav items only render if the user passes both gate layers for that feature |
| 3 | FX locked state | Already built — wire to real system-approval flag once gate hook exists |
| 4 | Wallets locked state | Show mpcium stub or locked state based on system approval |
| 5 | Team Management in Settings | New Settings sub-section: account owner invites teammates, sets per-feature access |
| 6 | Teammate invitation flow | Email invite → teammate signs up → account owner approves feature access |
| 7 | Customer-side approvals | Account owner sees and acts on teammate feature access requests |
| 8 | API endpoints | `GET /me/features`, `GET /team`, `POST /team/invite`, `PATCH /team/:id/features` |

### Acceptance Criteria

- Nav items are hidden for features not enabled for the account
- Account owner can invite teammates and toggle feature access per teammate
- A teammate cannot access a feature the account owner does not hold
- Feature state survives page refresh (persisted, not just in-memory)

---

## Track 3 — Wallets / mpcium Integration

**Status: Not started — blocked on mpcium repo readiness**

The `/wallets` route is stubbed and reserved. Full integration requires the mpcium repo (`/repos/mpcium`) to expose an interface the portal can embed or link to.

| # | Item | Notes |
|---|---|---|
| 1 | Assess mpcium interface | Determine whether mpcium is an iframe embed, a redirect, or an API-backed UI |
| 2 | Auth handoff | Establish how Granville auth token is passed to mpcium |
| 3 | Replace stub | Implement the `/wallets` route with real mpcium integration |
| 4 | Wallet data on dashboard | Pull wallet summary (balances) from mpcium into the Dashboard Budgets/Wallets cards |

---

## Track 4 — Operator Console (`apps/ops-ui`)

**Status: Stub only — `apps/ops-ui/README.md` exists, no implementation**

Separate app for internal Granville staff. Not visible to end-customers.

### Roles

| Role | Responsibilities |
|---|---|
| `ops` | Payment oversight, manual approvals, provider health |
| `compliance` | KYC review, customer management, audit log |
| `admin` | Full access including feature provisioning for account owners |

### Items

| # | Item | Notes |
|---|---|---|
| 1 | Scaffold `apps/ops-ui` | Vite + React + TanStack Router, same stack as portal |
| 2 | Auth | Separate sign-in; operator tokens (`ops-`, `admin-`, `compliance-` prefix convention already in `auth-store.ts`) |
| 3 | Customer management | Customer list, KYC status, customer detail — moved from portal's Compliance page |
| 4 | Feature provisioning | Operator enables/disables features per account owner (feeds Track 2 system-layer gate) |
| 5 | Payment oversight | All payments across all customers; approve/reject pending_review payments |
| 6 | Compliance | KYC queue, audit log export, compliance report download |
| 7 | Provider health | Provider status, routing rules, health management (from M7 ops-ui milestone) |

### Acceptance Criteria

- Operator console is a separate URL and separate auth from the customer portal
- No customer-facing features appear in the operator console
- Operator can provision/deprovision features for any account owner
- Approval actions taken in ops-ui appear in the customer's portal pending items (Track 2 feedback loop)

---

## Summary

| Track | Status | Blocker |
|---|---|---|
| Track 1 — Portal Cleanup | **Complete** | — |
| Track 2 — Feature Permission Model | Not started | Requires API endpoints + auth model decision |
| Track 3 — mpcium Integration | Not started | mpcium repo readiness |
| Track 4 — Operator Console | Not started | Track 2 (feature provisioning is the ops-ui → portal link) |
| Track 5 — Repo Restructure | Not started | Best done when current tracks are stable |

---

## Track 5 — Repo Restructure (frontend / backend split)

**Status: Not started — low urgency, do when current tracks are stable**

Currently all apps (React frontends and Node.js backends) sit as siblings under `apps/`
with no visual distinction. The fix is to split at the top level:

```
web/              ← frontend apps
  portal/
  ops-ui/
  website/
services/         ← backend services
  api/
  orchestrator/
  provider-runtime/
  ledger-writer/
  reconciler/
  webhook-ingest/
libs/             ← shared (unchanged)
```

### Items

| # | Item | Notes |
|---|---|---|
| 1 | Move `apps/portal`, `apps/ops-ui`, `apps/website` → `web/` | Update all internal import paths and tsconfig references |
| 2 | Move backend services → `services/` | Update all internal import paths and tsconfig references |
| 3 | Update pnpm workspace config | `pnpm-workspace.yaml` globs need updating |
| 4 | Update Dockerfile and any CI/CD references | Ensure build paths resolve correctly |
| 5 | Update `ARCHITECTURE.md` and `apps/README.md` | Reflect new layout |

### Acceptance Criteria

- `web/` contains only frontend apps; `services/` contains only backend services
- All tests pass after the move
- No broken import paths
- Documentation reflects the new structure
