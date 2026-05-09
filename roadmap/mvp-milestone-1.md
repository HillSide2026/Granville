# MVP Milestone 1

Objective:

- Stand up Granville as a provider-portable payment orchestration foundation using Formance Ledger and, where useful, Formance Payments.

Scaffolding completed in this repo:

- Granville-owned application boundaries under `apps/`
- Shared contracts and ownership boundaries under `libs/`
- Local operations wrapper under `ops/`
- Upstream version pinning in [ops/versions.lock.yaml](/Users/matthewajlevinelaw/Repos/Granville/ops/versions.lock.yaml)
- Local wrapper compose in [ops/docker-compose.local.yml](/Users/matthewajlevinelaw/Repos/Granville/ops/docker-compose.local.yml)

Remaining work to actually realize Milestone 1:

1. Workspace migration
   Move from the interim root-ledger layout to the target `third_party/formance-*` layout without losing local history or breaking CI.

2. Granville Postgres schema
   Create tables for `payment_orders`, `payment_attempts`, `provider_bindings`, `idempotency_keys`, `webhook_events`, and `reconciliation_cases`.

3. Canonical domain package
   Implement the models described in `libs/domain` and keep them independent from Formance `connectorID`.

4. Granville API
   Build the first customer-facing endpoints from `apps/api` and make them write only to Granville operational storage.

5. Orchestrator state machine
   Implement the first attempt lifecycle in `apps/orchestrator`: requested, routed, submitted, provider_pending, succeeded, failed, reversed.

6. Routing engine
   Implement configuration-driven provider selection in `apps/router`, including deterministic fallback policy.

7. Ledger writer
   Implement normalized posting templates and idempotent writes into Formance Ledger.

8. First provider path
   Choose one provider and implement the first adapter.
   If the provider is already covered well by Formance Payments, use `apps/provider-runtime/adapters/formance-payments`.
   If not, build the adapter natively in Granville.

9. Webhook ingest and replay
   Add a Granville-owned webhook event store, signature verification policy, replay tooling, and normalized event publication.

10. Reconciliation baseline
    Build API-driven reconciliation for the first provider and link provider-side transactions to Granville payment attempts and ledger effects.

11. Local and staging environments
    Wire secrets, config loading, migrations, and environment promotion rules around the wrapper compose and future deployment manifests.

12. Acceptance tests
    Add end-to-end coverage for:
    payment order creation
    routing selection
    provider execution
    ledger posting
    webhook processing
    reconciliation match

Milestone 1 exit criteria:

- One real provider path works end to end
- Ledger postings are idempotent and auditable
- Routing decisions are configuration-driven and replayable
- Provider state does not leak past the Granville adapter boundary
- Reconciliation can detect and expose mismatches
