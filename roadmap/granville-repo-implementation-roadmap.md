# Granville Repo Implementation Roadmap

## Goal

Turn the current Formance-based workspace into a Granville-owned payments orchestration platform without modifying upstream Formance Ledger or Formance Payments internals.

Granville must remain:

- orchestration-first
- ledger-centric
- provider-agnostic
- EMI-led for Version 1
- bank-ready for Stage 2
- thin infrastructure, not core banking

## Architectural Rule

Do not put Granville business logic inside Formance Ledger, Formance Payments, or any upstream vendored repo.

Granville-owned code must live under:

```text
apps/
libs/
ops/
roadmap/
third_party/
```

Upstream Formance code should eventually move under:

```text
third_party/formance-ledger
third_party/formance-payments
third_party/formance-stack
```

## Current Status Snapshot

As of May 22, 2026:

- the public marketing and legal site is implemented under `apps/website/`
- the customer-facing portal is implemented under `apps/portal/` as a Vite, React, TypeScript, TanStack Router, and shadcn/ui application
- the portal (Track 1 complete 2026-05-30) includes: Dashboard, Budgets, Wallets (mpcium stub), Balances, Payments (outbound), Sales (inbound), FX (access-request state), Settings; operator features (Compliance, Approvals, Cards) removed from the customer portal — see [roadmap/portal-roadmap.md](portal-roadmap.md)
- the mock EMI Version 1 flow is implemented through Granville-owned API, orchestration, routing, provider runtime, ledger writer, webhook processing, reconciliation, audit, admin operations, and reporting boundaries
- provider adapter contracts exist for mock EMI, mock bank, native EMI, Airwallex, and Formance Payments wrapper paths
- `npm run test:granville` passes in local memory-backed execution

This means the repo has moved beyond scaffold-only status. The next proof point is local operability: run the migrated Postgres schema, seed provider bindings, point the API/tests at that database, and prove the same Version 1 flow outside the in-memory store.

Current unblocked work:

- prove Postgres-backed Version 1 acceptance with `DATABASE_URL`, `npm run db:migrate`, and `TEST_DATABASE_URL`
- wire `apps/portal` read paths to `apps/api`
- harden provider runtime failure paths around retries, dead-letter handling, disabled providers, and duplicate provider references
- finish Airwallex canonical payment metadata mapping and add env-gated sandbox tests
- publish the rebased local branch once the desired checkpoint is complete

## Phase 0 — Repo Boundary Cleanup

Objective:

- make the repository clearly Granville-owned

Tasks:

- keep current additive scaffold intact
- do not patch Formance internals
- add root-level `README.md`
- add root-level `ARCHITECTURE.md`
- add root-level `DECISIONS.md`
- add `/docs` index if missing

Deliverables:

