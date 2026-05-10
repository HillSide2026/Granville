import { createHash } from "node:crypto";

import type { PaymentAccount } from "../../../libs/contracts/account.ts";
import type { Customer } from "../../../libs/contracts/customer.ts";
import type { PaymentAttempt, PaymentOrder } from "../../../libs/contracts/payment.ts";
import type {
  CreateCustomerInput,
  CreatePaymentAccountInput,
  CreatePaymentOrderInput,
  InMemoryGranvilleStore,
} from "../../../libs/persistence/src/in-memory-store.ts";
import { RoutingEngine } from "../../../libs/router/routing-engine.ts";

export interface CommandContext {
  idempotencyKey?: string;
}

export class GranvilleOrchestrator {
  store: InMemoryGranvilleStore;

  constructor(store: InMemoryGranvilleStore) {
    this.store = store;
  }

  createCustomer(input: CreateCustomerInput, context: CommandContext = {}): Customer {
    return this.store.withIdempotency(
      "customers.create",
      context.idempotencyKey,
      hash(input),
      () => {
        const customer = this.store.createCustomer(input);
        return {
          resourceType: "customer",
          resourceId: customer.id,
          response: customer,
        };
      },
    );
  }

  openPaymentAccount(
    input: Omit<CreatePaymentAccountInput, "providerBindingId"> & {
      providerBindingId?: string;
    },
    context: CommandContext = {},
  ): PaymentAccount {
    const providerBindingId = input.providerBindingId ?? this.store.getMockProviderBinding().id;
    return this.store.withIdempotency(
      "payment_accounts.create",
      context.idempotencyKey,
      hash({ ...input, providerBindingId }),
      () => {
        const account = this.store.createPaymentAccount({
          ...input,
          providerBindingId,
        });
        return {
          resourceType: "payment_account",
          resourceId: account.id,
          response: account,
        };
      },
    );
  }

  createPayment(input: CreatePaymentOrderInput, context: CommandContext = {}): PaymentOrder {
    return this.store.withIdempotency(
      "payments.create",
      context.idempotencyKey,
      hash(input),
      () => {
        const order = this.store.createPaymentOrder(input);
        return {
          resourceType: "payment_order",
          resourceId: order.id,
          response: order,
        };
      },
    );
  }

  submitPayment(paymentOrderId: string): {
    order: PaymentOrder;
    attempt: PaymentAttempt;
  } {
    const order = this.store.paymentOrders.get(paymentOrderId);
    if (!order) {
      throw new Error(`Unknown payment_order: ${paymentOrderId}`);
    }
    const account = this.store.paymentAccounts.get(order.paymentAccountId);
    if (!account) {
      throw new Error(`Unknown payment_account: ${order.paymentAccountId}`);
    }

    const router = new RoutingEngine({
      providerBindings: [...this.store.providerBindings.values()],
      providerCapabilities: [...this.store.providerCapabilities.values()],
      providerHealth: [...this.store.providerHealth.values()],
    });
    const decision = router.decide({
      paymentOrderId: order.id,
      customerId: order.customerId,
      paymentAccountId: order.paymentAccountId,
      amount: order.amount.amount,
      asset: order.amount.asset,
      countryCode: account.countryCode,
      transactionType: order.transactionType,
      riskFlags: [],
    });
    const attempt = this.store.createPaymentAttempt(order, decision.providerBindingId, {
      decision,
    });
    this.store.enqueueProviderCommand({
      commandType: "initiate_payment",
      paymentOrderId: order.id,
      paymentAttemptId: attempt.id,
      providerBindingId: attempt.providerBindingId,
      idempotencyKey: `provider:payment:${order.id}:attempt:${attempt.id}:initiate`,
      payload: {
        paymentOrderId: order.id,
        paymentAttemptId: attempt.id,
      },
    });

    return {
      order: this.store.paymentOrders.get(order.id) ?? order,
      attempt,
    };
  }

  cancelPayment(paymentOrderId: string, reason = "cancelled_by_request"): PaymentOrder {
    const order = this.store.paymentOrders.get(paymentOrderId);
    if (!order) {
      throw new Error(`Unknown payment_order: ${paymentOrderId}`);
    }
    if (order.status === "completed") {
      throw new Error("Completed payments cannot be cancelled");
    }
    const updated = this.store.updatePaymentOrder(paymentOrderId, {
      status: "cancelled",
      metadata: {
        ...order.metadata,
        cancellationReason: reason,
      },
    });
    this.store.audit("service", "payment_order.cancelled", "payment_order", paymentOrderId, {
      reason,
    });
    return updated;
  }

  retryPayment(paymentOrderId: string): {
    order: PaymentOrder;
    attempt: PaymentAttempt;
  } {
    const order = this.store.paymentOrders.get(paymentOrderId);
    if (!order) {
      throw new Error(`Unknown payment_order: ${paymentOrderId}`);
    }
    if (!["failed", "returned", "cancelled"].includes(order.status)) {
      throw new Error(`Payment ${paymentOrderId} is not retryable from ${order.status}`);
    }
    const reopened = this.store.updatePaymentOrder(paymentOrderId, {
      status: "created",
    });
    this.store.audit("service", "payment_order.retry_requested", "payment_order", paymentOrderId);
    return this.submitPayment(reopened.id);
  }

  markPaymentFailed(paymentAttemptId: string, error: string): PaymentAttempt {
    const attempt = this.store.paymentAttempts.get(paymentAttemptId);
    if (!attempt) {
      throw new Error(`Unknown payment_attempt: ${paymentAttemptId}`);
    }
    const updatedAttempt = this.store.updatePaymentAttempt(paymentAttemptId, {
      status: "failed",
      lastError: error,
      completedAt: new Date().toISOString(),
    });
    this.store.updatePaymentOrder(attempt.paymentOrderId, {
      status: "failed",
    });
    this.store.audit("service", "payment_attempt.failed", "payment_attempt", paymentAttemptId, {
      error,
    });
    return updatedAttempt;
  }
}

function hash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}
