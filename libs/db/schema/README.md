# Granville Operational Schema

This directory documents the operational schema that backs Granville's orchestration layer.

## Table Groups

Provider and routing control:

- `providers`
- `provider_capabilities`
- `provider_bindings`
- `routing_rules`

Customer and account lifecycle:

- `customers`
- `kyc_records`
- `payment_accounts`
- `provider_accounts`

Payment execution lifecycle:

- `payment_orders`
- `payment_attempts`
- `provider_transactions`
- `internal_transactions`

Webhook durability:

- `webhook_events`
- `webhook_processing_attempts`

Ledger posting boundary:

- `ledger_posting_queue`
- `ledger_posting_attempts`

Reconciliation:

- `reconciliation_runs`
- `reconciliation_records`
- `reconciliation_exceptions`

Cross-cutting controls:

- `idempotency_keys`
- `audit_events`

## Ownership Rules

- These tables store mutable operational state and evidence.
- They do not replace Formance Ledger postings.
- Financial balances remain derived from Formance Ledger, not from operational tables.

## Key Design Choices

- `payment_orders` and `payment_attempts` use Granville canonical statuses only.
- `provider_transactions` preserve provider-native transaction identity without leaking provider-native status enums into the domain contract layer.
- `webhook_events` store raw request bodies before processing.
- `ledger_posting_queue` provides the async boundary between orchestration and Formance Ledger.