- `README.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `docs/`

## Phase 1 — Operational Database Core

Objective:

- create Granville's operational state model in PostgreSQL

Tables:

- `customers`
- `kyc_records`
- `payment_accounts`
- `payment_orders`
- `payment_attempts`
- `provider_bindings`
- `provider_accounts`
- `provider_transactions`
- `webhook_events`
- `webhook_processing_attempts`
- `internal_transactions`
- `ledger_posting_queue`
- `ledger_posting_attempts`
- `reconciliation_runs`
- `reconciliation_records`
- `reconciliation_exceptions`
- `audit_events`
- `idempotency_keys`
- `routing_rules`
- `providers`
- `provider_capabilities`

Principles:

Postgres owns:

- lifecycle state
- orchestration state
- idempotency
- provider request history
- webhook durability
- reconciliation evidence

Formance owns:

- immutable double-entry postings
- accounting mirror
- financial transaction record

Deliverables:

- `libs/db/`
- `libs/db/migrations/`
- `libs/db/schema/`
- `libs/db/README.md`

## Phase 2 — Shared Domain Contracts

Objective:

- define canonical Granville models before implementing providers

Files:

- `libs/contracts/customer.ts`
- `libs/contracts/kyc.ts`
- `libs/contracts/payment.ts`
- `libs/contracts/account.ts`
- `libs/contracts/provider.ts`
- `libs/contracts/routing.ts`
- `libs/contracts/ledger.ts`
- `libs/contracts/reconciliation.ts`
- `libs/contracts/events.ts`

Required rules:

- no provider-native enums in domain contracts
- use Granville canonical statuses only
- provider-specific statuses must be mapped inside adapters

Canonical payment statuses:

- `created`
- `pending_review`
- `submitted_to_provider`
- `provider_accepted`
- `processing`
- `completed`
- `failed`
- `returned`
- `cancelled`

Deliverables:

- `libs/contracts/`
- `libs/contracts/README.md`

## Phase 3 — Provider Adapter Interface

Objective:

- create the stable adapter boundary for EMI and future bank integrations

Files:

- `libs/provider-adapters/`
- `libs/provider-adapters/interfaces/`
- `libs/provider-adapters/emi/`
- `libs/provider-adapters/bank/`
- `libs/provider-adapters/mock/`

Core EMI interface:

```ts
export interface PaymentAccountProvider {
  createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer>;
  openPaymentAccount(input: OpenAccountInput): Promise<ProviderAccount>;
  getAccount(accountId: string): Promise<ProviderAccount>;
  initiatePayment(input: PaymentInstruction): Promise<ProviderPaymentResult>;
  getTransaction(transactionId: string): Promise<ProviderTransaction>;
  listTransactions(accountId: string, from: Date, to: Date): Promise<ProviderTransaction[]>;
  getBalance(accountId: string): Promise<ProviderBalance>;
}
```

Future bank interface:

```ts
export interface BankRailProvider {
  createBeneficiary(input: BeneficiaryInput): Promise<BankBeneficiary>;
  initiatePayment(input: BankPaymentInstruction): Promise<BankPaymentResult>;
  getPaymentStatus(paymentId: string): Promise<BankPaymentStatus>;
  listTransactions(accountId: string, from: Date, to: Date): Promise<BankTransaction[]>;
  getStatement(accountId: string, from: Date, to: Date): Promise<BankStatement>;
}
```

Deliverables:

- `libs/provider-adapters/interfaces/`
- `libs/provider-adapters/mock/`

## Phase 4 — Granville API Service

Objective:

- create the first Granville-owned API service

Path:

- `apps/api/`

Recommended stack:

- NestJS
- PostgreSQL
- OpenAPI
- JWT auth stub
- RBAC middleware stub
- `Idempotency-Key` support

Initial APIs:

- `POST /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `POST /payment-accounts`
- `GET /payment-accounts/:id`
- `POST /payments`
- `GET /payments/:id`
- `GET /payments/:id/status`
- `POST /webhooks/:provider`
- `POST /reconciliation/runs`
- `GET /reconciliation/runs/:id`
- `GET /reconciliation/exceptions`
- `GET /admin/audit-events`

Required controls:

- persist audit event for every write
- enforce idempotency on POST endpoints
- never call provider directly from controller
- controllers call orchestration service only

Deliverables:

- `apps/api/`
- `apps/api/src/`
- `apps/api/openapi.yaml`
- `apps/api/README.md`

## Phase 5 — Orchestration Service

Objective:

- implement the command lifecycle for customers, accounts, and payments

Path:

- `apps/orchestrator/`

Responsibilities:

- validate commands
- persist operational state
- invoke routing decisions
- enqueue provider work
- enqueue ledger postings
- emit audit events
- handle retries safely

Must not contain:

- provider-native request construction
- ledger transport details
- webhook parsing logic
- reconciliation matching logic

Initial commands:

- `CreateCustomerCommand`
- `OpenPaymentAccountCommand`
- `CreatePaymentCommand`
- `SubmitPaymentCommand`
- `CancelPaymentCommand`

Deliverables:

- `apps/orchestrator/`
- `apps/orchestrator/src/commands/`
- `apps/orchestrator/src/state-machines/`

## Phase 6 — Routing Layer

Objective:

- make provider selection config-driven from the start

Path:

- `libs/router/`

Version 1 behavior:

- all payment activity routes to the EMI provider

Post-Version 1 readiness:

- support routing by currency, country, rail, transaction type, customer segment, amount, provider health, provider capability, and risk flag

Deliverables:

- `libs/router/`
- `libs/router/routing-engine.ts`
- `libs/router/provider-capabilities.ts`
- `libs/router/README.md`

## Phase 7 — Provider Runtime Worker

Objective:

- execute outbound provider calls asynchronously

Path:

- `apps/provider-runtime/`

Responsibilities:

- consume provider command queue
- load provider binding
- call selected adapter
- persist outbound request and response
- normalize provider result
- update payment attempt state
- emit domain events

Required safety:

- retry with backoff
- dead-letter failed jobs
- idempotency with provider reference
- no direct ledger writes

Deliverables:

- `apps/provider-runtime/`
- `apps/provider-runtime/src/workers/`
- `apps/provider-runtime/src/adapters/`

## Phase 8 — Ledger Writer

Objective:

- write normalized postings into Formance Ledger through an async boundary

Paths:

- `apps/ledger-writer/`
- `libs/ledger/`

Responsibilities:

- consume `ledger_posting_queue`
- create deterministic Formance transactions
- persist Formance transaction IDs
- retry safely
- support replay
- produce `ledger.posted` events

