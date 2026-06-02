# Airwallex MVP — First-Provider Proof

Airwallex MVP proves Granville's first external payment rail before the broader Granville MVP. The release is provider-specific: it validates Airwallex payout creation, webhook delivery, status transitions, ledger posting, and basic reconciliation/audit evidence.

## Status Summary

| Milestone | Status |
|---|---|
| AW1 — Sandbox integration | **Complete** |
| AW2 — Production readiness | In progress — API key (Balances scope) and compliance review outstanding |
| AW3 — Go-live | Planned — blocked on AW2 + Granville MVP M9 staging readiness |

**Release exit criterion:** one Airwallex sandbox payment completes end to end: Granville API request → Airwallex transfer → `PAID` webhook → completed payment → ledger posting → basic reconciliation/audit evidence.

---

## AW1 — Sandbox Integration (Complete)

Full payout flow proven in sandbox: auth → beneficiary create → transfer create → `SCHEDULED` status. All six `PaymentAccountProvider` operations implemented in live mode. HMAC-SHA256 webhook signature verification implemented. Transient error handling (429/502/503/504) resets commands without burning the retry budget. 8 sandbox-gated acceptance tests passing.

---

## AW2 — Production Readiness

**Code is complete. Open items are external actions and a compliance document.**

### Concrete Next Steps

These are the steps required to finish Airwallex MVP.

1. ~~**Register the sandbox webhook endpoint**~~ **Done (2026-06-01)**
   - Webhook "Granville Sandbox" registered at `https://playlist-justly-anteater.ngrok-free.dev/webhooks/airwallex`
   - Subscribed to: `payout.transfer.paid`, `payout.transfer.failed`, `payout.transfer.cancelled`
   - Signing secret stored as `AIRWALLEX_WEBHOOK_SECRET` in `.env`
   - HMAC signature formula confirmed as `timestamp + raw_body` (no dot separator)
   - Test event fired locally: signature verified, endpoint reachable, 500 is expected (no provider binding seeded in in-memory store)

2. **Add Balances read scope** ← next
   - In the Airwallex sandbox portal, go to API Keys → Edit key.
   - Add the Balances read scope.
   - Fill in `AIRWALLEX_API_KEY` in `.env` (currently on a separate machine).
   - Verify with `node --experimental-strip-types scripts/airwallex-auth-probe.ts`.
   - Success means the probe reports `GET /balances` as OK instead of `401`.

3. **Run sandbox validation**
   - Set the sandbox environment:
     ```sh
     export AIRWALLEX_SANDBOX_TEST=1
     export AIRWALLEX_BASE_URL=https://api-demo.airwallex.com
     export AIRWALLEX_CLIENT_ID=...
     export AIRWALLEX_API_KEY=...
     export AIRWALLEX_WEBHOOK_SECRET=...
     export AIRWALLEX_DRY_RUN=false
     ```
   - Run:
     ```sh
     node --test --experimental-strip-types test/granville/airwallex-sandbox.test.ts
     node --test --experimental-strip-types test/granville/airwallex-aw1-orchestration.test.ts
     ```

4. **Validate the real `PAID` webhook path**
   - Create a sandbox payment through Granville.
   - Wait for Airwallex to deliver `payout.transfer.paid`.
   - Confirm `signatureValid=true`.
   - Confirm the payment reaches `completed`.
   - Confirm the ledger posting is enqueued and posted.
   - Confirm reconciliation has `0` exceptions for the completed payment.

5. ~~**Resolve signing and replay documentation before certification**~~ **Resolved (2026-06-01)**
   - HMAC formula confirmed live: `x-timestamp + raw_body` is correct. No dot separator needed.
   - Runbook note about `x-timestamp + "." + raw_body` was incorrect — can be removed from the runbook.

### External Actions (Airwallex Portal)

| Item | Action | Priority |
|---|---|---|
| ~~**Register webhook endpoint**~~ | **Done 2026-06-01.** Webhook ID `wh_1ooQvUi1bAPFUe5sPJrYk6BGb-RLkBge`, secret in `.env`. | ~~Highest~~ |
| **Add Balances read scope** | API Keys → Edit → add Balances scope. Blocked on `AIRWALLEX_API_KEY` from other machine. | High |
| **Activate production credentials** | Switch `AIRWALLEX_BASE_URL` to `https://api.airwallex.com` and uncomment production `CLIENT_ID`/`API_KEY`. Only after sandbox acceptance and compliance sign-off. | Last |

### Code / Docs Work

| Item | Status |
|---|---|
| Ops runbooks (5 files) | **Done** — `ops/runbooks/airwallex/` |
| PAID event path validation | Blocked on `AIRWALLEX_API_KEY` — webhook endpoint and signature verification confirmed |
| Compliance review document | Pending — data fields sent to Airwallex, PII handling, FX exposure, regulatory requirements |

### Webhook Endpoint Registration (Step by Step)

**Done 2026-06-01.**

1. ✅ Registered in sandbox portal — webhook ID `wh_1ooQvUi1bAPFUe5sPJrYk6BGb-RLkBge`
2. ✅ Endpoint reachable — test event confirmed delivered via ngrok
3. ✅ `x-timestamp` + `x-signature` headers verified present and parseable
4. ✅ `signatureValid=true` confirmed — HMAC formula `timestamp + raw_body` is correct
5. ⏳ Full payment-to-`completed` path pending `AIRWALLEX_API_KEY` + real sandbox transfer

### Exit Criteria

- `PAID` webhook delivered by Airwallex sandbox, HMAC verified, payment reaches `completed`, ledger posting posted
- `getBalance` returns a valid `ProviderBalance` with real wallet data
- Compliance review document signed off
- Running `AIRWALLEX_SANDBOX_TEST=1` against production `AIRWALLEX_BASE_URL` produces 0 failures

---

## AW3 — Go-Live

**Planned. Blocked on AW2 completion and Granville MVP M9 staging environment.**

First end-to-end real-money payment:

1. Real customer payment order created and submitted
2. Granville routes to the Airwallex production binding
3. Airwallex creates a real transfer and delivers the `PAID` webhook
4. Granville posts the ledger entry and reconciles the transaction
5. Operator views the full payment timeline, audit trail, and settlement record in the ops console

**Exit criteria:** One live payment completes in production with full ledger and reconciliation coverage; ops team can monitor payment health in real time; any failure triggers an alert and the on-call runbook covers the response.
