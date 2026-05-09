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

Notes:

- The local compose intentionally skips Formance `gateway` and `console`.
- For webhook-driven payment connectors, override `STACK_PUBLIC_URL` with a public tunnel before testing provider callbacks.

Production deployment rule:

- Deploy Granville services from `apps/`
- Deploy Formance services as infrastructure dependencies
- Keep version pins in `ops/versions.lock.yaml`
