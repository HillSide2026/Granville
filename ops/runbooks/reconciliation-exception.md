# Runbook: Reconciliation Exception Triage

## Overview

Reconciliation exceptions are created when the state of a payment in Granville, the provider, and the Formance Ledger do not agree. Every exception has a `category`, `severity`, and `status` (open/resolved/ignored).

Run reconciliation on demand:

```
POST /reconciliation/runs
```

List open exceptions:

```
GET /admin/reconciliation/exceptions
```

## Exception categories

### `missing_provider_transaction` — CRITICAL

**Meaning:** A completed payment order has no matching provider transaction record.

**Likely cause:** Provider runtime failed before recording the transaction, or a webhook that carried the result was never processed.

**Resolution:**
1. Check provider portal to confirm the transaction did or did not execute.
2. If provider confirms execution: replay the result webhook or manually record the transaction, then re-run reconciliation.
3. If provider confirms non-execution: mark the payment failed and open a new payment if required.

---

### `ledger_posting_missing` — CRITICAL

**Meaning:** A completed payment has no posted ledger entry.

**Resolution:** See [ledger-writer-failure.md](ledger-writer-failure.md). Replay the posting, then re-run reconciliation.

---

### `amount_mismatch` — CRITICAL

**Meaning:** The amount in the provider transaction does not match the Granville payment order.

**Resolution:**
1. Confirm the correct amount with the provider.
2. If provider amount is correct and Granville amount is wrong: update the payment record and flag for finance review.
3. If provider amount is wrong: raise a dispute with the provider before resolving.

Do not resolve automatically — requires finance sign-off.

---

### `currency_mismatch` — CRITICAL

**Meaning:** Provider transaction asset does not match the payment order asset.

**Resolution:** Same process as `amount_mismatch`. Escalate to finance.

---

### `status_mismatch` — WARNING

**Meaning:** Provider reports a different terminal status than Granville.

**Resolution:** Trust the provider status. Update the Granville record to match, then resolve.

---

### `missing_internal_transaction` — CRITICAL

**Meaning:** A provider transaction exists with no linked Granville payment attempt.

**Likely cause:** A payment was created directly in the provider portal (out of band), or a record was corrupted.

**Resolution:** Investigate the provider transaction. If it maps to a known customer, create the missing records manually and flag for audit review.

---

### `duplicate_provider_reference` — CRITICAL

**Meaning:** Two provider transactions share the same `providerReference`.

**Resolution:** Identify which transaction is the original. Mark the duplicate as ignored in the provider system. Escalate to the provider if both appear in their ledger.

---

### `stale_pending_transaction` — WARNING

**Meaning:** A payment has been in `submitted_to_provider` or `processing` for over 1 hour.

**Resolution:** Query the provider for current status. If complete: process the result webhook. If failed: mark failed and retry if appropriate.

---

## Resolving an exception

Once the underlying issue is fixed:

```
POST /admin/reconciliation/exceptions/{exceptionId}/resolve
Content-Type: application/json

{ "resolvedBy": "your-name", "note": "Brief explanation of resolution" }
```

Every resolution creates an audit event. Do not resolve without a note.
