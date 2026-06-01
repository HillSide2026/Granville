# Milestone PS3 — Environment & Secrets Management

**Status: Complete (V1 scope)**
**Track: Platform Reliability & Security**

---

## Objective

Ensure production credentials are never committed to version control and all required environment variables are documented. A future operator can connect a centralized secrets manager without code changes.

---

## What Is Done

- All credentials read from environment variables at runtime — no hardcoded secrets in committed code
- `.env` is gitignored at the repo root
- `ops/env.example` documents every environment variable used by the platform with inline notes on rotation and production use
- `GRANVILLE_API_TOKEN` defaults to `dev-admin` — documented as requiring rotation before any non-development deployment
- `GRANVILLE_AUTO_MIGRATE` flag documented — migrations run as a separate step in production, not automatically on startup
- All Airwallex credentials are commented out in `env.example` and read only from env vars in the adapter

## Architecture: Beyond V1

A future owner can integrate a centralized secrets manager (AWS Secrets Manager, HashiCorp Vault, or equivalent) without code changes — the platform reads all credentials from `process.env` at startup, which is the standard injection point for any secrets manager sidecar or init container. Credential rotation requires a process restart with the current approach; live rotation would require fetching secrets at request time.
