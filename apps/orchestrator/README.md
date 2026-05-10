# granville-orchestrator

Purpose:

- Own the canonical payment order lifecycle
- Create and manage payment attempts
- Trigger routing, provider execution, ledger writes, and reconciliation hooks
- Record operational state transitions in Granville Postgres

Core aggregates:

- `payment_order`
- `payment_attempt`
- `provider_binding`
- `webhook_event`
- `reconciliation_case`

Expected collaborators:

- `libs/router`
- `apps/provider-runtime`
- `apps/ledger-writer`
- `apps/reconciler`

Milestone 1 responsibility boundary:

- Granville decides what should happen
- Formance only records financial truth and optionally executes connector-facing work
- `src/orchestrator.ts` implements customer, account, payment, and submit commands against the operational store.
- Payment submission creates a routed `payment_attempt`; provider calls remain delegated to `apps/provider-runtime`.
- Submit, cancel, retry, and failure paths update canonical payment state and enqueue provider runtime work through durable command records.
