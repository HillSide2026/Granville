# Granville Roadmap

Granville ships in three sequential releases:

1. **Airwallex MVP** proves the first payment rail.
2. **Granville MVP** turns that proof into a usable product/platform.
3. **Version 1** hardens the system into broader provider-ready financial infrastructure.

See [portal-roadmap.md](portal-roadmap.md) for the customer portal and operator console build-out (Tracks 1–4). See [product-surface-separation.md](product-surface-separation.md) for the workplan that defines and enforces the boundary between `apps/portal` and `apps/ops-ui`.

## Release Glossary

| Release | Meaning | Primary docs |
|---|---|---|
| Airwallex MVP | First-provider proof. Validates one external payment rail end to end before broadening the platform. | [mvp-airwallex.md](mvp-airwallex.md) |
| Granville MVP | Product/platform milestone. Wraps the proven Airwallex rail in persistent, repeatable Granville workflows. | [mvp-platform.md](mvp-platform.md), [mvp-design-system.md](mvp-design-system.md), [portal-roadmap.md](portal-roadmap.md) |
| Version 1 | Hardened, broader release. Moves beyond Airwallex MVP into provider-ready financial infrastructure. | [stage1-overview.md](stage1-overview.md) |

## Dependency Chain

Airwallex MVP blocks Granville MVP because the product/platform milestone depends on a proven first provider path.

Granville MVP blocks Version 1 because the hardened release assumes staging readiness, persistence, operator workflows, reporting, and durable event handling are already in place.

Version 1 includes the multi-provider and EMI-readiness work: resilience, stronger approvals, incident recovery, monitoring, data protection, provider abstraction, and second-provider readiness.

---

## Airwallex MVP — First-Provider Proof

Airwallex MVP proves the first external payment rail end to end. See [mvp-airwallex.md](mvp-airwallex.md) for the provider-specific plan.

**Exit criterion:** one Airwallex sandbox payment completes end to end: Granville API request → Airwallex transfer → `PAID` webhook → completed payment → ledger posting → basic reconciliation/audit evidence.

| Milestone | Objective | Status | Doc |
|---|---|---|---|
| AW1 | Sandbox integration | Complete | [mvp-airwallex.md](mvp-airwallex.md) |
| AW2 | Production readiness | In progress — webhook endpoint and compliance review outstanding | [mvp-airwallex.md](mvp-airwallex.md) |
| AW3 | Go-live | Planned — blocked on AW2 + Granville MVP staging readiness | [mvp-airwallex.md](mvp-airwallex.md) |

---

## Granville MVP — Product/Platform Milestone

Granville MVP wraps the proven first provider in the minimum complete Granville platform: persistence, orchestration, portal/operator workflows, reporting, durable events, and staging readiness.

| Track | Doc |
|---|---|
| Platform (M0–M9) | [mvp-platform.md](mvp-platform.md) |
| Design System (DS1–DS2d) | [mvp-design-system.md](mvp-design-system.md) |
| Portal and operator console | [portal-roadmap.md](portal-roadmap.md) |
| Product surface separation | [product-surface-separation.md](product-surface-separation.md) |

**Exit criterion:** the core payment workflow can be run repeatedly in a staging-like environment with Postgres persistence, portal/operator workflows, reporting, durable events, and Airwallex configured as the first provider.

---

## Version 1 — Hardened Provider-Ready Infrastructure

Version 1 follows Granville MVP. Four tracks run in parallel. See [stage1-overview.md](stage1-overview.md) for the full objective and exit criteria.

| Milestone | Objective | Status | Doc |
|---|---|---|---|
| FI1 | Ledger & Payment State Machine | **Complete (V1)** — real Formance integration implemented; set `FORMANCE_LEDGER_URL` to activate | [milestone-fi1.md](milestone-fi1.md) |
| FI4 | Balance & Settlement Reconciliation | **Complete (V1)** — automated reconciliation + aging pass scheduled in server | [milestone-fi4.md](milestone-fi4.md) |
| FI5 | Audit Trail & Traceability | Partial — event capture done; state diffs, approval chain, operator context pending | [milestone-fi5.md](milestone-fi5.md) |
| MP1 | EMI Provider Integration | Partial — AW1 done; AW2 in progress; second provider parked | [milestone-mp1.md](milestone-mp1.md) |
| MP4 | Provider Resilience & Failover | Architecture demonstrated — primitives done; circuit breaker parked | [milestone-mp4.md](milestone-mp4.md) |
| MP5 | Multi-Provider Production Readiness | Parked — second provider not in V1 scope | [milestone-mp5.md](milestone-mp5.md) |
| OG1 | Access Control & Approval Workflows | Partial — enforcement + endpoints done; institutional roles + maker/checker parked | [milestone-og1.md](milestone-og1.md) |
| OG4 | Incident & Recovery Operations | **Complete (V1)** — runbooks complete including backup/recovery | [milestone-og4.md](milestone-og4.md) |
| OG5 | Operational Monitoring & Alerting | Architecture demonstrated — metrics endpoint exists; OTEL-ready | [milestone-og5.md](milestone-og5.md) |
| PS1 | Durable Event Infrastructure | **Complete (V1)** — Postgres-backed queues + startup crash recovery | [milestone-ps1.md](milestone-ps1.md) |
| PS3 | Environment & Secrets Management | **Complete (V1)** — no hardcoded secrets; env.example complete | [milestone-ps3.md](milestone-ps3.md) |
| PS4 | Data Protection & Recovery | **Complete (V1)** — backup/recovery procedure documented | [milestone-ps4.md](milestone-ps4.md) |

