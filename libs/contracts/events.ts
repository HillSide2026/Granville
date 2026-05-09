export const granvilleDomainEventTypes = [
  "customer.created",
  "customer.updated",
  "payment_account.created",
  "payment_order.created",
  "payment_order.routed",
  "payment_attempt.created",
  "payment_attempt.updated",
  "provider.webhook.received",
  "provider.webhook.processed",
  "ledger.posting.queued",
  "ledger.posted",
  "reconciliation.run.started",
  "reconciliation.run.completed",
  "reconciliation.exception.created",
  "audit.event.created",
] as const;

export type GranvilleDomainEventType =
  (typeof granvilleDomainEventTypes)[number];

export interface GranvilleDomainEvent<TPayload = unknown> {
  id: string;
  type: GranvilleDomainEventType;
  aggregateType: string;
  aggregateId: string;
  occurredAt: string;
  payload: TPayload;
}
