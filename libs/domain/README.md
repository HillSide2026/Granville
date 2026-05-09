# granville-domain

Canonical models that must remain stable across EMI and future bank integrations:

- `customer`
- `counterparty`
- `provider`
- `provider_binding`
- `payment_order`
- `payment_attempt`
- `ledger_effect`
- `reconciliation_case`

Required invariants:

- A `payment_order` is provider-neutral
- A `payment_attempt` records one routing decision and one execution path
- Provider identifiers are mapped in adapter-specific storage, not leaked into the domain model
