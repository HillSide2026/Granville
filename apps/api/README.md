# granville-api

Purpose:

- Expose Granville's external API
- Own request authentication, tenant scoping, idempotency keys, and command validation
- Translate client requests into orchestration commands

Must not own:

- Provider-specific routing rules
- Ledger postings
- Reconciliation logic
- Direct calls to Formance Payments connector APIs

Primary dependencies:

- `apps/orchestrator`
- `libs/contracts`
- `libs/persistence`

Initial Milestone 1 endpoints:

- `POST /customers`
- `GET /customers/{id}`
- `PATCH /customers/{id}`
- `POST /payment-accounts`
- `GET /payment-accounts`
- `GET /payment-accounts/{id}`
- `GET /payments`
- `POST /payments`
- `GET /payments/{id}`
- `GET /payments/{id}/status`
- `POST /webhooks/{provider}`
- `POST /reconciliation/runs`
- `GET /reconciliation/runs/{id}`
- `GET /reconciliation/exceptions`
- `GET /admin/audit-events`

Milestone 1 implementation:

- `src/granville-api.ts` provides a dependency-light API facade over the orchestrator, provider runtime, ledger writer, reconciler, and audit trail.
- `src/http.ts` provides HTTP-shaped controllers with bearer auth stubs, RBAC checks, and `Idempotency-Key` propagation.
- `openapi.yaml` captures the first customer/account/payment/webhook/reconciliation/admin surface.
- Controllers must continue to call orchestration services rather than providers or Formance directly.
