import type { CamundaJob, WorkerContext } from "./types.ts";

export type TaskHandler = (
  job: CamundaJob,
  context: WorkerContext,
) => Promise<Record<string, unknown>>;

export const taskHandlers: Record<string, TaskHandler> = {
  "payment.validate-request": async (job, context) => {
    await record(job, context, "payment.request_validated", {});
    return {};
  },

  "payment.check-permissions": async (job, context) => {
    await record(job, context, "payment.permissions_checked", {});
    return {
      riskScore: numberVariable(job, "riskScore", 0),
      currency: currencyFromAsset(stringVariable(job, "asset", "GBP/2")),
    };
  },

  "payment.create-pending": async (job, context) => {
    const existingPaymentOrderId = stringVariable(job, "paymentOrderId");
    if (existingPaymentOrderId) {
      await updateWorkflow(job, context, "running", {
        internalPaymentRequestId: existingPaymentOrderId,
        formancePaymentId: existingPaymentOrderId,
      });
      return { paymentOrderId: existingPaymentOrderId };
    }
    const payment = (await context.backend.post(
      "/payments",
      {
        customerId: requiredVariable(job, "customerId"),
        paymentAccountId: requiredVariable(job, "paymentAccountId"),
        amount: requiredVariable(job, "amount"),
        asset: requiredVariable(job, "asset"),
        beneficiaryReference: stringVariable(job, "beneficiaryReference"),
        metadata: workflowMetadata(job),
      },
      idempotencyKey(job, "create-pending-payment"),
    )) as { id: string };
    await updateWorkflow(job, context, "running", {
      internalPaymentRequestId: payment.id,
      formancePaymentId: payment.id,
    });
    return { paymentOrderId: payment.id };
  },

  "payment.submit-to-partner": async (job, context) => {
    const paymentOrderId = requiredVariable(job, "paymentOrderId");
    const payment = (await context.backend.post(
      `/payments/${paymentOrderId}/submit`,
      {},
      idempotencyKey(job, "submit-to-partner"),
    )) as { id: string; providerReference?: string; status?: string };
    await updateWorkflow(job, context, "waiting_partner", {
      partnerReferenceId: payment.providerReference,
    });
    return {
      paymentStatus: payment.status ?? "submitted_to_provider",
      partnerReferenceId: payment.providerReference,
    };
  },

  "payment.update-formance-state": async (job, context) => {
    const paymentOrderId = requiredVariable(job, "paymentOrderId");
    const payment = (await context.backend.get(`/payments/${paymentOrderId}`)) as {
      id: string;
      status?: string;
      providerReference?: string;
    };
    const status =
      payment.status === "completed"
        ? "completed"
        : payment.status === "failed"
          ? "failed"
          : "manual_review";
    await updateWorkflow(job, context, status, {
      partnerReferenceId: payment.providerReference,
    });
    return { paymentStatus: status, partnerReferenceId: payment.providerReference };
  },

  "approval.enforce-maker-checker": async (job, context) => {
    const makerUserId = stringVariable(job, "makerUserId");
    const approverUserId = stringVariable(job, "approverUserId");
    if (makerUserId && approverUserId && makerUserId === approverUserId) {
      throw new Error("Maker-checker violation: maker and checker must differ");
    }
    await record(job, context, "approval.maker_checker_checked", { makerUserId, approverUserId });
    return {};
  },

  "approval.write-decision": async (job, context) => {
    const paymentOrderId = requiredVariable(job, "paymentOrderId");
    await context.backend.post(
      `/payments/${paymentOrderId}/approve`,
      { note: stringVariable(job, "approvalNote") ?? "Approved through Camunda Tasklist" },
      idempotencyKey(job, "approve-payment"),
    );
    await record(job, context, "approval.approved", { paymentOrderId });
    return { approvalDecision: "approved" };
  },

  "approval.write-rejection": async (job, context) => {
    const paymentOrderId = requiredVariable(job, "paymentOrderId");
    await context.backend.post(
      `/payments/${paymentOrderId}/reject`,
      { note: stringVariable(job, "rejectionReason") ?? "Rejected through Camunda Tasklist" },
      idempotencyKey(job, "reject-payment"),
    );
    await updateWorkflow(job, context, "cancelled");
    return { approvalDecision: "rejected" };
  },

  "reconciliation.ingest-statement": async (job, context) => {
    const result = await context.backend.post(
      "/admin/reconciliation/statements",
      { lines: arrayVariable(job, "statementLines") },
      idempotencyKey(job, "ingest-statement"),
    );
    await record(job, context, "reconciliation.statement_ingested", { result });
    return { statementIngestResult: result };
  },

  "reconciliation.match-formance": async (job, context) => {
    const run = (await context.backend.post(
      "/reconciliation/runs",
      {
        from: stringVariable(job, "from"),
        to: stringVariable(job, "to"),
      },
      idempotencyKey(job, "match-formance"),
    )) as { runId: string; exceptionCount: number };
    await updateWorkflow(job, context, run.exceptionCount > 0 ? "manual_review" : "running", {
      reconciliationRunId: run.runId,
    });
    return { reconciliationRunId: run.runId, breakCount: run.exceptionCount };
  },

  "reconciliation.auto-reconcile": async (job, context) => {
    await record(job, context, "reconciliation.auto_reconciled", {
      reconciliationRunId: stringVariable(job, "reconciliationRunId"),
    });
    return {};
  },

  "reconciliation.create-formance-adjustment": async (job, context) => {
    await record(job, context, "reconciliation.adjustment_requested", {
      adjustmentReference: stringVariable(job, "adjustmentReference"),
    });
    return {};
  },

  "reconciliation.publish-status": async (job, context) => {
    await updateWorkflow(job, context, "completed");
    return { reconciliationStatus: "published" };
  },

  "exception.assign-queue": async (job, context) => {
    await updateWorkflow(job, context, "manual_review", {
      exceptionId: stringVariable(job, "exceptionId"),
    });
    await record(job, context, "exception.assigned", {
      operationsQueue: stringVariable(job, "operationsQueue") ?? "ops",
    });
    return {};
  },

  "exception.retry-payment": async (job, context) => {
    const paymentOrderId = requiredVariable(job, "paymentOrderId");
    await context.backend.post(
      `/payments/${paymentOrderId}/retry`,
      {},
      idempotencyKey(job, "retry-payment"),
    );
    return { exceptionActionResult: "retry_requested" };
  },

  "exception.cancel-payment": async (job, context) => {
    const paymentOrderId = requiredVariable(job, "paymentOrderId");
    await context.backend.post(
      `/payments/${paymentOrderId}/cancel`,
      { reason: stringVariable(job, "exceptionReason") ?? "Cancelled through exception workflow" },
      idempotencyKey(job, "cancel-payment"),
    );
    return { exceptionActionResult: "cancelled" };
  },

  "exception.amend-payment": async (job, context) => {
    await record(job, context, "exception.amendment_requested", {
      paymentOrderId: stringVariable(job, "paymentOrderId"),
    });
    return { exceptionActionResult: "amendment_recorded" };
  },

  "exception.escalate": async (job, context) => {
    await record(job, context, "exception.escalated", {
      escalationReason: stringVariable(job, "exceptionReason"),
    });
    return { exceptionActionResult: "escalated" };
  },

  "exception.record-action": async (job, context) => {
    await record(job, context, "exception.action_recorded", {
      exceptionAction: stringVariable(job, "exceptionAction"),
      exceptionActionResult: stringVariable(job, "exceptionActionResult"),
    });
    return {};
  },
};