Canonical account taxonomy:

- `customers:{customer_id}:available`
- `customers:{customer_id}:pending`
- `providers:emi:{emi_id}:clearing`
- `providers:emi:{emi_id}:settlement`
- `granville:fees:earned`
- `granville:fees:receivable`
- `exceptions:reconciliation`

Important rule:

- ledger descriptions must not imply Granville custody of funds

Deliverables:

- `apps/ledger-writer/`
- `libs/ledger/`
- `libs/ledger/account-taxonomy.md`

## Phase 9 — Webhook Ingestion

Objective:

- make provider webhooks durable, replayable, and idempotent

Path:

- `apps/webhook-ingest/`

Initial implementation option:

- implement as a module inside `apps/api` first

Flow:

- receive webhook
- store raw payload
- validate signature
- check idempotency
- persist webhook event
- queue processing
- normalize provider event
- update operational state
- emit audit and domain events

Deliverables:

- `apps/webhook-ingest/`
- `libs/webhooks/`

## Phase 10 — Reconciliation Engine

Objective:

- compare Granville state, provider state, and Formance ledger state

Paths:

- `apps/reconciler/`
- `libs/reconciliation/`

Reconciliation types:

- transaction-level
- balance
- settlement
- fee
- exception

Matching rules:

Primary:

- `provider_reference`

Secondary:

- amount
- currency
- payment_account_id
- timestamp_window

Exception categories:

- `missing_provider_transaction`
- `missing_internal_transaction`
- `amount_mismatch`
- `currency_mismatch`
- `status_mismatch`
- `duplicate_provider_reference`
- `stale_pending_transaction`
- `ledger_posting_missing`

Deliverables:

- `apps/reconciler/`
- `libs/reconciliation/`

## Phase 11 — Admin + Reporting Foundation

Objective:

- expose operational visibility without building a heavy banking console

Paths:

- `apps/admin-api/`

Alternative:

- deliver early admin modules under `apps/api`

Required views:

- customers
- payment accounts
- payments
- payment attempts
- provider transactions
- webhook events
- ledger postings
- reconciliation exceptions
- audit events

Required actions:

- retry webhook
- retry ledger posting
- resolve reconciliation exception
- disable provider
- override routing rule
- add manual note

Every privileged action must create an audit event.

## Phase 12 — Observability and Ops

Objective:

- make the platform operable

Paths:

- `ops/docker-compose.local.yml`
- `ops/env.example`
- `ops/terraform/`
- `ops/observability/`
- `ops/runbooks/`

Metrics:

- `api_error_rate`
- `provider_api_latency`
- `payment_failure_rate`
- `webhook_failure_count`
- `queue_backlog`
- `ledger_posting_failures`
- `reconciliation_exception_count`
- `provider_outage_status`

Runbooks:

- `provider-outage.md`
- `webhook-replay.md`
- `ledger-writer-failure.md`
- `reconciliation-exception.md`
- `payment-stuck-processing.md`

## Granville MVP Acceptance Test

Create one end-to-end test proving:

- create customer
- approve or mock KYC
- create EMI customer
- open EMI payment account
- initiate payment
- submit through mock EMI adapter
- receive provider status
- post ledger entries
- run reconciliation
- generate audit events

Deliverable:

- `tests/e2e/stage1-payment-flow.spec.ts`

## Non-Negotiable Constraints

- do not modify upstream Formance internals
- do not build custody logic
- do not expose provider-native models outside adapters
- do not write to Formance directly from API handlers
- do not process webhooks inline without persistence
- do not hardcode routing logic
- do not treat ledger balances as legal or custodial balances
- do not skip idempotency
- do not skip audit events
- do not design this as a core banking platform

## Suggested Implementation Order

1. docs and repo boundary
2. database migrations
3. shared contracts
4. provider adapter interfaces
5. API skeleton
6. orchestrator state machines
7. routing engine
8. mock EMI adapter
9. provider runtime worker
10. ledger writer
11. webhook ingest
12. reconciliation engine
13. admin and reporting endpoints
14. end-to-end acceptance test
15. ops runbooks

## Definition of Done for Milestone 1

Milestone 1 is done when the repo supports one full mock EMI payment flow:

```text
Granville API
  -> Orchestrator
  -> Router
  -> Mock EMI Adapter
  -> Provider Runtime
  -> Ledger Writer
  -> Formance Ledger
  -> Reconciler
  -> Audit/Event Trail
```

With:

- Postgres operational state
- idempotent payment creation
- durable webhook ingestion
- async ledger posting
- reconciliation exception generation
- admin-readable audit trail
