CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('emi', 'bank', 'psp', 'mock')),
    stage TEXT NOT NULL DEFAULT 'stage1',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    capability_key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider_id, capability_key)
);

CREATE INDEX IF NOT EXISTS provider_capabilities_provider_id_idx
    ON provider_capabilities (provider_id);

CREATE TABLE IF NOT EXISTS routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 100,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS routing_rules_active_priority_idx
    ON routing_rules (active, priority);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_reference TEXT UNIQUE,
    customer_type TEXT NOT NULL DEFAULT 'individual',
    status TEXT NOT NULL DEFAULT 'created',
    legal_name TEXT NOT NULL,
    email TEXT,
    country_code TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kyc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    provider_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    raw_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kyc_records_customer_id_idx
    ON kyc_records (customer_id);

CREATE TABLE IF NOT EXISTS provider_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
    binding_kind TEXT NOT NULL CHECK (binding_kind IN ('formance_payments', 'native_emi', 'native_bank', 'mock')),
    adapter_key TEXT NOT NULL,
    formance_connector_id TEXT,
    provider_tenant_reference TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider_id, adapter_key)
);

CREATE INDEX IF NOT EXISTS provider_bindings_provider_id_idx
    ON provider_bindings (provider_id);

CREATE TABLE IF NOT EXISTS payment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE RESTRICT,
    account_kind TEXT NOT NULL DEFAULT 'virtual',
    status TEXT NOT NULL DEFAULT 'created',
    currency_code TEXT,
    country_code TEXT,
    display_name TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_accounts_customer_id_idx
    ON payment_accounts (customer_id);

CREATE INDEX IF NOT EXISTS payment_accounts_provider_binding_id_idx
    ON payment_accounts (provider_binding_id);

CREATE TABLE IF NOT EXISTS provider_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    payment_account_id UUID REFERENCES payment_accounts(id) ON DELETE SET NULL,
    provider_customer_id TEXT,
    provider_account_id TEXT NOT NULL,
    account_reference TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    balance_currency TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider_binding_id, provider_account_id)
);

CREATE INDEX IF NOT EXISTS provider_accounts_payment_account_id_idx
    ON provider_accounts (payment_account_id);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    resource_type TEXT,
    resource_id UUID,
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    UNIQUE (scope, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idempotency_keys_resource_idx
    ON idempotency_keys (resource_type, resource_id);

CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    payment_account_id UUID NOT NULL REFERENCES payment_accounts(id) ON DELETE RESTRICT,
    idempotency_key_id UUID REFERENCES idempotency_keys(id) ON DELETE SET NULL,
    external_reference TEXT,
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
    transaction_type TEXT NOT NULL DEFAULT 'payment',
    amount NUMERIC(20, 0) NOT NULL,
    asset TEXT NOT NULL,
    beneficiary_reference TEXT,
    provider_reference TEXT,
    status TEXT NOT NULL DEFAULT 'created' CHECK (
        status IN (
            'created',
            'pending_review',
            'submitted_to_provider',
            'provider_accepted',
            'processing',
            'completed',
            'failed',
            'returned',
            'cancelled'
        )
    ),
    failure_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS payment_orders_customer_id_idx
    ON payment_orders (customer_id);

CREATE INDEX IF NOT EXISTS payment_orders_payment_account_id_idx
    ON payment_orders (payment_account_id);

CREATE INDEX IF NOT EXISTS payment_orders_status_idx
    ON payment_orders (status);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_order_id UUID NOT NULL REFERENCES payment_orders(id) ON DELETE CASCADE,
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE RESTRICT,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'created' CHECK (
        status IN (
            'created',
            'pending_review',
            'submitted_to_provider',
            'provider_accepted',
            'processing',
            'completed',
            'failed',
            'returned',
            'cancelled'
        )
    ),
    route_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_request_id TEXT,
    provider_transaction_id TEXT,
    provider_reference TEXT,
    last_error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE (payment_order_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS payment_attempts_payment_order_id_idx
    ON payment_attempts (payment_order_id);

CREATE INDEX IF NOT EXISTS payment_attempts_provider_binding_id_idx
    ON payment_attempts (provider_binding_id);

CREATE INDEX IF NOT EXISTS payment_attempts_status_idx
    ON payment_attempts (status);

CREATE TABLE IF NOT EXISTS provider_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE RESTRICT,
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL,
    payment_account_id UUID REFERENCES payment_accounts(id) ON DELETE SET NULL,
    provider_transaction_id TEXT NOT NULL,
    provider_reference TEXT,
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
    status TEXT NOT NULL,
    amount NUMERIC(20, 0) NOT NULL,
    asset TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider_binding_id, provider_transaction_id)
);

