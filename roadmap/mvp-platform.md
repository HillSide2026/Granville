# Granville MVP — Product/Platform Milestone

Granville MVP turns the Airwallex first-provider proof into a usable product/platform milestone. It covers the provider-agnostic core: persistence, API orchestration, ledger integration, durable events, reconciliation, operator workflows, reporting, and staging readiness.

## Status Summary

| Milestone | Description | Status |
|---|---|---|
| M0 | Foundation and repo control | Partial — docs and workspace migration outstanding |
| M1 | Operational core | **Complete** — 123/123 tests pass against live Postgres |
| M2 | API and orchestration | Complete pending M1 Postgres acceptance |
| M3 | EMI adapter and provider runtime | **Complete** |
| M4 | Ledger integration | Mock complete — real Formance blocked on M1 |
| M5 | Webhooks and event durability | **Complete** |
| M6 | Reconciliation engine | **Complete** (Granville MVP scope) |
| M7 | Admin and ops console | **Complete** |
| M8 | Reporting and compliance | **Complete** |
| M9 | Production readiness | Not started — blocked on M1, AW2, M7, M8 |

**Release exit criterion:** the core payment workflow can be run repeatedly in a staging-like environment with Postgres persistence, portal/operator workflows, reporting, durable events, and Airwallex configured as the first provider.

---

## M0 — Foundation and Repo Control

**Partial.** Repo structure, local compose, env example, CI skeleton, and observability stubs are all in place.

**Outstanding:**

| Item | Notes |
|---|---|
| `README.md` at repo root | Missing — entry point for new contributors |
| `ARCHITECTURE.md` | Missing — documents the orchestration-first, ledger-centric model and the Granville/Formance boundary |
| `DECISIONS.md` | Missing — records why the system is built the way it is |
| Workspace migration | Formance source at repo root; target is `third_party/formance-*`. Non-blocking for M1. |

All doc work is unblocked. The workspace migration can wait until after M1.

---

## M1 — Operational Core

**Complete.** 123/123 tests pass against a live migrated Postgres instance.

Two fixes were required to complete the acceptance run:
- `libs/db/client.ts`: configured `pg` to return timestamps as ISO strings (not `Date` objects) to match the in-memory store's string-based timestamps.
- `test/granville/postgres-store.test.ts`: `ensureMigrated()` now truncates all tables before re-seeding, preventing cross-run contamination (a seeded Airwallex provider with `fallbackPriority: 1` was persisting between runs and hijacking mock-EMI routing).

**To run the Postgres acceptance suite:**

```sh
# Requires Docker Desktop running
docker compose -f ops/docker-compose.local.yml --profile granville up -d granville-postgres

export DATABASE_URL=postgres://granville:granville@localhost:5433/granville?sslmode=disable
npm run db:migrate

export TEST_DATABASE_URL=$DATABASE_URL
npm run test:granville
```

**Exit criteria met:** `npm run test:granville` passes 123/123 tests against a live migrated Postgres instance.

---

## M4 — Ledger Integration

**Mock complete. Real Formance proof blocked on M1.**

`LedgerWriter` posts idempotent double-entry transactions to Formance with a canonical account taxonomy. The mock Formance client accepts all postings in-memory. Swapping in the real client requires only setting `FORMANCE_LEDGER_URL` after M1 passes.

**Outstanding:**

| Item | Notes |
|---|---|
| Real Formance proof | Set `FORMANCE_LEDGER_URL` once M1 Postgres is running |
| Formance auth | Not wired — depends on whether the local Formance instance requires auth |
| Balance verification | Post-posting balance check via `GET /ledger/accounts/:address` not implemented |

---

## M9 — Production Readiness

**Not started. Blocked on M1, AW2, and the items below.**

**Gates:**

| Gate | Status |
|---|---|
| M1 Postgres checkpoint | Pending |
| AW2 production readiness | In progress |
| M7 ops console | Complete |
| M8 compliance export | Complete |

**Required for M9:**

- Staging environment: Docker Compose promoted to staging with real Postgres, real Formance Ledger, and real Airwallex sandbox credentials
- Staging acceptance: `npm run test:granville` and `AIRWALLEX_SANDBOX_TEST=1` sandbox tests pass against the staging process
- Secrets management: env vars replaced with a secrets manager reference; no credentials in `.env` committed to version control
- TLS and auth: API behind TLS; `GRANVILLE_API_TOKEN` rotated from `dev-admin`
- Observability: OTEL traces, Prometheus metrics, and structured logs emitting
- Provider runtime: `ProviderRuntime` running as a persistent worker process with a configurable poll interval (currently in-process for tests only)
- Load test baseline: single-process load test against Postgres store
- Runbooks: the five runbooks in `ops/runbooks/` exist and cover trigger conditions, response steps, and escalation

**Exit criteria:** Granville API starts against real Postgres and Formance Ledger; a complete payment lifecycle completes in staging; no hardcoded secrets; OTEL traces visible; staging acceptance tests pass.