async function updateWorkflow(
  job: CamundaJob,
  context: WorkerContext,
  status: string,
  correlationIds: Record<string, unknown> = {},
): Promise<void> {
  const workflowInstanceId = stringVariable(job, "workflowInstanceId");
  if (!workflowInstanceId) return;
  await context.backend.patch(
    `/workflows/${workflowInstanceId}`,
    {
      status,
      camundaProcessInstanceKey: job.processInstanceKey,
      correlationIds: {
        camundaProcessInstanceKey: job.processInstanceKey,
        ...correlationIds,
      },
    },
    idempotencyKey(job, `workflow-${status}`),
  );
}

async function record(
  job: CamundaJob,
  context: WorkerContext,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const workflowInstanceId = stringVariable(job, "workflowInstanceId");
  if (!workflowInstanceId) return;
  await context.backend.post(
    `/workflows/${workflowInstanceId}/audit`,
    {
      action,
      actorType: "worker",
      actorId: "camunda-worker",
      payload: {
        processInstanceKey: job.processInstanceKey,
        elementInstanceKey: job.elementInstanceKey,
        ...payload,
      },
    },
    idempotencyKey(job, `audit-${action}`),
  );
}

function idempotencyKey(job: CamundaJob, operation: string): string {
  return `camunda:${job.processInstanceKey}:${job.elementInstanceKey}:${operation}`;
}

function workflowMetadata(job: CamundaJob): Record<string, string> {
  return {
    camundaProcessInstanceKey: job.processInstanceKey,
    camundaElementInstanceKey: job.elementInstanceKey,
  };
}

function requiredVariable(job: CamundaJob, name: string): string {
  const value = stringVariable(job, name);
  if (!value) throw new Error(`Missing required workflow variable: ${name}`);
  return value;
}

function stringVariable(job: CamundaJob, name: string, fallback?: string): string | undefined {
  const value = job.variables[name];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function numberVariable(job: CamundaJob, name: string, fallback: number): number {
  const value = job.variables[name];
  return typeof value === "number" ? value : fallback;
}

function arrayVariable(job: CamundaJob, name: string): unknown[] {
  const value = job.variables[name];
  return Array.isArray(value) ? value : [];
}

function currencyFromAsset(asset: string): string {
  return asset.split("/")[0] ?? asset;
}
