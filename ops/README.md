# Operations

This folder is the Granville-owned operational wrapper around the current Formance checkouts.

Current interim layout:

- repository root: Formance Ledger checkout
- `vendor/formance-payments`: Formance Payments checkout
- `vendor/formance-stack`: Formance Stack checkout

Target layout after the non-destructive workspace migration:

```text
granville/
  apps/
  libs/
  ops/
  roadmap/
  third_party/
    formance-ledger/
    formance-payments/
    formance-stack/
```

Local development:

- Ledger only:
  `docker compose -f ops/docker-compose.local.yml up ledger-postgres ledger-worker ledger`
- Ledger plus Formance Payments:
  `docker compose -f ops/docker-compose.local.yml --profile payments up`
- Granville operational DB migrations:
  `DATABASE_URL=postgres://... npm run db:migrate`
- Granville API:
  `DATABASE_URL=postgres://... PORT=8080 npm run start:api`

For first-time local API boot, set `GRANVILLE_AUTO_MIGRATE=1` to apply migrations and mock provider seeds before the API starts.
The compose-managed Granville Postgres service is exposed on host port `5433`, so local tests can use `TEST_DATABASE_URL=postgres://granville:granville@localhost:5433/granville`.

Notes:

- The local compose intentionally skips Formance `gateway` and `console`.
- For webhook-driven payment connectors, override `STACK_PUBLIC_URL` with a public tunnel before testing provider callbacks.

Production deployment rule:

- Deploy Granville services from `apps/`
- Deploy Formance services as infrastructure dependencies
- Keep version pins in `ops/versions.lock.yaml`
