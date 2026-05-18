# granville-domain

Canonical models that must remain stable across EMI and future bank integrations.

## Models

| File | Exports |
|------|---------|
| `src/customer.ts` | `Customer`, `CustomerStatus`, `CustomerType` |
| `src/counterparty.ts` | `Counterparty`, `CounterpartyKind` |
| `src/provider.ts` | `Provider`, `ProviderKind`, `ProviderCapability` |
| `src/provider-binding.ts` | `ProviderBinding`, `ProviderBindingKind` |
| `src/payment-order.ts` | `PaymentOrder`, `Money`, `CanonicalPaymentStatus`, `PaymentDirection`, `PaymentTransactionType` |
| `src/payment-attempt.ts` | `PaymentAttempt` |
| `src/ledger-effect.ts` | `LedgerEffect` |
| `src/reconciliation-case.ts` | `ReconciliationCase`, `ReconciliationCaseCategory` |

## Invariants

- A `PaymentOrder` is provider-neutral
- A `PaymentAttempt` records one routing decision and one execution path
- Provider identifiers are mapped in adapter-specific storage, not leaked into the domain model
- `ProviderBinding.bindingKind` does not include `"formance_payments"` — Formance is an adapter detail
- `LedgerEffect.ledgerRef` is an opaque string — the Formance transaction ID lives in the adapter layer only

## Relationship to libs/contracts/

`libs/contracts/` remains the operational contracts layer used by existing code. `libs/domain/` is the clean canonical layer:
- No `formanceConnectorId` on `ProviderBinding`
- No `formanceTransactionId` on `LedgerEffect`
- `metadata` is `Record<string, unknown>` throughout (not narrowed to `string` values)

New code should import domain types from `libs/domain/`. Migration of existing code from `libs/contracts/` is incremental.
