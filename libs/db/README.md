# granville-db

This package defines Granville's operational PostgreSQL schema.

Ownership split:

- Granville Postgres stores mutable operational state
- Formance Ledger stores immutable financial postings and balances

Granville Postgres owns:

- customers
- KYC state
- payment orders and attempts
- provider bindings and provider-side transaction history
- webhook durability and replay state
- idempotency records
- ledger posting queue state
- reconciliation runs, records, and exceptions
- audit events
- routing rules and provider capabilities

Layout:

- `migrations/`: SQL migrations
- `schema/`: table-group documentation and ownership notes
- `migrate.ts`: local migration and seed runner

Current migration set:

- [migrations/0001_granville_operational_core.sql](migrations/0001_granville_operational_core.sql)
- [migrations/0002_provider_runtime_and_health.sql](migrations/0002_provider_runtime_and_health.sql)
- [migrations/0003_m5_m6_schema_additions.sql](migrations/0003_m5_m6_schema_additions.sql)
- [migrations/0004_schema_gaps.sql](migrations/0004_schema_gaps.sql)
- [migrations/0005_reconciliation_ignore.sql](migrations/0005_reconciliation_ignore.sql)

Local setup:

```sh
DATABASE_URL=postgres://... npm run db:migrate
```

The runner applies every SQL file under `migrations/` in filename order, then applies seed files under `seeds/`. The current seed set installs the mock EMI and mock bank providers used by local acceptance tests.

Important rule:

- API handlers and provider workers must write operational state here.
- Formance Ledger should only be written through the async ledger writer boundary.
