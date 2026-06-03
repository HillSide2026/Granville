# Product Surface Separation Workplan

This workplan defines and enforces the boundary between Granville's customer-facing portal and internal operations console.

## Goal

Granville has two product surfaces with separate audiences, permissions, routes, copy, and API boundaries:

| Surface | App | Audience | Purpose |
|---|---|---|---|
| Customer portal | `apps/portal` | Account owners and teammates | Self-serve payment operations for the customer's own organization |
| Internal ops console | `apps/ops-ui` | Granville operations, compliance, and admin staff | Platform oversight, exception handling, approvals, compliance, and provider operations |

The customer portal must not call `/admin/*`, render internal workflows, or imply Granville custody or official funds-ledger authority.

## Step 1 - Define Surface Ownership

**Status: Complete**

### Customer Portal Ownership

`apps/portal` owns customer self-serve workflows scoped to the authenticated customer or organization.

Allowed responsibilities:

- Customer dashboard for the customer's own payment activity
- Customer-scoped payment list, payment detail, and payment creation
- Customer-scoped payment submission, cancellation, and retry where permitted
- Customer-scoped sales or inbound payment activity
- Customer-scoped payment accounts and beneficiaries
- Customer settings, notification preferences, team/member settings, and feature access requests
- Customer-visible balance or status displays, only with clear source and custody wording

Forbidden responsibilities:

- Calls to `/admin/*`
- All-customer payment oversight
- Granville operator approval or rejection queues
- Provider health, provider enablement, or routing administration
- KYC/compliance review queues
- Global audit export or compliance reports
- Webhook, ledger posting, or reconciliation retry operations
- Copy implying Granville holds funds, issues wallets, stores value, or maintains the official funds ledger

### Internal Ops Console Ownership

`apps/ops-ui` owns internal Granville staff workflows.

Allowed responsibilities:

- Payment oversight across customers
- Operator approval and rejection of payments in `pending_review`
- Provider health, provider disable/enable, and routing visibility
- Reconciliation exceptions, resolve/ignore actions, and evidence review
- Webhook and ledger posting retry surfaces
- Compliance/KYC queues and customer review
- Audit event search and audit export
- Feature provisioning for customer accounts
- Internal metrics and operational monitoring

Forbidden responsibilities:

- Customer self-serve payment creation UX
- Customer-only account settings
- Customer-facing marketing or onboarding flows
- Any copy that obscures the distinction between Granville orchestration and regulated partner custody/execution

### Approval Terminology Decision

Use distinct names for distinct workflows:

- **Operator approval**: Granville staff review of a payment order before partner submission. This belongs in `apps/ops-ui`.
- **Customer teammate approval**: An account owner approving a teammate's feature access or payment request within the customer's own organization. This may belong in `apps/portal`, but must not use `/admin/*` or imply Granville operator approval.

### Endpoint Boundary

Customer portal endpoints must be customer-scoped:

- `GET /payments`
- `GET /payments/:id`
- `POST /payments`
- `POST /payments/:id/submit`
- `POST /payments/:id/cancel`
- `POST /payments/:id/retry`
- `GET /payment-accounts`
- `GET /payment-accounts/:id`
- `GET /beneficiaries`
- `POST /beneficiaries`

Ops console endpoints may use admin and operational APIs:

- `GET /admin/payments`
- `GET /admin/payment-attempts`
- `GET /admin/audit-events`
- `GET /admin/reports/audit-export`
- `GET /admin/reconciliation-exceptions`
- `GET /admin/providers`
- `POST /payments/:id/approve`
- `POST /payments/:id/reject`
- provider enable/disable endpoints
- webhook, ledger, and reconciliation retry endpoints

### Copy Boundary

Customer portal preferred wording:

- "Payment order"
- "Payment account"
- "Submit for processing"
- "Submitted to regulated partner"
- "Partner execution status"
- "Reported balance"
- "Accounting mirror"

Customer portal wording to avoid:

- "Wallet"
- "Stored value"
- "Granville balance"
- "Held by Granville"
- "Send now"
- "Broadcast"
- "Real-time cash"
- "Official ledger"

## Implementation Workplan

