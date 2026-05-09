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

Current migration set:

- [migrations/0001_granville_operational_core.sql](/Users/matthewajlevinelaw/Repos/Granville/libs/db/migrations/0001_granville_operational_core.sql)

Important rule:

- API handlers and provider workers must write operational state here.
- Formance Ledger should only be written through the async ledger writer boundary.
