# Roadmap

This folder tracks the work needed to turn the current Formance-based foundation into Granville MVP delivery.

Documents:

- [Granville Repo Implementation Roadmap](granville-repo-implementation-roadmap.md)
- [Development Milestones Review](development-milestones-review.md)
- [MVP Milestone 1](mvp-milestone-1.md)
- [MVP Milestone 2 Sketch](mvp-milestone-2-sketch.md)

Current working snapshot:

- the public site lives in `apps/branded-domain/`
- the customer portal lives in `apps/portal/` as a Vite, React, TypeScript, TanStack Router, and shadcn/ui application
- Granville platform services exist under `apps/api/`, `apps/orchestrator/`, `apps/provider-runtime/`, `apps/ledger-writer/`, `apps/reconciler/`, `apps/webhook-ingest/`, and `apps/ops-ui/`
- Milestones 1 through 3 are locally implemented for the mock EMI path, including API, orchestration, routing, provider runtime, ledger posting, webhook durability, reconciliation, and adapter boundaries
- the Granville test suite passes in memory; the next checkpoint is proving the same Stage 1 flow through a migrated local Postgres database and local API process
- the next portal step is `apps/api` integration and auth/session enforcement, not additional template import work
