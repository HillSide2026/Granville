# granville-provider-runtime

Purpose:

- Present a Granville-owned provider adapter boundary
- Hide provider-specific and Formance-specific execution details from the rest of the application
- Normalize execution results and inbound webhook events

Adapter families:

- `adapters/formance-payments`: wraps Formance Payments when an upstream connector is good enough
- `adapters/native-bank`: native Granville adapter path for direct-bank integrations and provider-specific flows that should not live in Formance

Rule:

- Upstream layers consume Granville contracts from `libs/provider-adapters`
- Upstream layers do not see Formance `connectorID`

Milestone 1 implementation:

- `src/provider-runtime.ts` executes routed payment attempts against the mock EMI adapter.
- Provider-native statuses are mapped into Granville canonical payment statuses before they leave the runtime.
- Completed provider results enqueue normalized ledger postings instead of writing directly to Formance.

Milestone 3 implementation:

- Provider work is queued through `provider_command_queue`.
- `src/provider-runtime.ts` claims queued commands and records provider request attempts.
- Adapter selection goes through `libs/provider-adapters/adapter-registry.ts` using `provider_bindings.adapter_key`.
- Webhook payloads are normalized by `libs/provider-adapters/webhook-normalizer.ts`.