---

## Current Priority

### Now — Airwallex MVP And Required Granville MVP Blockers

| Priority | Track | Task |
|---|---|---|
| 1 | Airwallex MVP | **AW2 webhook endpoint** — register a public HTTPS endpoint in the Airwallex sandbox portal (use ngrok or staging deploy) |
| 2 | Airwallex MVP | **AW2 balance API scope** — add Balances read scope to the sandbox API key in the Airwallex portal |
| 3 | Airwallex MVP | **AW2 compliance review** — outbound payment flow document for legal/compliance sign-off |
| 4 | Granville MVP | ~~**M1 Postgres checkpoint**~~ — **Done.** 123/123 tests pass against live Postgres. |

### Next — Granville MVP Completion

| Priority | Track | Task |
|---|---|---|
| 1 | Design | **DS2b** — confirm button shape rule, fix unlabeled CardTitle sizes, fix `text-[1.3rem]`, audit sentence case on CTAs |
| 2 | Design | **DS2c** — replace template copy on marketing site with institutional voice |
| 3 | Design | **DS2d** — audit and fix icon usage against the Tabler/institutional governance rule |
| 4 | Granville MVP | **M7 ops-ui approvals** — wire `apps/ops-ui` approvals queue to `POST /payments/:id/approve` and `reject` (moved from customer portal — operators approve, customers submit) |

### Later — Version 1 Remaining

| Priority | Track | Task |
|---|---|---|
| 1 | Version 1 | **AW3 go-live** — the only remaining pre-sale required item after AW2 |
| 2 | Version 1 | Activate real Formance Ledger — set `FORMANCE_LEDGER_URL` after AW3 staging environment is up |

### Blocked

| Item | Blocked by |
|---|---|
| M4 real Formance Ledger proof | ~~M1 Postgres~~ AW2 (M1 now done) |
| Granville MVP M9 staging environment | ~~M1 Postgres~~ + AW2 + M7 + M8 |
| AW3 go-live | AW2 + Granville MVP M9 staging readiness |

---

## M1 Postgres Checkpoint

**Complete.** 123/123 tests pass against live Postgres. M1 is no longer a blocker.

```sh
# Requires Docker Desktop running
docker compose -f ops/docker-compose.local.yml --profile granville up -d granville-postgres

export DATABASE_URL=postgres://granville:granville@localhost:5433/granville?sslmode=disable
npm run db:migrate

export TEST_DATABASE_URL=$DATABASE_URL
npm run test:granville
```

---

## AW2 Webhook Certification (Next Provider Step)

See [mvp-airwallex.md](mvp-airwallex.md#concrete-next-steps) for the full Airwallex MVP action checklist.

After registering a public webhook endpoint:

1. Create a sandbox payment via the Granville API
2. Wait for Airwallex to deliver the `PAID` event
3. Confirm via API response or ops-ui (once built): `signatureValid=true`, payment → `completed`, ledger posting → `posted`
4. All code is already in place — this step is environment configuration only

---

## Repository Layout

```
apps/
  api/                  Granville API service (HTTP controllers + GranvilleApi)
  orchestrator/         Payment orchestration and state machines
  provider-runtime/     Async provider execution worker
  ledger-writer/        Async Formance ledger posting
  webhook-ingest/       Durable webhook ingestion
  reconciler/           Reconciliation engine
  ops-ui/               Internal operator console (React/Vite/Shadcn — stub)
  portal/               End-customer portal — Budgets, Payments, Sales, Wallets, Balances, FX (React/Vite/Shadcn)
  website/              Public Granville Finance marketing site (Astro)

libs/
  brand/                Shared design system tokens and brand spec
  contracts/            Canonical domain models (customer, payment, provider, etc.)
  db/                   Postgres migrations and schema
  persistence/          InMemoryGranvilleStore + PostgresGranvilleStore
  provider-adapters/    Adapter interfaces, mock implementations, Airwallex adapter
  router/               Routing engine (capability match + rule priority)
  ledger-postings/      Deterministic Formance posting templates
  reporting/            ReportEngine (payment history, settlement, audit export, metrics)

ops/
  docker-compose.local.yml
  env.example
  runbooks/             Operational runbooks (mostly pending)
  observability/        OTEL / Prometheus stubs

test/granville/         101 test files covering all platform milestones
scripts/                Airwallex probe scripts
roadmap/                This directory
```

---

## Reference Documents

| File | Purpose |
|---|---|
| [granville-repo-implementation-roadmap.md](granville-repo-implementation-roadmap.md) | Detailed phase-by-phase build plan and architectural rules |
| [development-milestones-review.md](development-milestones-review.md) | Milestone structure rationale and recommended scope adjustments |
| [backlog-airwallex-to-rapyd.md](backlog-airwallex-to-rapyd.md) | **Backlog:** strip Airwallex integration, pivot first payment rail to Rapyd |
