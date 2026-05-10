-- Milestone 5: webhook processing attempt tracking
CREATE TABLE IF NOT EXISTS webhook_processing_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_event_id UUID NOT NULL REFERENCES webhook_events(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'processed', 'failed', 'ignored')),
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    UNIQUE (webhook_event_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS webhook_processing_attempts_event_idx
    ON webhook_processing_attempts (webhook_event_id);

-- Milestone 6: reconciliation matched/unmatched record pairs
CREATE TABLE IF NOT EXISTS reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_run_id UUID NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
    payment_order_id UUID REFERENCES payment_orders(id) ON DELETE CASCADE,
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE CASCADE,
    provider_transaction_id UUID REFERENCES provider_transactions(id) ON DELETE CASCADE,
    ledger_posting_id UUID REFERENCES ledger_posting_queue(id) ON DELETE CASCADE,
    match_status TEXT NOT NULL CHECK (match_status IN ('matched', 'unmatched', 'exception')),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reconciliation_records_run_idx
    ON reconciliation_records (reconciliation_run_id);

CREATE INDEX IF NOT EXISTS reconciliation_records_order_idx
    ON reconciliation_records (payment_order_id);

-- Milestone 6: additional columns on reconciliation_exceptions
ALTER TABLE reconciliation_exceptions
    ADD COLUMN IF NOT EXISTS provider_transaction_id UUID REFERENCES provider_transactions(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS ledger_posting_id UUID REFERENCES ledger_posting_queue(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS reconciliation_exceptions_provider_txn_idx
    ON reconciliation_exceptions (provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;
