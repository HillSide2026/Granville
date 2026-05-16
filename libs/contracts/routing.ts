export const paymentRails = [
  "internal_book",
  "faster_payments",
  "sepa",
  "swift",
  "ach",
  "wire",
  "unknown",
] as const;

export type PaymentRail = (typeof paymentRails)[number];

export interface RoutingDecisionInput {
  paymentOrderId: string;
  customerId: string;
  paymentAccountId: string;
  amount: string;
  asset: string;
  countryCode?: string;
  transactionType: string;
  customerSegment?: string;
  riskFlags: string[];
}

export interface RoutingDecision {
  providerBindingId: string;
  rail: PaymentRail;
  executionMode: "provider_runtime";
  rationale: string[];
  fallbackProviderBindingIds: string[];
}

export interface RoutingRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  active: boolean;
  conditions: Record<string, unknown>;
  outcome: {
    providerBindingId?: string;
    rail?: PaymentRail;
    executionMode?: "provider_runtime";
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutingRuleInput {
  name: string;
  description?: string;
  priority?: number;
  conditions: Record<string, unknown>;
  outcome: RoutingRule["outcome"];
}

export interface UpdateRoutingRuleInput {
  name?: string;
  description?: string;
  priority?: number;
  active?: boolean;
  conditions?: Record<string, unknown>;
  outcome?: RoutingRule["outcome"];
}
