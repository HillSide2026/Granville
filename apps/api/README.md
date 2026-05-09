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
- `libs/domain`
- `libs/persistence`

Initial Milestone 1 endpoints:

- `POST /payment-orders`
- `GET /payment-orders/{id}`
- `POST /payment-orders/{id}/cancel`
- `GET /providers`
- `GET /health`
