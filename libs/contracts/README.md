# granville-contracts

This package defines Granville's canonical domain contracts.

Rules:

- no provider-native enums in domain contracts
- canonical payment statuses only
- provider-specific lifecycle states must be mapped inside adapters

Status source of truth:

- [payment.ts](/Users/matthewajlevinelaw/Repos/Granville/libs/contracts/payment.ts)

These contracts are intended to be imported by:

- `apps/api`
- `apps/orchestrator`
- `apps/provider-runtime`
- `apps/reconciler`
- `libs/provider-adapters`
