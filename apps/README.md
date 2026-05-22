# Granville Applications

This folder is the Granville-owned application layer that sits around Formance.

Target service split:

- `api`: customer-facing API and idempotency boundary
- `portal/`: customer-facing authenticated Granville application
- `orchestrator`: payment order lifecycle and control plane
- `router`: provider and rail selection
- `provider-runtime`: provider adapter execution layer
- `ledger-writer`: normalized posting gateway into Formance Ledger
- `reconciler`: provider and ledger matching plus break management
- `ops-ui`: internal operational surface

Current state:

- `portal/` is a standalone customer-facing React application.
- `branded-domain/` contains the active public-facing marketing and legal site.
- The remaining service directories are scaffolds only.
- The root checkout is still the Formance Ledger codebase.
- `vendor/formance-payments` and `vendor/formance-stack` remain the current upstream clones until the workspace is migrated into the target shape described in [third_party/README.md](/Users/matthewajlevinelaw/Repos/Granville/third_party/README.md).
