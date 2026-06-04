CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY,
  workflow_kind TEXT NOT NULL CHECK (
    workflow_kind IN (
      'payment_initiation',
      'payment_approval',
      'settlement_reconciliation',
      'exception_management'
    )
  ),
  bpmn_process_id TEXT NOT NULL,
  camunda_process_instance_key TEXT,
  business_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (
    status IN (
      'requested',
      'running',
      'waiting_approval',
      'waiting_partner',
      'manual_review',
      'completed',
      'failed',
      'cancelled'
    )
  ),
  subject_type TEXT NOT NULL CHECK (
    subject_type IN (
      'payment_order',
      'reconciliation_run',
      'reconciliation_exception',
      'provider_event'
    )
  ),
  subject_id TEXT NOT NULL,
  correlation_ids JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  started_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS workflow_instances_subject_idx
  ON workflow_instances(subject_type, subject_id);

CREATE INDEX IF NOT EXISTS workflow_instances_camunda_idx
  ON workflow_instances(camunda_process_instance_key);

CREATE INDEX IF NOT EXISTS workflow_instances_status_idx
  ON workflow_instances(status);

CREATE TABLE IF NOT EXISTS workflow_audit_records (
  id UUID PRIMARY KEY,
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id),
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'user', 'worker')),
  actor_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_audit_records_instance_idx
  ON workflow_audit_records(workflow_instance_id, created_at);
