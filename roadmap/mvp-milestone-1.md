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
- Granville HTTP controllers, client SDK tests, routing rules, provider runtime, ledger writer, webhook ingest, reconciliation, admin operations, reporting, and adapter contract tests pass in memory.
- Postgres migrations, seed data, and `PostgresGranvilleStore` are wired for persistent acceptance testing.
- The provider adapter boundary is locally complete for mock EMI, mock bank, native EMI, Airwallex, and Formance Payments wrapper adapter keys.
- Airwallex is adapter-ready at the request-shape and authentication level, but live money movement remains gated behind canonical payment metadata mapping, sandbox credentials, and explicit live-mode controls.

Next checkpoint:

- Prove the same Stage 1 flow through a real migrated Postgres database and local API process.
- Use `npm run db:migrate` with `DATABASE_URL` to apply migrations and mock provider seeds.
- Use `TEST_DATABASE_URL` to run the Postgres-backed tests.

Milestone implementation state:

1. Workspace migration
   Pending.
   Move from the interim root-ledger layout to the target `third_party/formance-*` layout without losing local history or breaking CI.

2. Granville Postgres schema
   Implemented for local testing.
   Migrations cover `payment_orders`, `payment_attempts`, `provider_bindings`, `idempotency_keys`, `webhook_events`, reconciliation, audit, routing, provider health, and queue tables. The remaining proof is running the suite against a real migrated database.

3. Canonical domain package
   Implemented.
   Models live in `libs/domain` and remain independent from Formance `connectorID`.

4. Granville API
   Implemented for the current Stage 1 surface.
   The next API task is local API plus Postgres acceptance.

5. Orchestrator state machine
   Implemented for the mock EMI Stage 1 path.

6. Routing engine
   Implemented.
   Routing rules and deterministic fallback behavior are covered by tests.

7. Ledger writer
   Implemented for normalized, idempotent mock ledger posting.

8. First provider path
   Stage 1 currently uses `mock-emi`.
   The first real provider path is a native Granville EMI adapter behind the existing adapter boundary.
   Use a Formance Payments wrapper for a later provider only when an upstream connector already covers that provider cleanly.
   Airwallex is the first native EMI adapter key and is adapter-tested, but not yet Stage 1 live-money accepted.

9. Webhook ingest and replay
   Implemented for current durable webhook storage, processing attempts, replay, and normalization tests.

10. Reconciliation baseline
    Implemented for transaction-level matching, exception generation, aging, ignore/resolve flows, and admin/reporting visibility.

11. Local and staging environments
    Partially implemented.
    Local compose, env example, migrations, observability stubs, and runbooks exist. Real local-operable proof with Postgres is next; staging promotion rules remain pending.

12. Acceptance tests
    Implemented for memory-backed execution.
    The current suite covers payment order creation, routing selection, provider execution, ledger posting, webhook processing, reconciliation match, admin operations, reporting, and provider portability. Postgres-backed acceptance is the next checkpoint.

Current unblocked plan:

1. Update and keep roadmap docs aligned with the current implementation state.
2. Run the local Postgres checkpoint:
   - start local infra
   - set `DATABASE_URL`
   - run `npm run db:migrate`
   - set `TEST_DATABASE_URL`
   - run `npm run test:granville`
3. Fix any Postgres-only issues surfaced by that run.
4. Then choose between portal API integration, provider runtime hardening, or Airwallex sandbox readiness.

Milestone 1 exit criteria:

- One real provider path works end to end
- Ledger postings are idempotent and auditable
- Routing decisions are configuration-driven and replayable
- Provider state does not leak past the Granville adapter boundary
- Reconciliation can detect and expose mismatches
