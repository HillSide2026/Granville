# Development Milestones Review

## Recommendation

Yes. The 10-milestone structure is helpful for the roadmap.

It is a better delivery view than the lower-level phase list because it groups implementation work into milestones that are easier to staff, track, and sequence across engineering, compliance, and operations.

Recommended use:

- keep [granville-repo-implementation-roadmap.md](/Users/matthewajlevinelaw/Repos/Granville/roadmap/granville-repo-implementation-roadmap.md) as the detailed build plan
- use this 10-milestone structure as the program-level execution roadmap

## Strong Parts

The milestone set is especially strong in five ways:

1. It starts with repo control and operational discipline instead of jumping straight into API code.
2. It keeps Granville's operational database and canonical contracts ahead of provider implementation.
3. It preserves the critical async boundaries: provider runtime, ledger writer, webhook durability, and reconciliation.
4. It keeps Formance in the infrastructure role instead of turning it into the Granville application layer.
5. It ends with production hardening instead of pretending an integration demo is production-ready.

## Recommended Adjustments

The structure is good, but I recommend these specific edits before calling it final.

### 1. Keep Milestone 0, but split “repo boots locally” from “CI passes”

Why:

- local topology validation belongs in Milestone 0
- full CI pass criteria may depend on application code that does not exist yet

Recommendation:

- Milestone 0 acceptance should require:
  - repo structure exists
  - docs exist
  - local wrapper compose validates
  - linting and CI skeleton exist
- full end-to-end CI success should mature over Milestones 2 through 5

### 2. Narrow Milestone 1 state-machine scope

Why:

- customer, KYC, and payment state machines belong in the operational core
- reconciliation lifecycle should be modeled in Milestone 1, but the real reconciliation engine arrives much later

Recommendation:

- keep reconciliation statuses and persistence in Milestone 1
- move full reconciliation state machine behavior into Milestone 6

### 3. Add `provider_bindings` and `provider_accounts` explicitly to Milestone 1 deliverables

Why:

- they are essential to keeping provider identity separate from Granville domain identity
- they are already part of the operational schema scaffold in [libs/db/migrations/0001_granville_operational_core.sql](/Users/matthewajlevinelaw/Repos/Granville/libs/db/migrations/0001_granville_operational_core.sql:74)

Recommendation:

- treat them as first-class Milestone 1 objects, not optional details

### 4. Expand Milestone 4 account taxonomy slightly

Why:

- the proposed taxonomy is directionally right, but it is missing the settlement view that will matter for EMI-backed flows

Recommendation:

- keep:
  - `customers:{id}:available`
  - `customers:{id}:pending`
  - `providers:emi:{id}:clearing`
  - `granville:fees:earned`
  - `exceptions:reconciliation`
- add:
  - `providers:emi:{id}:settlement`

### 5. Treat Milestone 8 as optional to Stage 1 launch unless compliance timing forces it

Why:

- reporting and audit export support are valuable
- but if Stage 1 is focused on one EMI-backed production path, Milestone 8 can partially overlap Milestone 7 and Milestone 9

Recommendation:

- keep Milestone 8 in the roadmap
- allow some of its reporting scope to be reduced or merged if launch timing requires it

## Suggested Mapping To Current Detailed Roadmap

### Milestone 0 — Foundation & Repo Control

Maps to:

- detailed roadmap Phase 0
- parts of Phase 12

### Milestone 1 — Operational Core

Maps to:

- detailed roadmap Phase 1
- detailed roadmap Phase 2
- persistence aspects of Phase 5

### Milestone 2 — API + Orchestration Layer

Maps to:

- detailed roadmap Phase 4
- detailed roadmap Phase 5

### Milestone 3 — EMI Adapter + Provider Runtime

Maps to:

- detailed roadmap Phase 3
- detailed roadmap Phase 7

### Milestone 4 — Ledger Integration

Maps to:

- detailed roadmap Phase 8

### Milestone 5 — Webhooks + Event Durability

Maps to:

- detailed roadmap Phase 9
- event durability pieces of Phase 7

### Milestone 6 — Reconciliation Engine

Maps to:

- detailed roadmap Phase 10

### Milestone 7 — Admin + Operations Console

Maps to:

- detailed roadmap Phase 11

### Milestone 8 — Reporting + Compliance Support

Maps to:

- later-stage slices of Phase 11 and Phase 12

### Milestone 9 — Stage 1 Production Readiness

Maps to:

- detailed roadmap Phase 12
- final Milestone 1 acceptance and go-live readiness

## Recommended Final Judgment

These milestones are helpful and should be adopted as the roadmap's milestone layer.

My recommendation is:

- accept the milestone structure
- apply the five scope adjustments above
- use the phase roadmap for implementation detail
- use the milestone roadmap for planning, staffing, and progress reporting

## Working Definition Of Milestone 1

For planning clarity, the earliest meaningful platform completion remains:

```text
Granville API
  -> Orchestrator
  -> Router
  -> Mock EMI Adapter
  -> Provider Runtime
  -> Ledger Writer
  -> Formance Ledger
  -> Reconciler
  -> Audit/Event Trail
```

That path still depends most directly on Milestones 1 through 6, with Milestones 7 through 9 hardening it into something operationally usable.
