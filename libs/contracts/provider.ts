export const providerKinds = ["emi", "bank", "psp", "mock"] as const;

export type ProviderKind = (typeof providerKinds)[number];

export interface Provider {
  id: string;
  code: string;
  displayName: string;
  kind: ProviderKind;
  stage: string;
  active: boolean;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export const providerBindingKinds = [
  "formance_payments",
  "native_emi",
  "native_bank",
  "mock",
] as const;

export type ProviderBindingKind = (typeof providerBindingKinds)[number];

export interface ProviderBinding {
  id: string;
  providerId: string;
  bindingKind: ProviderBindingKind;
  adapterKey: string;
  formanceConnectorId?: string;
  providerTenantReference?: string;
  active: boolean;
  config: Record<string, unknown>;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderCapability {
  id: string;
  providerId: string;
  capabilityKey: string;
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
