// "formance_payments" is intentionally excluded — it belongs in adapter-specific storage, not the domain model.
export const providerBindingKinds = ["native_emi", "native_bank", "mock"] as const;

export type ProviderBindingKind = (typeof providerBindingKinds)[number];

export interface ProviderBinding {
  id: string;
  providerId: string;
  bindingKind: ProviderBindingKind;
  adapterKey: string;
  providerTenantReference?: string;
  active: boolean;
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
