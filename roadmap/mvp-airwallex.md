# MVP — Airwallex

## Status Summary

| Milestone | Status |
|---|---|
| AW1 — Sandbox integration | **Complete** |
| AW2 — Production readiness | In progress — webhook endpoint and compliance review outstanding |
| AW3 — Go-live | Planned — blocked on AW2 + M9 |

---

## AW1 — Sandbox Integration (Complete)

Full payout flow proven in sandbox: auth → beneficiary create → transfer create → `SCHEDULED` status. All six `PaymentAccountProvider` operations implemented in live mode. HMAC-SHA256 webhook signature verification implemented. Transient error handling (429/502/503/504) resets commands without burning the retry budget. 8 sandbox-gated acceptance tests passing.

---

## AW2 — Production Readiness

**Code is complete. Open items are external actions and a compliance document.**

### External Actions (Airwallex Portal)

| Item | Action | Priority |
|---|---|---|
| **Register webhook endpoint** | Webhooks → Add endpoint. Must be a public HTTPS URL (use ngrok or a staging deploy). Airwallex delivers `PAID` events here. | Highest |
| **Add Balances read scope** | API Keys → Edit → add Balances scope. Currently `GET /api/v1/balances` returns `401`. | High |
| **Activate production credentials** | Switch `AIRWALLEX_BASE_URL` to `https://api.airwallex.com` and uncomment production `CLIENT_ID`/`API_KEY`. Only after sandbox acceptance and compliance sign-off. | Last |

### Code / Docs Work

| Item | Status |
|---|---|
| Ops runbooks (5 files) | **Done** — `ops/runbooks/airwallex/` |
| PAID event path validation | Blocked on webhook endpoint registration |
| Compliance review document | Pending — data fields sent to Airwallex, PII handling, FX exposure, regulatory requirements |

### Webhook Endpoint Registration (Step by Step)

Once a public HTTPS endpoint is available:

1. Register it in the Airwallex sandbox portal under Webhooks
2. Confirm Airwallex delivers a test `payout.transfer.paid` event
3. Verify `x-timestamp` and `x-signature` headers arrive at the Granville endpoint
4. Confirm Granville processes the event: `signatureValid=true`, payment transitions to `completed`, ledger posting enqueued and posted

The complete code path is already implemented — this is environment configuration only.

### Exit Criteria

- `PAID` webhook delivered by Airwallex sandbox, HMAC verified, payment reaches `completed`, ledger posting posted
- `getBalance` returns a valid `ProviderBalance` with real wallet data
- Compliance review document signed off
- Running `AIRWALLEX_SANDBOX_TEST=1` against production `AIRWALLEX_BASE_URL` produces 0 failures

---

## AW3 — Go-Live

**Planned. Blocked on AW2 completion and M9 staging environment.**

First end-to-end real-money payment:

1. Real customer payment order created and submitted
2. Granville routes to the Airwallex production binding
3. Airwallex creates a real transfer and delivers the `PAID` webhook
4. Granville posts the ledger entry and reconciles the transaction
5. Operator views the full payment timeline, audit trail, and settlement record in the ops console

**Exit criteria:** One live payment completes in production with full ledger and reconciliation coverage; ops team can monitor payment health in real time; any failure triggers an alert and the on-call runbook covers the response.
