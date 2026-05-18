export const counterpartyKinds = ["individual", "business"] as const;

export type CounterpartyKind = (typeof counterpartyKinds)[number];

export interface Counterparty {
  id: string;
  displayName: string;
  kind: CounterpartyKind;
  externalRef?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
