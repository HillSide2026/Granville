# Granville Ledger Account Taxonomy

Granville uses Formance Ledger as an immutable accounting mirror. Ledger balances are not legal custody balances and must not be presented as proof that Granville holds customer funds.

## Accounts

- `customers:{id}:available`
  Customer-facing available balance mirror.

- `customers:{id}:pending`
  Amounts reserved while a provider payment is in flight.

- `providers:emi:{id}:clearing`
  Provider-side clearing mirror for submitted and completed payment activity.

- `providers:emi:{id}:settlement`
  Provider-side settlement mirror for settled or returned funds.

- `granville:fees:earned`
  Earned fee accounting mirror.

- `granville:fees:receivable`
  Fee receivable accounting mirror before collection or settlement.

- `exceptions:reconciliation`
  Suspense-style mirror used only to surface reconciliation breaks.

## Rules

- API controllers and orchestrators never write directly to Formance.
- Every ledger write must pass through `apps/ledger-writer`.
- Every posting request must have a deterministic idempotency key.
- Descriptions must say "accounting mirror" and must not imply Granville custody.
