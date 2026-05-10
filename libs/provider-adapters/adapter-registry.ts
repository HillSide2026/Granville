import type { ProviderBinding } from "../contracts/provider.ts";
import { FormancePaymentsWrapperAdapter } from "./formance-payments-wrapper.ts";
import type { PaymentAccountProvider } from "./interfaces/index.ts";
import { MockBankProvider, MockEmiProvider } from "./mock/index.ts";
import { NativeEmiProvider } from "./native-emi-provider.ts";

export class ProviderAdapterRegistry {
  adapters = new Map<string, (binding: ProviderBinding) => PaymentAccountProvider>();

  constructor() {
    this.register("mock-emi", () => new MockEmiProvider());
    this.register("mock-bank", () => new MockBankProvider());
    this.register("native-emi", () => new NativeEmiProvider());
    this.register(
      "formance-payments",
      (binding) => new FormancePaymentsWrapperAdapter(binding.formanceConnectorId),
    );
  }

  register(
    adapterKey: string,
    factory: (binding: ProviderBinding) => PaymentAccountProvider,
  ): void {
    this.adapters.set(adapterKey, factory);
  }

  resolve(binding: ProviderBinding): PaymentAccountProvider {
    const factory = this.adapters.get(binding.adapterKey);
    if (!factory) {
      throw new Error(`No provider adapter registered for ${binding.adapterKey}`);
    }
    return factory(binding);
  }
}
