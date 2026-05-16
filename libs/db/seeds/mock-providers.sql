-- Seed data for mock providers used in development and testing.
-- Safe to re-run (ON CONFLICT DO NOTHING).
-- Fixed UUIDs ensure stable references across restarts.

INSERT INTO providers (id, code, display_name, kind, stage, active, metadata)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'mock-emi', 'Mock EMI',  'mock', 'stage1', TRUE, '{}'),
    ('00000000-0000-0000-0000-000000000002', 'mock-bank', 'Mock Bank', 'bank', 'stage2', TRUE, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO provider_bindings (id, provider_id, binding_kind, adapter_key, active, config, metadata)
VALUES
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'mock', 'mock-emi',  TRUE, '{}', '{}'),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'native_bank', 'mock-bank', TRUE, '{}', '{}')
ON CONFLICT DO NOTHING;

INSERT INTO provider_capabilities (id, provider_id, capability_key, enabled, config)
VALUES
    (
        '00000000-0000-0000-0002-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'outbound_payments',
        TRUE,
        '{"assets": ["GBP/2"], "rails": ["internal_book"], "countries": ["GB"], "fallbackPriority": 10}'
    ),
    (
        '00000000-0000-0000-0002-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'outbound_payments',
        TRUE,
        '{"assets": ["GBP/2", "USD/2"], "rails": ["wire", "ach"], "countries": ["GB", "US"], "fallbackPriority": 20}'
    )
ON CONFLICT DO NOTHING;

INSERT INTO provider_health (provider_binding_id, status, failure_count)
VALUES
    ('00000000-0000-0000-0001-000000000001', 'healthy', 0),
    ('00000000-0000-0000-0001-000000000002', 'healthy', 0)
ON CONFLICT DO NOTHING;

INSERT INTO routing_rules (id, name, description, priority, active, conditions, outcome)
VALUES (
    '00000000-0000-0000-0003-000000000001',
    'gbp-to-mock-emi',
    'Default GBP outbound payments to mock EMI provider',
    10, TRUE,
    '{"asset": "GBP/2"}',
    jsonb_build_object(
        'providerBindingId', '00000000-0000-0000-0001-000000000001',
        'rail', 'internal_book'
    )
)
ON CONFLICT DO NOTHING;
