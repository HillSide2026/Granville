# Granville Applications

Granville is a full-stack product. This directory contains both the user-facing
frontend applications and the backend services that power them.

---

## Frontend

| App | Purpose | Stack |
|---|---|---|
| `portal/` | End-customer self-serve portal (Budgets, Payments, Sales, FX, Wallets) | React · Vite · TanStack Router |
| `ops-ui/` | Internal operator console (KYC, approvals, feature provisioning) | React · Vite · TanStack Router — stub |
| `website/` | Public-facing marketing and legal site | Astro · Tailwind CSS |

---

## Backend

| Service | Purpose |
|---|---|
| `api/` | HTTP entrypoint — all routes, auth, RBAC, idempotency boundary |
| `orchestrator/` | Payment lifecycle — create, submit, cancel, retry |
| `provider-runtime/` | Executes payment attempts against EMI/bank providers |
| `ledger-writer/` | Asynchronous posting gateway into Formance Ledger |
| `reconciler/` | Matches provider state against internal and ledger state |
| `webhook-ingest/` | Receives and durably processes inbound provider webhooks |

---

## Shared libraries

Shared code lives under `libs/` at the repo root:

| Library | Purpose |
|---|---|
| `libs/contracts/` | All TypeScript domain types and interfaces |
| `libs/persistence/` | In-memory store + Postgres repositories |
| `libs/provider-adapters/` | Airwallex, mock-emi, mock-bank adapters |
| `libs/router/` | Configuration-driven provider routing engine |
| `libs/ledger-postings/` | Deterministic ledger posting templates |
| `libs/reporting/` | Report engine — payment history, audit export, metrics |
| `libs/db/` | Database migrations |

---

## External integrations

| System | Role | Doc |
|---|---|---|
| mpcium | Crypto wallet backend (MPC threshold signing) | [docs/MPCIUM_INTEGRATION.md](../docs/MPCIUM_INTEGRATION.md) |
| Formance Ledger | Immutable double-entry accounting | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| Airwallex | EMI payment provider | [roadmap/mvp-airwallex.md](../roadmap/mvp-airwallex.md) |
