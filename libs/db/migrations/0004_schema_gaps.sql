-- Migration 0004: Fix schema type mismatches found during Postgres wiring
-- 1. formance_transaction_id was BIGINT but mock IDs are strings like "mock-formance-abc123..."
-- 2. webhook_events.body was BYTEA but the store holds it as TEXT

ALTER TABLE ledger_posting_attempts
    ALTER COLUMN formance_transaction_id TYPE TEXT USING formance_transaction_id::TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'webhook_events'
          AND column_name = 'body'
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE webhook_events
            ALTER COLUMN body TYPE TEXT USING convert_from(body, 'UTF-8');
    END IF;
END $$;
