# formance-payments-adapter

This adapter wraps the Formance Payments API instead of exposing it directly to Granville callers.

Why this exists:

- Formance Payments requires `connectorID` in core execution flows such as payment initiation creation in [vendor/formance-payments/internal/api/v3/handler_payment_initiations_create.go](/Users/matthewajlevinelaw/Repos/Granville/vendor/formance-payments/internal/api/v3/handler_payment_initiations_create.go:20).
- Formance webhook ingress is also `connectorID`-scoped in [vendor/formance-payments/internal/api/v3/router.go](/Users/matthewajlevinelaw/Repos/Granville/vendor/formance-payments/internal/api/v3/router.go:19).
- Granville needs a provider-neutral contract.

Responsibilities:

- Maintain Granville `provider_binding` to Formance `connectorID` mapping
- Translate Granville execution requests into Formance Payments v3 calls
- Translate Formance webhook and task status back into Granville events
- Keep Formance connector state outside Granville's public API

Do not put here:

- Routing policy
- Customer-facing API logic
- Canonical payment order state machine
- Ledger account model
