# Milestone PS3 — Environment & Secrets Management

**Status: Not started — .env pattern only; no centralized secrets management.**
**Track: Platform Reliability & Security**

---

## Objective

Ensure production credentials are centrally managed, rotatable without redeployment, and never committed to version control. Environments (development, staging, production) are strictly segregated.

---

## Scope

- Segregated environments (dev, staging, production configs)
- Centralized secrets management (AWS Secrets Manager, Vault, or equivalent)
- Credential rotation without redeployment
- Restricted production access

---

## What Is Done

- `ops/env.example` documents all required environment variables
- Airwallex production credentials commented out in `.env` pending sandbox acceptance
- `GRANVILLE_API_TOKEN` defaults to `dev-admin` — documented as requiring rotation before production

---

## What Is Outstanding

| Item | Notes |
|---|---|
| Centralized secrets manager | All secrets are plain `.env` files; no integration with AWS Secrets Manager, HashiCorp Vault, or equivalent |
| Credential rotation | Rotating `AIRWALLEX_API_KEY` or `AIRWALLEX_WEBHOOK_SECRET` requires a process restart |
| Environment segregation | No formal dev/staging/production configuration isolation beyond env var convention |
| Production access restriction | No access controls on who can set production environment variables |
| Secret scanning | No pre-commit hook or CI check preventing secrets from being committed |

---

## Acceptance Criteria

- Production credentials centrally managed: no production secrets in `.env` files committed to version control
- Environment isolation enforced: dev and staging environments cannot accidentally target production APIs or databases
- Credential rotation does not require a redeploy: secrets are fetched at request time or on a configurable refresh interval
