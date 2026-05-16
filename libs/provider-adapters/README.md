# granville-provider-adapters

This package defines the provider-neutral execution contract.

Suggested interface sketch:

```text
PaymentAccountProvider
BankRailProvider
```

Rules:

- Granville callers see `provider_binding_id`, not Formance `connectorID`
- Adapters return normalized statuses
- Provider raw payloads are stored for audit, but canonical state stays normalized

Stage 1 provider path:

- `mock-emi` is the current acceptance-test provider.
- The first real provider path is a native Granville EMI adapter behind these contracts.
- `airwallex` is wired as the first native EMI adapter key. It loads credentials from
  `AIRWALLEX_*` environment variables and can authenticate with Airwallex, but live
  money movement remains disabled until Granville's canonical payment instruction
  includes the provider-native beneficiary and payout payload mapping.
- Use the Formance Payments wrapper when the upstream connector already covers a later provider cleanly and does not leak connector-native behavior past the adapter.

Paths:

- interfaces: [interfaces/](interfaces/)
- EMI adapters: [emi/](emi/)
- bank adapters: [bank/](bank/)
- mock adapter: [mock/mock-emi-provider.ts](mock/mock-emi-provider.ts)
