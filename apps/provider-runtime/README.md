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
