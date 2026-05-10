CREATE TABLE IF NOT EXISTS provider_health (
    provider_binding_id UUID PRIMARY KEY REFERENCES provider_bindings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'disabled')),
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    failure_count INTEGER NOT NULL DEFAULT 0,
    latency_ms INTEGER,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS provider_command_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command_type TEXT NOT NULL CHECK (command_type IN ('initiate_payment', 'cancel_payment', 'retry_payment')),
    payment_order_id UUID NOT NULL REFERENCES payment_orders(id) ON DELETE CASCADE,
    payment_attempt_id UUID NOT NULL REFERENCES payment_attempts(id) ON DELETE CASCADE,
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE RESTRICT,
    idempotency_key TEXT NOT NULL UNIQUE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'dead_lettered')
    ),
    retry_count INTEGER NOT NULL DEFAULT 0,
    available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS provider_command_queue_status_idx
    ON provider_command_queue (status, available_at);

CREATE TABLE IF NOT EXISTS provider_request_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_command_id UUID NOT NULL REFERENCES provider_command_queue(id) ON DELETE CASCADE,
    payment_attempt_id UUID NOT NULL REFERENCES payment_attempts(id) ON DELETE CASCADE,
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE RESTRICT,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_payload JSONB,
    provider_reference TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE (provider_command_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS provider_request_attempts_attempt_idx
    ON provider_request_attempts (payment_attempt_id);
