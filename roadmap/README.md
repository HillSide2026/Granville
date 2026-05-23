# Granville Roadmap

Two phases: MVP establishes a working payment platform through a single provider. Stage 1 hardens it into deterministic, replay-safe, multi-provider financial infrastructure suitable for EMI onboarding.

---

## Stage 1 — EMI-Compatible Financial Operations Infrastructure

Stage 1 begins after MVP. Four tracks run in parallel. See [stage1-overview.md](stage1-overview.md) for the full objective and exit criteria.

| Milestone | Objective | Status | Doc |
|---|---|---|---|
| FI1 | Ledger & Payment State Machine | Partial — core done; real Formance, canonical states, reversal flow pending | [milestone-fi1.md](milestone-fi1.md) |
| FI4 | Balance & Settlement Reconciliation | Partial — transaction-level done; automated + balance-level pending | [milestone-fi4.md](milestone-fi4.md) |
| FI5 | Audit Trail & Traceability | Partial — event capture done; state diffs, approval chain, operator context pending | [milestone-fi5.md](milestone-fi5.md) |
| MP1 | EMI Provider Integration | Partial — AW1 done; AW2 in progress; second provider not started | [milestone-mp1.md](milestone-mp1.md) |
| MP4 | Provider Resilience & Failover | Partial — primitives done; circuit breaker + mid-flight failover pending | [milestone-mp4.md](milestone-mp4.md) |
| MP5 | Multi-Provider Production Readiness | Not started — blocked on MP1 + M9 | [milestone-mp5.md](milestone-mp5.md) |
| OG1 | Access Control & Approval Workflows | Partial — enforcement + endpoints done; institutional roles + maker/checker pending | [milestone-og1.md](milestone-og1.md) |
| OG4 | Incident & Recovery Operations | Partial — retry tooling done; rollback + formal incidents pending | [milestone-og4.md](milestone-og4.md) |
| OG5 | Operational Monitoring & Alerting | Not started — metrics endpoint exists; no automated alerting | [milestone-og5.md](milestone-og5.md) |
| PS1 | Durable Event Infrastructure | Partial — in-memory durability done; persistence blocked on M1 | [milestone-ps1.md](milestone-ps1.md) |
| PS3 | Environment & Secrets Management | Not started | [milestone-ps3.md](milestone-ps3.md) |
| PS4 | Data Protection & Recovery | Not started — blocked on M1 | [milestone-ps4.md](milestone-ps4.md) |

---

## MVP — Foundation

| Track | Doc |
|---|---|
| Platform (M0–M9) | [mvp-platform.md](mvp-platform.md) |
| Airwallex (AW1–AW3) | [mvp-airwallex.md](mvp-airwallex.md) |
| Design System (DS1–DS2d) | [mvp-design-system.md](mvp-design-system.md) |

---

## Current Priority

### Actionable Now (no external dependencies)

| Priority | Track | Task |
|---|---|---|
| 1 | Platform | **M1 Postgres checkpoint** — start Docker, `npm run db:migrate`, `TEST_DATABASE_URL`, `npm run test:granville`. This is the primary platform blocker. |
| 2 | Design | **DS2b** — confirm button shape rule, fix unlabeled CardTitle sizes, fix `text-[1.3rem]`, audit sentence case on CTAs |
| 3 | Design | **DS2c** — replace template copy on marketing site with institutional voice |
| 4 | Design | **DS2d** — audit and fix icon usage against the Tabler/institutional governance rule |
| 5 | Platform | **M7 portal approvals** — wire portal `/approvals` to `POST /payments/:id/approve` and `reject` |

### Requires External Action

| Priority | Track | Task | Who |
|---|---|---|---|
| 1 | Provider | **AW2 webhook endpoint** — register a public HTTPS endpoint in the Airwallex sandbox portal (use ngrok or staging deploy) | Matthew |
| 2 | Provider | **AW2 balance API scope** — add Balances read scope to the sandbox API key in the Airwallex portal | Matthew |
| 3 | Provider | **AW2 compliance review** — outbound payment flow document for legal/compliance sign-off | Matthew + legal |

### Blocked

| Item | Blocked by |
|---|---|
| M4 real Formance Ledger proof | M1 Postgres |
| M9 staging environment | M1 Postgres + AW2 + M7 + M8 |
| AW3 go-live | AW2 + M9 |

---

## M1 Postgres Checkpoint

The single most important next action. Run this:

```sh
# Requires Docker Desktop running
docker compose -f ops/docker-compose.local.yml --profile granville up -d granville-postgres

export DATABASE_URL=postgres://granville:granville@localhost:5433/granville?sslmode=disable
npm run db:migrate

export TEST_DATABASE_URL=$DATABASE_URL
npm run test:granville
```

Expected: 101 tests pass. Any failures indicate gaps in `PostgresGranvilleStore` to fix.

---

## AW2 Webhook Certification (Next Provider Step)

After registering a public webhook endpoint:

1. Create a sandbox payment via the Granville API
2. Wait for Airwallex to deliver the `PAID` event
3. Confirm in the ops-ui: `signatureValid=true`, payment → `completed`, ledger posting → `posted`
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
  ops-ui/               Internal operations console (server-rendered HTML)
  portal/               Customer-facing Payments Platform (React/Vite/Shadcn)
  branded-domain/       Public Granville Finance marketing site (Astro)

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
