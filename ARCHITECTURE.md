# Architecture

## Full-Stack Overview

Granville is a full-stack payments platform. The repo contains both layers:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (apps/)                                                   │
│                                                                     │
│  portal/          End-customer portal — Budgets, Payments,          │
│                   Sales, Wallets, Balances, FX                      │
│                   React · Vite · TanStack Router                    │
│                                                                     │
│  ops-ui/          Operator console — KYC, approvals,                │
│                   feature provisioning  [stub]                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ REST + JSON  (Granville JWT)
┌──────────────────────────▼──────────────────────────────────────────┐
│  Backend (apps/)                                                    │
│                                                                     │
│  api/             HTTP entrypoint, auth, RBAC, idempotency          │
│  orchestrator/    Payment lifecycle state machine                   │
│  provider-runtime/  EMI/bank adapter execution                      │
│  ledger-writer/   Formance Ledger posting gateway                   │
│  reconciler/      Provider ↔ ledger matching                        │
│  webhook-ingest/  Inbound provider webhook processor                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   Formance Ledger    EMI/Bank rails    mpcium
   (accounting)       (Airwallex        (crypto wallets —
                       mock-emi/bank)    see docs/MPCIUM_INTEGRATION.md)
```

---

## Core Principle

Granville is an orchestration-first platform built around clean boundaries:

- Granville owns lifecycle state and business decisions
- Formance Ledger owns accounting truth
- Formance Payments is an optional provider execution primitive
- provider-native behavior stays inside adapters

## Runtime Topology

```text
Customer / Operator
        |
        v
  granville-api
        |
        v
 granville-orchestrator
        |
        +----------------------+
        |                      |
        v                      v
  granville-router      granville-webhook-ingest
        |                      |
        v                      v
 granville-provider-runtime  normalized domain events
        |
        +----------------------+
        |                      |
        v                      v
 native provider adapter   formance-payments-adapter
        |                      |
        v                      v
    EMI / Bank / Rail      Formance Payments
                                   |
                                   v
                             external providers

granville-ledger-writer ----------------------> Formance Ledger
granville-reconciler <------------------------- provider state + ledger state
```

## Storage Ownership

### Granville Postgres

Granville Postgres owns:

- customers
- KYC records
- payment orders
- payment attempts
- provider bindings
- provider request and response history
- webhook durability
- idempotency
- reconciliation evidence
- audit events

### Formance Ledger

Formance Ledger owns:

- immutable double-entry postings
- balances
- accounting history
- financial transaction record

### Formance Payments

When used, Formance Payments owns only its connector runtime state:

- connector install and config state
- polling schedules
- provider task execution state
- provider webhook translation state

That state is not Granville's canonical operational record.

## Repository Boundaries

Granville-owned code belongs only in:

```text
apps/
libs/
ops/
roadmap/
third_party/
```

Upstream Formance code must not receive Granville business logic patches.

Current interim workspace:

```text
repo root                 -> current Formance Ledger checkout
vendor/formance-payments  -> current Formance Payments checkout
vendor/formance-stack     -> current Formance Stack checkout
```

Target workspace:

```text
third_party/formance-ledger
third_party/formance-payments
third_party/formance-stack
```

## Service Boundaries

### `apps/api`

- external API surface
- auth
- RBAC hooks
- idempotency header enforcement
- audit emission

### `apps/orchestrator`

- command handling
- lifecycle state
- retries
- enqueue provider work
- enqueue ledger postings

### `libs/router`

- configuration-driven routing
- provider capability checks
- fallback logic

### `apps/provider-runtime`

- outbound provider command execution
- adapter loading
- request and response persistence
- provider result normalization

### `apps/ledger-writer`

- asynchronous ledger posting
- deterministic idempotency
- Formance transaction reference persistence

### `apps/reconciler`

- provider vs internal vs ledger matching
- exception detection
- evidence capture

## Non-Negotiable Rules

- Do not expose provider-native models outside adapters.
- Do not write to Formance directly from API handlers.
- Do not process webhooks inline without persistence.
- Do not use ledger balances as legal or custodial balances.
- Do not hardcode routing policy in controllers or workers.
- Do not build custody or core banking logic into this platform.
