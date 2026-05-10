export interface Money {
  amount: string;
  asset: string;
}

export const paymentAccountStatuses = ["created", "active", "suspended", "closed"] as const;

export type PaymentAccountStatus = (typeof paymentAccountStatuses)[number];

export const paymentAccountKinds = ["virtual", "settlement", "clearing", "external"] as const;

export type PaymentAccountKind = (typeof paymentAccountKinds)[number];

export interface PaymentAccount {
  id: string;
  customerId: string;
  providerBindingId: string;
  kind: PaymentAccountKind;
  status: PaymentAccountStatus;
  currencyCode?: string;
  countryCode?: string;
  displayName?: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
