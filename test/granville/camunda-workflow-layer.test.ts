import assert from "node:assert/strict";
import test from "node:test";

import { GranvilleHttpControllers } from "../../apps/api/src/http.ts";

const adminContext = {
  principal: {
    id: "dev-admin",
    roles: [
      "customer:read",
      "customer:write",
      "payment:read",
      "payment:write",
      "webhook:write",
      "reconciliation:read",
      "reconciliation:write",
      "admin:read",
      "admin:write",
    ],
  },
  idempotencyKey: "workflow-test-idempotency",
};

test("Camunda workflow tracking records correlations and audit trail", async () => {
  const controllers = new GranvilleHttpControllers();

  const started = await controllers.route(
    "POST",
    "/workflows",
    {
      workflowKind: "payment_initiation",
      bpmnProcessId: "granville-payment-initiation",
      businessKey: "payment:test-001",
      subjectType: "payment_order",
      subjectId: "payment-test-001",
      camundaProcessInstanceKey: "2251799813685250",
      correlationIds: {
        camundaProcessInstanceKey: "2251799813685250",
        internalPaymentRequestId: "payment-test-001",
      },
      metadata: {
        source: "test",
      },
    },
    adminContext,
  );

  assert.equal(started.statusCode, 201);
  const workflow = started.body as {
    id: string;
    status: string;
    correlationIds: Record<string, string>;
  };
  assert.equal(workflow.status, "running");
  assert.equal(workflow.correlationIds.internalPaymentRequestId, "payment-test-001");

  const updated = await controllers.route(
    "PATCH",
    `/workflows/${workflow.id}`,
    {
      status: "waiting_partner",
      correlationIds: {
        partnerReferenceId: "partner-ref-001",
      },
    },
    adminContext,
  );

  assert.equal(updated.statusCode, 200);
  assert.equal(
    (updated.body as { correlationIds: Record<string, string> }).correlationIds.partnerReferenceId,
    "partner-ref-001",
  );

  const audit = await controllers.route("GET", `/workflows/${workflow.id}/audit`, {}, adminContext);
  assert.equal(audit.statusCode, 200);
  assert.ok((audit.body as unknown[]).length >= 1);
});