CREATE INDEX IF NOT EXISTS provider_transactions_attempt_idx
    ON provider_transactions (payment_attempt_id);

CREATE INDEX IF NOT EXISTS provider_transactions_provider_reference_idx
    ON provider_transactions (provider_reference);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_binding_id UUID NOT NULL REFERENCES provider_bindings(id) ON DELETE RESTRICT,
    provider_code TEXT NOT NULL,
    delivery_id TEXT,
    idempotency_key TEXT,
    signature_valid BOOLEAN,
    processing_status TEXT NOT NULL DEFAULT 'received' CHECK (
        processing_status IN ('received', 'queued', 'processing', 'processed', 'failed', 'ignored')
    ),
    request_path TEXT NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    body BYTEA NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    last_error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_binding_delivery_idx
    ON webhook_events (provider_binding_id, delivery_id)
    WHERE delivery_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_binding_idempotency_idx
    ON webhook_events (provider_binding_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS webhook_events_status_idx
    ON webhook_events (processing_status, received_at);

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

CREATE TABLE IF NOT EXISTS internal_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL,
    amount NUMERIC(20, 0) NOT NULL,
    asset TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'recorded',
    reference TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS internal_transactions_payment_order_idx
    ON internal_transactions (payment_order_id);

CREATE TABLE IF NOT EXISTS ledger_posting_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    posting_key TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    ledger_name TEXT NOT NULL DEFAULT 'default',
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'posted', 'failed', 'dead_lettered')
    ),
    retry_count INTEGER NOT NULL DEFAULT 0,
    available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ledger_posting_queue_status_idx
    ON ledger_posting_queue (status, available_at);

CREATE TABLE IF NOT EXISTS ledger_posting_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_posting_queue_id UUID NOT NULL REFERENCES ledger_posting_queue(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    formance_ledger TEXT,
    formance_transaction_id BIGINT,
    status TEXT NOT NULL CHECK (status IN ('processing', 'posted', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE (ledger_posting_queue_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS ledger_posting_attempts_queue_idx
    ON ledger_posting_attempts (ledger_posting_queue_id);

CREATE TABLE IF NOT EXISTS reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_binding_id UUID REFERENCES provider_bindings(id) ON DELETE SET NULL,
    run_type TEXT NOT NULL CHECK (
        run_type IN ('transaction_level', 'balance', 'settlement', 'fee', 'exception')
    ),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (
        status IN ('queued', 'running', 'completed', 'failed')
    ),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reconciliation_runs_status_idx
    ON reconciliation_runs (status, created_at);

CREATE TABLE IF NOT EXISTS reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_run_id UUID NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
    payment_order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL,
    provider_transaction_id UUID REFERENCES provider_transactions(id) ON DELETE SET NULL,
    ledger_posting_queue_id UUID REFERENCES ledger_posting_queue(id) ON DELETE SET NULL,
    match_status TEXT NOT NULL CHECK (match_status IN ('matched', 'unmatched', 'exception')),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reconciliation_records_run_idx
    ON reconciliation_records (reconciliation_run_id);

CREATE TABLE IF NOT EXISTS reconciliation_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_run_id UUID REFERENCES reconciliation_runs(id) ON DELETE SET NULL,
    payment_order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL,
    provider_transaction_id UUID REFERENCES provider_transactions(id) ON DELETE SET NULL,
    ledger_posting_queue_id UUID REFERENCES ledger_posting_queue(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'missing_provider_transaction',
            'missing_internal_transaction',
            'amount_mismatch',
            'currency_mismatch',
            'status_mismatch',
            'duplicate_provider_reference',
            'stale_pending_transaction',
            'ledger_posting_missing'
        )
    ),
    severity TEXT NOT NULL DEFAULT 'warning',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
    description TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    manual_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS reconciliation_exceptions_status_idx
    ON reconciliation_exceptions (status, created_at);

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'user', 'service')),
    actor_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    request_id TEXT,
    idempotency_key TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_resource_idx
    ON audit_events (resource_type, resource_id, created_at);
