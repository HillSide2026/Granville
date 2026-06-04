export type WorkflowKind =
  | "payment_initiation"
  | "payment_approval"
  | "settlement_reconciliation"
  | "exception_management";

export type WorkflowStatus =
  | "requested"
  | "running"
  | "waiting_approval"
  | "waiting_partner"
  | "manual_review"
  | "completed"
  | "failed"
  | "cancelled";

export interface WorkflowCorrelationIds {
  camundaProcessInstanceKey?: string;
  formanceTransactionId?: string;
  formancePaymentId?: string;
  internalPaymentRequestId?: string;
  partnerReferenceId?: string;
  reconciliationRunId?: string;
  exceptionId?: string;
}

export interface WorkflowInstanceRecord {
  id: string;
  workflowKind: WorkflowKind;
  bpmnProcessId: string;
  camundaProcessInstanceKey?: string;
  businessKey: string;
  status: WorkflowStatus;
  subjectType:
    | "payment_order"
    | "reconciliation_run"
    | "reconciliation_exception"
    | "provider_event";
  subjectId: string;
  correlationIds: WorkflowCorrelationIds;
  metadata: Record<string, string>;
  startedBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WorkflowAuditRecord {
  id: string;
  workflowInstanceId: string;
  action: string;
  actorType: "system" | "user" | "worker";
  actorId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface StartWorkflowInput {
  workflowKind: WorkflowKind;
  bpmnProcessId: string;
  businessKey: string;
  subjectType: WorkflowInstanceRecord["subjectType"];
  subjectId: string;
  correlationIds?: WorkflowCorrelationIds;
  metadata?: Record<string, string>;
  startedBy?: string;
  camundaProcessInstanceKey?: string;
}