| Step | Status | Outcome |
|---|---|---|
| 1 | Complete | Define product-surface ownership, endpoint boundaries, and copy boundaries |
| 2 | Complete | Inventory and classify existing portal routes |
| 3 | Complete | Replace portal `/admin/*` API usage with customer-scoped or customer-safe hooks |
| 4 | Not started | Create separate `customer-api` and `admin-api` client modules |
| 5 | Complete | Flesh out `apps/ops-ui` routes and shell for approvals, compliance, provider health, reports, and audit |
| 6 | Complete | Move approvals, compliance, provider health, audit export, and operational reports to `apps/ops-ui` |
| 7 | Complete | Add route and API guardrails so `apps/portal` cannot depend on `/admin/*` |
| 8 | Complete | Clean customer and ops copy for custody, execution, and approval clarity |
| 9 | Not started | Add tests and CI checks for product-surface boundaries |

## Step 2 - Route Inventory And Classification

**Status: Complete**

Current route classification:

| Route or feature | Target surface | Notes |
|---|---|---|
| `/` | `apps/portal` | Customer dashboard |
| `/payments` | `apps/portal` | Customer-scoped payment activity |
| `/payments/:id` | `apps/portal` | Customer-scoped payment detail |
| `/sales` | `apps/portal` | Customer-scoped inbound activity |
| `/balances` | `apps/portal` | Must use reported/accounting-mirror wording |
| `/budgets` | `apps/portal` | Customer feature |
| `/fx` | `apps/portal` | Feature-gated customer service |
| `/help-center` | `apps/portal` | Customer support/help surface |
| `/transfers` | remove or alias | Legacy/template route; Payments and Sales own the payment activity vocabulary |
| `/beneficiaries` | `apps/portal` | Customer-scoped payee management |
| `/settings/*` | `apps/portal` | Customer settings |
| `/wallets` | reserved or hidden | Requires explicit custody/mpcium decision |
| `/approvals` | `apps/ops-ui` | Granville operator approval queue |
| `/compliance` | `apps/ops-ui` | Internal compliance review |
| `/cards` | remove or decide | Not part of current customer payment operations scope |
| provider health | `apps/ops-ui` | Internal provider operations |
| audit export | `apps/ops-ui` | Internal audit/compliance operation |

Current portal `/admin/*` dependencies found during inventory:

| File | Endpoint(s) | Classification |
|---|---|---|
| `apps/portal/src/features/transfers/hooks/use-transfers.ts` | `GET /admin/payments` | Replaced with `GET /payments` in Step 3 |
| `apps/portal/src/features/transfers/hooks/use-transfers.ts` | `GET /admin/payment-attempts` | Removed from portal hook; still needs a customer-scoped payment lifecycle endpoint if customer detail exposes attempts |
| `apps/portal/src/features/wallets/hooks/use-wallets.ts` | `GET /admin/payment-accounts` | Replaced with `GET /payment-accounts` in Step 3 |
| `apps/portal/src/features/approvals/index.tsx` | `GET /admin/payments` | Moved to `apps/ops-ui`; portal route now redirects |
| `apps/portal/src/features/compliance/index.tsx` | `GET /admin/customers`, `GET /admin/audit-events` | Moved to `apps/ops-ui`; portal route now redirects |
| `apps/portal/src/features/balances/index.tsx` | `GET /admin/metrics`, `GET /admin/reports/settlement` | Replaced with customer-scoped `/payment-accounts` and `/payments`; internal settlement reporting remains in `apps/ops-ui` |

## Step 3 - Customer-Scoped Portal APIs

**Status: Complete**

Completed changes:

- Added customer-path `GET /payments` requiring `payment:read`.
- Added customer-path `GET /payment-accounts` requiring `payment:read`.
- Replaced the portal payment list hook from `GET /admin/payments` to `GET /payments`.
- Replaced the portal payment account list hook from `GET /admin/payment-accounts` to `GET /payment-accounts`.
- Removed portal use of `GET /admin/payment-attempts`; customer attempt/lifecycle exposure requires a dedicated customer-scoped endpoint.
- Removed portal Balances usage of `/admin/metrics` and `/admin/reports/settlement`; operational settlement reporting now belongs in `apps/ops-ui`.

Follow-up changes:

