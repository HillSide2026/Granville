# Granville ↔ mpcium Integration

## What mpcium is

mpcium is an open-source Multi-Party Computation (MPC) engine for generating and managing
cryptographic wallets across distributed nodes without ever exposing the full private key.
It uses a t-of-n threshold scheme (default: 2-of-3 nodes must cooperate to sign any
transaction). No single node — and no single party — can sign alone.

Repo: `/repos/mpcium` (local) · Maintained by Fystack  
Production host: `https://mpc.granvillefinance.ca` (TBD)  
Spec: `/repos/mpcium/wallet-api/openapi.yaml`

**Scope:** EVM chains only — Ethereum, Polygon, Arbitrum, Base, Optimism.  
**Tokens:** USDC and USDT only (6 decimal places; amounts expressed as raw integer strings).

---

## Integration model

**Backend-to-backend. The browser never calls mpcium directly.**

```
┌─────────────────────────────────────────────────────────────┐
│                      apps/portal                            │
│   /wallets  (customer-facing crypto wallet UI)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST (Granville JWT auth)
┌──────────────────────────▼──────────────────────────────────┐
│                      apps/api  (proxy layer)                │
│                                                             │
│  Policy check → approve → forward to mpcium                 │
│  SSE listener → route events to customers                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ X-Granville-Service-Token
┌──────────────────────────▼──────────────────────────────────┐
│               mpcium wallet-api  (/service/*)               │
│                                                             │
│  POST   /service/wallets               ← create wallet      │
│  GET    /service/wallets               ← list all wallets   │
│  GET    /service/wallets/{id}          ← wallet + balances  │
│  GET    /service/wallets/{id}/transactions                  │
│  POST   /service/transactions          ← sign + broadcast   │
│  GET    /service/transactions/{id}                          │
│  POST   /service/transactions/{id}/cancel                   │
│  POST   /service/transactions/{id}/speed-up                 │
│  GET    /service/health/cluster                             │
│  GET    /service/events                ← SSE stream         │
└─────────────────────────────────────────────────────────────┘
```

Granville owns the customer identity, the approval workflow, and the policy layer.
mpcium owns key generation, threshold signing, chain interaction, and balance indexing.

---

## Authentication

A shared secret (`X-Granville-Service-Token`) is sent as an HTTP header on every
service-route request. It must be configured identically in:

- mpcium: `config.yaml` → `service_token` field
- Granville: environment variable (name TBD — propose `MPCIUM_SERVICE_TOKEN`)

The token is a long random string. It is never exposed to the browser or to end-users.
mpcium returns `401` if the token is wrong; `503` if it is not configured server-side.

All service-route traffic must be over HTTPS in production.

---

## Granville's obligations

### 1. Policy check before signing

mpcium signs whatever arrives through an authenticated service-token call. It performs
no AML screening, no limit checks, and no approval workflow. The `policy_check` status
in the `Transaction` schema is **reserved for Granville's use** — mpcium never sets it.

Granville's proxy layer must:

1. Receive the send-transaction request from the portal
2. Set the transaction to `policy_check` status in Granville's own store
3. Apply policy (AML screen, limit check, multi-party approval if required)
4. Only call `POST /service/transactions` after policy passes
5. On policy failure: mark the transaction failed internally; do not call mpcium

**Policy criteria are not yet defined.** This must be resolved before Track 3 begins.
See [roadmap/portal-roadmap.md](../roadmap/portal-roadmap.md) Track 3.

---

### 2. Org-ID scoping

mpcium currently stores `user_id = ""` for all service-token wallet creates because the
service token middleware does not inject an identity. This means all wallets created via
the service token are unscoped — any service-token call can read any wallet.

The `org_id` field exists in `POST /service/wallets` but is not yet consumed by mpcium.

**Before multi-customer production use:**
- mpcium must implement org scoping (open issue #2 in the spec)
- Granville must pass the customer's internal ID as `org_id` on every wallet create call
- The Granville customer ID is the natural mapping: `org_id = customer.id`

---

### 3. SSE event handling

mpcium pushes a single SSE stream (`GET /service/events`) covering all managed wallets.
Two event types are emitted:

| Event | Trigger | Granville action |
|---|---|---|
| `tx_confirmed` | Outbound transaction confirmed on-chain (Alchemy webhook) | Update payment status to `completed` in Granville's store |
| `tx_received` | Inbound ERC-20 transfer arrived at a managed wallet address | Create a Sales record in Granville (crypto inbound = Sales) |

The stream is a firehose — Granville must filter by wallet ID or address to route each
event to the correct customer. A persistent SSE listener should live in `apps/api` (or
`apps/webhook-ingest` alongside existing webhook processing).

---

## Open issues in mpcium (must resolve before Track 3)

These are documented in `/repos/mpcium/wallet-api/openapi.yaml` → `info.description`.

| # | Issue | Impact | Owner |
|---|---|---|---|
| 1 | `GET /service/wallets` — `walletH.ListAll` handler does not exist (compile error) | Granville cannot render a wallet list | mpcium |
| 2 | `user_id` scoping — service-token wallets stored with `user_id = ""` | All wallets are unscoped; unusable for multi-customer production | mpcium + Granville |
| 3 | Path prefix resolved — `/service/*` is truth; earlier workplan used `/api/v1/*` | Low risk; ensure Granville proxy uses `/service/*` | Granville |

---

## Amount format

mpcium expresses all token amounts as **raw integer strings with no decimal point**.

| String | Meaning |
|---|---|
| `"1000000"` | 1.000000 USDC (6 decimals) |
| `"500000"` | 0.500000 USDC |

Granville's existing `Money` type (`{ amount: string, asset: string }`) uses human-readable
decimal amounts. The decimal conversion (× 10⁶ on the way out, ÷ 10⁶ on the way in) must
be handled in one place in Granville's proxy layer — not scattered across the portal or API.

---

## Transaction lifecycle

```
draft → policy_check → signing → signed → broadcast → confirmed
                                                     ↘ failed (from any stage)
```

- `draft` through `policy_check`: Granville's domain — mpcium never sets these
- `signing` onward: mpcium's domain — Granville should not modify status
- `failed`: either party can result in this; Granville should surface the reason

---

## What is not covered

- Bitcoin, Solana, or non-EVM chains — mpcium's core engine supports them (ECDSA + EdDSA)
  but the wallet-api has no endpoints for them
- Non-stablecoin ERC-20 tokens — only USDC and USDT are indexed and supported
- Fiat-to-crypto or crypto-to-fiat — out of scope for this integration
