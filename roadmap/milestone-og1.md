# Milestone OG1 — Access Control & Approval Workflows

**Status: Partial — technical role enforcement and approval endpoints done; institutional role taxonomy and maker/checker not implemented.**

---

## Objective

Restrict every privileged action by institutional role, and enforce dual-control so that no single operator can both initiate and approve a sensitive financial operation.

---

## Scope

**Roles:**

| Role | Responsibilities |
|---|---|
| `support` | Read-only payment and customer lookup |
| `compliance_analyst` | KYC review, compliance event access |
| `compliance_manager` | Compliance approvals, exception override |
| `operations` | Payment retry, webhook replay, ledger retry |
| `treasury_operations` | Provider management, routing rule changes |
| `auditor` | Read-only audit log and report access |
| `super_admin` | All actions including role assignment and system config |

**Controls:**
- Payout approval workflows (maker initiates, checker approves)
- Manual override approvals
- Sensitive operational controls (routing changes, provider disable)
- Maker/checker enforcement

---

## What Is Done

- Role enforcement in `GranvilleHttpControllers` via `requireRole(context, role)`
- Existing role set: `admin:read`, `admin:write`, `payment:read`, `payment:write`, `reconciliation:read`, `reconciliation:write`, `customer:read`
- All sensitive routes require `admin:read` or `admin:write`
- Role enforcement tested: unauthorized access returns 403
- `POST /payments/:id/approve` and `POST /payments/:id/reject` endpoints
- Portal approvals page: lists payments in `pending_review`, approve/reject with confirmation dialog
- All approval/rejection actions emit audit events

---

## What Is Outstanding

| Item | Notes |
|---|---|
| Institutional role taxonomy | `support`, `compliance_analyst`, `compliance_manager`, `operations`, `treasury_operations`, `auditor`, `super_admin` not defined or enforced |
| Route-to-role mapping | Each admin route needs a specific institutional role, not the generic `admin:read/write` split |
| Portal role enforcement | Any authenticated user sees all portal pages regardless of role |
| Role assignment persistence | Roles are passed in via API context with no storage — no assign/revoke mechanism |
| Maker/checker enforcement | Payment creator can approve their own payment — the constraint is not enforced |
| Dual approval for sensitive ops | Routing rule changes, provider disable, and bulk operations have no dual-approval gate |
| Approval chain linkage | Approver identity is not linked to initiator identity in a queryable chain |

---

## Acceptance Criteria

- Privileged actions restricted by institutional role: each sensitive operation is protected by a specific role check from the taxonomy above
- Production access controlled and auditable: role assignments are persisted, changes are audit-logged, unauthorized access is blocked
- Dual approval enforced: the actor who initiates a payment or sensitive operation cannot be the same actor who approves it
- Approval chain fully auditable: every decision is traceable to a role-bearing actor with timestamp
