# Milestone FI5 — Audit Trail & Traceability

**Status: Partial — event capture done; state diffs, approval chain, and operator context pending.**

---

## Objective

Every financial and operational action must be traceable. The audit record must be rich enough to reconstruct a complete payment lifecycle end-to-end without querying live state, and robust enough to support regulatory review and incident investigation.

---

## Scope

- Complete financial lifecycle traceability (onboarding through settlement)
- Before/after state diffs in audit events
- Approval chain traceability (initiator → reviewer → approver)
- Operator context capture (IP, session)
- KYC status change events
- Searchable and exportable audit log

---

## What Is Done

- Audit events emitted for all state-creating and state-changing operations
- `auditExport` NDJSON export of all audit events in a date range
- `compliancePaymentsReport`: per-payment record with customer, account, provider binding, provider transaction ID, provider reference, and timestamps
- Payment history report filterable by status and date range
- Ops-ui audit log page with actor, action, resource, and timestamp
- `adminAddNote`: operators can attach freetext notes to any entity with full audit trail

---

## What Is Outstanding

| Item | Notes |
|---|---|
| Before/after state diffs | Audit events record action and payload but not the previous state — replaying all events in order is required to reconstruct state at a point in time |
| KYC status events | Customer KYC status changes are not surfaced as discrete audit events |
| Approval chain traceability | Approve/reject actions emit audit events but the full approval chain (initiator → reviewer → approver) is not captured as a linked sequence |
| Operator context | IP address and session ID not captured in audit events |
| Searchable audit log | Audit log is a flat list — no server-side filtering by actor, action type, resource type, or date range beyond the export endpoint |

---

## Acceptance Criteria

- Complete payment lifecycle reconstructable from audit events alone, without relying on current payment state fields
- Approval chain preserved immutably: every approval decision is traceable to a role-bearing actor with timestamp and decision rationale
- Operator context (actor identity, IP) captured on all writes
- Audit evidence exportable in a format suitable for regulatory or compliance review
