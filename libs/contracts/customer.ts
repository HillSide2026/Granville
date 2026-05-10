export const customerStatuses = ["created", "active", "restricted", "closed"] as const;

export type CustomerStatus = (typeof customerStatuses)[number];

export const customerTypes = ["individual", "business"] as const;

export type CustomerType = (typeof customerTypes)[number];

export interface Customer {
  id: string;
  externalReference?: string;
  type: CustomerType;
  status: CustomerStatus;
  legalName: string;
  email?: string;
  countryCode?: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
