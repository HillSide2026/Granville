# Granville

Granville is a payments orchestration platform built on top of Formance infrastructure primitives.

Granville is:

- an MSB orchestration layer
- a payment monitoring plane
- a provider abstraction layer
- ledger-centric for accounting truth
- EMI-led for Stage 1
- bank-ready for Stage 2

Granville is not:

- a bank
- a custody platform
- a core banking system
- a lending platform
- a card issuing processor

## Platform Roles

### Granville

Granville owns:

- orchestration
- routing
- provider adapters
- webhook durability
- operational persistence
- reconciliation
- audit trail

### Formance Ledger

Formance Ledger remains the accounting engine and immutable financial record.

Current implementation references:

- API server entrypoint: [cmd/serve.go](/Users/matthewajlevinelaw/Repos/Granville/cmd/serve.go:80)
- Worker entrypoint: [cmd/worker.go](/Users/matthewajlevinelaw/Repos/Granville/cmd/worker.go:91)
- Ledger API surface: [internal/api/v2/routes.go](/Users/matthewajlevinelaw/Repos/Granville/internal/api/v2/routes.go:21)

Ledger is used for:

- immutable postings
- balances
- accounting history
- financial truth

### Formance Payments

Formance Payments is an optional connector runtime that Granville wraps behind its own provider adapter boundary.

Current implementation references:

- Server entrypoint: [vendor/formance-payments/cmd/server.go](/Users/matthewajlevinelaw/Repos/Granville/vendor/formance-payments/cmd/server.go:16)
- Worker entrypoint: [vendor/formance-payments/cmd/worker.go](/Users/matthewajlevinelaw/Repos/Granville/vendor/formance-payments/cmd/worker.go:14)
- API surface: [vendor/formance-payments/internal/api/v3/router.go](/Users/matthewajlevinelaw/Repos/Granville/vendor/formance-payments/internal/api/v3/router.go:12)

Payments may be used for:

- existing provider connectors
- webhook translation
- provider polling
- connector task execution

It must not become Granville's canonical orchestration domain.

### EMI Adapter Role

For Stage 1, Granville routes all outbound payment activity through an EMI adapter boundary.

That boundary can be implemented in two ways:

- a Granville wrapper over Formance Payments connectors
- a native Granville EMI adapter for provider-specific or direct integrations

The orchestration layer must not depend on provider-native models or Formance `connectorID`.

## Repository Layout

Current interim state:

- repository root currently contains the Formance Ledger checkout
- `vendor/formance-payments` contains the Formance Payments checkout
- `vendor/formance-stack` contains the Formance Stack checkout
- Granville-owned code now lives under `apps/`, `libs/`, `ops/`, `roadmap/`, and `third_party/`

Granville-owned paths:

- [apps/](/Users/matthewajlevinelaw/Repos/Granville/apps)
- [libs/](/Users/matthewajlevinelaw/Repos/Granville/libs)
- [ops/](/Users/matthewajlevinelaw/Repos/Granville/ops)
- [roadmap/](/Users/matthewajlevinelaw/Repos/Granville/roadmap)
- [third_party/](/Users/matthewajlevinelaw/Repos/Granville/third_party)

Target long-term state:

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

## Current Application Surfaces

- [apps/website/](/Users/matthewajlevinelaw/Repos/Granville/apps/website) is the public marketing and legal site.
- [apps/portal/](/Users/matthewajlevinelaw/Repos/Granville/apps/portal) is the standalone customer-facing authenticated portal shell.
- [apps/api/](/Users/matthewajlevinelaw/Repos/Granville/apps/api) is the Granville customer-facing API boundary.
- [apps/ops-ui/](/Users/matthewajlevinelaw/Repos/Granville/apps/ops-ui) is the internal operations console.

Portal status:

- browser-routed sign-in and sign-up entry points exist at `/sign-in` and `/sign-up`
- the current shell exposes `dashboard`, `accounts`, `activity`, and `settings`
- the portal currently uses a local mock API boundary in [apps/portal/src/api/](/Users/matthewajlevinelaw/Repos/Granville/apps/portal/src/api)
- future product work should replace that mock boundary with real calls into `apps/api`

## Local Development

Ledger only:

```sh
docker compose -f ops/docker-compose.local.yml up ledger-postgres ledger-worker ledger
```

Ledger plus optional Formance Payments runtime:

```sh
docker compose -f ops/docker-compose.local.yml --profile payments up
```

Notes:

- the wrapper compose intentionally skips Formance `gateway` and `console`
- webhook-driven connector testing requires a real public `STACK_PUBLIC_URL`
- Granville business logic should be added under `apps/` and `libs/`, not in upstream Formance packages

Portal only:

```sh
cd apps/portal
npm install
npm start
```

The current customer portal shell should open on the browser-routed sign-in page at `/sign-in`.

## Key Docs

- Architecture overview: [ARCHITECTURE.md](/Users/matthewajlevinelaw/Repos/Granville/ARCHITECTURE.md)
- Decision log: [DECISIONS.md](/Users/matthewajlevinelaw/Repos/Granville/DECISIONS.md)
- Ops wrapper: [ops/README.md](/Users/matthewajlevinelaw/Repos/Granville/ops/README.md)
- Version pins: [ops/versions.lock.yaml](/Users/matthewajlevinelaw/Repos/Granville/ops/versions.lock.yaml)
- Implementation roadmap: [roadmap/granville-repo-implementation-roadmap.md](/Users/matthewajlevinelaw/Repos/Granville/roadmap/granville-repo-implementation-roadmap.md)
- Portal shell notes: [apps/portal/README.md](/Users/matthewajlevinelaw/Repos/Granville/apps/portal/README.md)
