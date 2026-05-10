# granville-persistence

Granville Postgres is the operational system of record for:

- payment orders
- payment attempts
- routing decisions
- provider bindings
- webhook events and replay state
- idempotency records
- reconciliation cases

Formance Ledger remains the financial system of record for:

- immutable postings
- balances
- accounting history

Milestone 1 implementation:

- `src/in-memory-store.ts` is the dependency-light test adapter for the Granville repository boundary.
- `src/postgres-repositories.ts` is the production-shaped SQL repository implementation for the existing migration schema.
- `src/repository-contracts.ts` defines the persistence boundary used by API, orchestration, provider runtime, ledger writer, and reconciliation work.
- It models idempotency records, audit events, provider bindings, webhook storage, ledger posting queue items, and reconciliation exceptions.
- The production persistence implementation should preserve the same ownership boundaries against the SQL schema in `libs/db/migrations`.
