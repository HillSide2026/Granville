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

Paths:

- interfaces: [interfaces/](/Users/matthewajlevinelaw/Repos/Granville/libs/provider-adapters/interfaces)
- EMI adapters: [emi/](/Users/matthewajlevinelaw/Repos/Granville/libs/provider-adapters/emi)
- bank adapters: [bank/](/Users/matthewajlevinelaw/Repos/Granville/libs/provider-adapters/bank)
- mock adapter: [mock/mock-emi-provider.ts](/Users/matthewajlevinelaw/Repos/Granville/libs/provider-adapters/mock/mock-emi-provider.ts)
