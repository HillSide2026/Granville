# MVP Milestone 1

Objective:

- Stand up Granville as a provider-portable payment orchestration foundation using Formance Ledger and, where useful, Formance Payments.

Scaffolding completed in this repo:

- Granville-owned application boundaries under `apps/`
- Shared contracts and ownership boundaries under `libs/`
- Local operations wrapper under `ops/`
- Upstream version pinning in [ops/versions.lock.yaml](../ops/versions.lock.yaml)
- Local wrapper compose in [ops/docker-compose.local.yml](../ops/docker-compose.local.yml)

Current implementation status:

- Mock EMI Stage 1 flow is implemented and covered by `test/granville/e2e-stage1-payment-flow.test.ts`.
- Granville HTTP controllers, client SDK tests, routing rules, provider runtime, ledger writer, webhook ingest, reconciliation, admin operations, and reporting tests pass in memory.
- Postgres migrations, seed data, and `PostgresGranvilleStore` are wired for persistent acceptance testing.

Next checkpoint:

- Prove the same Stage 1 flow through a real migrated Postgres database and local API process.
- Use `npm run db:migrate` with `DATABASE_URL` to apply migrations and mock provider seeds.
- Use `TEST_DATABASE_URL` to run the Postgres-backed tests.

Remaining work to take Milestone 1 from mock-complete to local-operable:

1. Workspace migration
   Move from the interim root-ledger layout to the target `third_party/formance-*` layout without losing local history or breaking CI.

2. Granville Postgres schema
   Keep migrations current for `payment_orders`, `payment_attempts`, `provider_bindings`, `idempotency_keys`, `webhook_events`, reconciliation, audit, routing, provider health, and queue tables.

3. Canonical domain package
   Implement the models described in `libs/domain` and keep them independent from Formance `connectorID`.

4. Granville API
   Build the first customer-facing endpoints from `apps/api` and make them write only to Granville operational storage.

5. Orchestrator state machine
   Implement the first attempt lifecycle in `apps/orchestrator`: requested, routed, submitted, provider_pending, succeeded, failed, reversed.

6. Routing engine
   Implement configuration-driven provider selection in `apps/router`, including deterministic fallback policy.

7. Ledger writer
   Implement normalized posting templates and idempotent writes into Formance Ledger.

8. First provider path
   Stage 1 currently uses `mock-emi`.
   The first real provider path is a native Granville EMI adapter behind the existing adapter boundary.
   Use a Formance Payments wrapper for a later provider only when an upstream connector already covers that provider cleanly.

9. Webhook ingest and replay
   Add a Granville-owned webhook event store, signature verification policy, replay tooling, and normalized event publication.

10. Reconciliation baseline
    Build API-driven reconciliation for the first provider and link provider-side transactions to Granville payment attempts and ledger effects.

11. Local and staging environments
    Wire secrets, config loading, migrations, and environment promotion rules around the wrapper compose and future deployment manifests.

12. Acceptance tests
    Add end-to-end coverage for:
    payment order creation
    routing selection
    provider execution
    ledger posting
    webhook processing
    reconciliation match

Milestone 1 exit criteria:

- One real provider path works end to end
- Ledger postings are idempotent and auditable
- Routing decisions are configuration-driven and replayable
- Provider state does not leak past the Granville adapter boundary
- Reconciliation can detect and expose mismatches
