# Decisions

This file is the Granville architectural decision log.

## ADR-001

Status: accepted

Decision:

- Granville owns orchestration, routing, reconciliation, operational persistence, and audit state.

Reason:

- these concerns must remain provider-agnostic and portable across EMI and future bank integrations

## ADR-002

Status: accepted

Decision:

- Formance Ledger is used as the accounting engine and immutable financial record only.

Reason:

- Granville needs a clean separation between operational lifecycle state and accounting truth

## ADR-003

Status: accepted

Decision:

- Formance Payments is optional infrastructure, wrapped behind Granville provider adapter contracts.

Reason:

- Formance Payments models core execution flows around `connectorID`, which Granville must not leak into its domain contracts

## ADR-004

Status: accepted

Decision:

- Granville business logic must not be implemented inside upstream Formance repositories.

Reason:

- this preserves upgradeability, keeps ownership boundaries clear, and prevents provider lock-in through upstream patches

## ADR-005

Status: accepted

Decision:

- Provider execution and ledger posting occur asynchronously through durable queues.

Reason:

- retries, replay, and auditability require persisted async boundaries

## ADR-006

Status: accepted

Decision:

- Provider-native statuses and payloads remain adapter-internal; Granville publishes canonical statuses only.

Reason:

- domain portability depends on hiding provider-specific lifecycle semantics

## ADR-007

Status: accepted

Decision:

- Granville Postgres is the operational system of record; Formance Ledger is not used as the lifecycle database.

Reason:

- orchestration, webhook durability, reconciliation evidence, and idempotency need an operational state store with mutable workflow state

## ADR-008

Status: proposed

Decision:

- migrate the current root-ledger layout into `third_party/formance-*` once Granville-owned services are stable enough to survive the move.

Reason:

- the current root still contains the upstream ledger checkout, which obscures repo ownership even after scaffolding

## ADR-009

Status: accepted

Decision:

- The next Stage 1 checkpoint is Postgres-backed local operability, not additional in-memory feature scope.

Reason:

- the mock EMI flow now passes through the Granville API, orchestrator, router, provider runtime, ledger writer, webhook ingest, reconciliation, audit, admin, and reporting surfaces
- production confidence now depends on proving the same flow with migrated operational storage and a local API process

## ADR-010

Status: accepted

Decision:

- The first real Stage 1 provider path is a native Granville EMI adapter behind the existing provider adapter boundary.
- A Formance Payments wrapper remains available as an infrastructure path when an upstream connector already covers a provider cleanly.

Reason:

- Granville must preserve provider portability and keep provider-native status, request, and identifier semantics out of its canonical contracts
- a wrapper over Formance Payments is useful infrastructure, but should not become the customer-facing orchestration model
