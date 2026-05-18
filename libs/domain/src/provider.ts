export const providerKinds = ["emi", "bank", "psp", "mock"] as const;

export type ProviderKind = (typeof providerKinds)[number];

export interface Provider {
  id: string;
  code: string;
  displayName: string;
  kind: ProviderKind;
  stage: string;
  active: boolean;
  metadata: Record<string, unknown>;
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
