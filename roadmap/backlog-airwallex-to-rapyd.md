# Backlog: Strip Airwallex → Pivot to Rapyd

**Status:** Backlog (not started)
**Added:** 2026-07-07
**Type:** Provider pivot — remove Airwallex integration, replace with Rapyd as the first payment rail.
**Backup:** Repo has been cloned before this work; a backup of the Airwallex integration exists outside this working tree.

## Why

We are pivoting the first external payment rail away from Airwallex toward Rapyd. Airwallex was the "First-Provider Proof" (AW1–AW3); Rapyd replaces it in that role. The provider-adapter architecture is already abstracted behind `ProviderAdapterRegistry` (adapters keyed by `adapterKey`), so this is a boundaried swap, not a rewrite of the platform.

## Scope — Airwallex code to remove

Airwallex is isolated in `libs/provider-adapters/airwallex/` (737 LOC across 6 files) and referenced from a small number of wiring/config/test/doc sites.

**Adapter (delete):**
- [libs/provider-adapters/airwallex/](../libs/provider-adapters/airwallex/) — whole directory (`airwallex-client.ts`, `airwallex-emi-provider.ts`, `airwallex-mapping.ts`, `airwallex-webhooks.ts`, `airwallex-contract.ts`, `index.ts`)

**Wiring (edit):**
- [libs/provider-adapters/adapter-registry.ts](../libs/provider-adapters/adapter-registry.ts) — remove `AirwallexEmiProvider` import + `this.register("airwallex", …)` line
- [libs/provider-adapters/webhook-normalizer.ts](../libs/provider-adapters/webhook-normalizer.ts) — remove Airwallex normalization branch
- [libs/provider-adapters/README.md](../libs/provider-adapters/README.md)
- [apps/api/src/granville-api.ts](../apps/api/src/granville-api.ts)
- [apps/provider-runtime/src/provider-runtime.ts](../apps/provider-runtime/src/provider-runtime.ts)
- [apps/portal/src/components/layout/integration-status.tsx](../apps/portal/src/components/layout/integration-status.tsx)
- [apps/README.md](../apps/README.md)

**Config / secrets:**
- `ops/env.example` — remove the `# --- Airwallex ---` block (`AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET`, `AIRWALLEX_BASE_URL`)

**Scripts (delete or port):**
- [scripts/airwallex-permissions-probe.ts](../scripts/airwallex-permissions-probe.ts)
- [scripts/airwallex-auth-probe.ts](../scripts/airwallex-auth-probe.ts)

**Tests (delete or rewrite against Rapyd):**
- `test/granville/airwallex-adapter.test.ts`
- `test/granville/airwallex-sandbox.test.ts`
- `test/granville/airwallex-aw1-orchestration.test.ts`
- `test/granville/provider-adapter-contract.test.ts` (has Airwallex references)
- `test/granville/e2e-stage1-payment-flow.test.ts`, `client-sdk.test.ts`, `postgres-store.test.ts` (scan for Airwallex fixtures)

**Runbooks (delete or rewrite for Rapyd):**
- [ops/runbooks/airwallex/](../ops/runbooks/airwallex/) — `auth-failure.md`, `rate-limit-burst.md`, `webhook-replay.md`, `webhook-signature-mismatch.md`, `settlement-delay.md`

**Roadmap / architecture docs to update:**
- `ARCHITECTURE.md`
- `roadmap/README.md`, `mvp-airwallex.md`, `mvp-platform.md`, `mvp-design-system.md`, `stage1-overview.md`, `granville-repo-implementation-roadmap.md`, `milestone-mp1.md`, `milestone-mp5.md`, `milestone-ps3.md`, `milestone-fi4.md`, `milestone-og4.md`
- `business/` narrative docs reference Airwallex (GTM, positioning, market, plan) — review separately; may be intentional historical/strategy content.

## Scope — Rapyd integration to add

Mirror the Airwallex adapter shape under `libs/provider-adapters/rapyd/`:
- `rapyd-client.ts` — HTTP client + Rapyd auth (HMAC-signed request signature per Rapyd's `access_key`/`secret_key` scheme)
- `rapyd-emi-provider.ts` — implements `PaymentAccountProvider`, `fromBinding(binding)` factory
- `rapyd-mapping.ts` — Rapyd ↔ canonical domain model mapping
- `rapyd-webhooks.ts` — webhook signature verification + event normalization
- `rapyd-contract.ts`, `index.ts`
- Register `"rapyd"` in `ProviderAdapterRegistry`
- Add `# --- Rapyd ---` env block (`RAPYD_ACCESS_KEY`, `RAPYD_SECRET_KEY`, `RAPYD_BASE_URL` — sandbox `https://sandboxapi.rapyd.net`, webhook verification uses the same secret)
- Add Rapyd normalization branch to `webhook-normalizer.ts`
- Rewrite provider probe scripts + runbooks for Rapyd
- New contract + sandbox tests mirroring the deleted Airwallex tests

## Exit criterion (mirrors former Airwallex MVP)

One Rapyd sandbox payment completes end to end: Granville API request → Rapyd payout/transfer → paid webhook (signature valid) → completed payment → ledger posting → basic reconciliation/audit evidence.

## Open questions / decisions

- **Rapyd product surface:** confirm which Rapyd API(s) the EMI rail uses (Payouts vs. Disburse vs. Wallet/Issuing) — determines the client + mapping shape.
- **Webhook model:** Rapyd webhook signature scheme differs from Airwallex; confirm verification approach and idempotency handling.
- **Historical docs:** decide whether `business/` and roadmap docs should be rewritten to Rapyd or retain Airwallex as historical record with a pivot note.
- **`adapterKey` migration:** any persisted `ProviderBinding` rows with `adapterKey = "airwallex"` need a data migration to `"rapyd"` (or a mapping) — check `libs/db/` migrations and `libs/persistence/`.

## Sequencing

1. Confirm Rapyd product/API decisions (open questions above).
2. Build Rapyd adapter alongside Airwallex (register both) — keep tests green.
3. Prove Rapyd sandbox payment end to end.
4. Strip Airwallex adapter, wiring, config, scripts, runbooks, tests.
5. Update roadmap + architecture docs; migrate persisted bindings.