- Rename `useTransfers` to a payment-domain hook or split inbound/outbound hooks.
- Keep all-customer payment reads in `apps/ops-ui` only.
- Add a development-time guard in the customer API wrapper that rejects `/admin/*` paths.
- Decide whether customer payment detail should expose attempts through `GET /payments/:id/timeline`, `GET /payments/:id/attempts`, or an internal-only ops detail.
- Add automated guardrails so future portal code cannot introduce new `/admin/*` dependencies.

## Step 4 - API Client Split

Planned structure:

```text
apps/portal/src/lib/customer-api.ts
apps/portal/src/features/payments/hooks/use-payments.ts

apps/ops-ui/src/lib/admin-api.ts
apps/ops-ui/src/features/payment-oversight/hooks/use-admin-payments.ts
```

Shared domain types should remain in contracts or a shared frontend-safe package. UI hooks should stay app-local unless they are explicitly customer-safe.

## Step 5 - Ops UI Shell

**Status: Complete**

Initial internal routes:

```text
/
/payments
/payments/:id
/approvals
/reconciliation
/providers
/audit
/compliance
/settings
```

Initial pages:

- Payment oversight list
- Pending approval queue
- Payment detail with attempts, audit events, provider references, and reconciliation state
- Provider health list
- Audit event search and export

Implemented shell/routes:

- `/`: operational dashboard
- `/approvals`: operator payment approval queue
- `/payments`: all-customer payment oversight list
- `/payments/:id`: payment detail with attempt timeline
- `/providers`: provider health with enable/disable actions
- `/routing-rules`: routing visibility
- `/webhooks`: webhook replay tooling
- `/ledger`: ledger posting retry tooling
- `/reconciliation`: reconciliation runs and exception handling
- `/reports`: operational metrics and export links
- `/audit`: audit event list
- `/compliance`: customer/KYC, compliance payment records, and recent audit events

## Step 6 - Move Internal Features

**Status: Complete**

Move by ownership:

- `apps/portal/src/features/approvals` to `apps/ops-ui` - Complete
- `apps/portal/src/features/compliance` to `apps/ops-ui` - Complete
- provider health UI to `apps/ops-ui` - Complete
- audit export/reporting UI to `apps/ops-ui` - Complete
- all-customer payment oversight to `apps/ops-ui` - Complete

After each move:

- Remove the customer portal route
- Remove customer portal nav entries
- Update the generated route tree
- Ensure customer "needs attention" links only point to customer-owned payment activity

## Step 7 - Guardrails

**Status: Complete**

Planned guardrails:

- Portal source test that fails on `/admin` references in `apps/portal/src`
- Customer API wrapper that throws for `/admin/*`
- Restricted imports so `apps/portal` cannot import `apps/ops-ui` or `admin-api`
- Route metadata check so portal routes cannot require `ops`, `compliance`, or `admin` roles
- Boundary test confirming operator approval and compliance implementations do not live in `apps/portal`

Follow-up guardrails:

- Route metadata check so portal routes cannot require `ops`, `compliance`, or `admin` roles
- CI entry that runs the boundary checks explicitly if `npm run test:granville` is not the default gate

## Step 8 - Copy Cleanup

**Status: Complete**

Customer portal copy changes:

- "New Transfer" -> "New payment"
- "Create Transfer" -> "Create payment order"
- "Wallet / Account ID" -> "Payment account ID"
- "Submit" -> "Submit for processing"
- "Available cash" -> "Reported balances"
- "Real-time balance" -> "Balance data reported by connected partners"
- Legacy `/transfers` route redirects to `/payments`
- Reserved `/wallets` route redirects to `/`

Ops UI copy:

- "Approve for partner submission"
- "Reject payment order"
- "Provider execution"
- "Granville orchestration state"
- "Audit events"
- "Reconciliation evidence"

## Step 9 - Acceptance Criteria

The surface separation is complete when:

- `apps/portal` has no `/admin/*` API calls
- `apps/portal` has no Granville operator approval, compliance, provider-health, or audit-export routes
- `apps/ops-ui` owns payment oversight, operator approvals, provider health, reconciliation, compliance, and audit export
- Customer payment views are scoped to the current customer or organization
- Internal routes require internal roles
- CI fails if portal source references `/admin`
- Copy clearly separates Granville orchestration from regulated partner custody and execution
