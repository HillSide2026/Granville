# Airwallex MVP — First-Provider Proof

Airwallex MVP proves Granville's first external payment rail before the broader Granville MVP. The release is provider-specific: it validates Airwallex payout creation, webhook delivery, status transitions, ledger posting, and basic reconciliation/audit evidence.

## Status Summary

| Milestone | Status |
|---|---|
| AW1 — Sandbox integration | **Complete** |
| AW2 — Production readiness | In progress — webhook endpoint and compliance review outstanding |
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

1. **Register the sandbox webhook endpoint**
   - In the Airwallex sandbox portal, go to Developers → Webhooks → Add endpoint.
   - Register a public HTTPS endpoint that points to `POST https://<public-url>/webhooks/airwallex`.
   - Use ngrok or a staging deploy for the public URL.
   - Store the signing secret as `AIRWALLEX_WEBHOOK_SECRET`.

2. **Add Balances read scope**
   - In the Airwallex sandbox portal, go to API Keys → Edit key.
   - Add the Balances read scope.
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

5. **Resolve signing and replay documentation before certification**
   - Verify Airwallex's exact HMAC signing formula against the implementation before relying on certification results.
   - Current implementation signs `x-timestamp + raw_body`; the signature mismatch runbook says `x-timestamp + "." + raw_body`.
   - Align the manual replay payload example with the Airwallex webhook normalizer before using break-glass replay.

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

**Planned. Blocked on AW2 completion and Granville MVP M9 staging environment.**

First end-to-end real-money payment:

1. Real customer payment order created and submitted
2. Granville routes to the Airwallex production binding
3. Airwallex creates a real transfer and delivers the `PAID` webhook
4. Granville posts the ledger entry and reconciles the transaction
5. Operator views the full payment timeline, audit trail, and settlement record in the ops console

**Exit criteria:** One live payment completes in production with full ledger and reconciliation coverage; ops team can monitor payment health in real time; any failure triggers an alert and the on-call runbook covers the response.
