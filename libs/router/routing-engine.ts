import type { ProviderBinding, ProviderCapability } from "../contracts/provider.ts";
import type { RoutingDecision, RoutingDecisionInput, RoutingRule } from "../contracts/routing.ts";
import type { ProviderHealth } from "../persistence/src/in-memory-store.ts";

export interface RoutingEngineOptions {
  rules?: RoutingRule[];
  providerBindings: ProviderBinding[];
  providerCapabilities?: ProviderCapability[];
  providerHealth?: ProviderHealth[];
}

export class RoutingEngine {
  rules: RoutingRule[];
  providerBindings: ProviderBinding[];
  providerCapabilities: ProviderCapability[];
  providerHealth: ProviderHealth[];

  constructor(options: RoutingEngineOptions) {
    this.rules = [...(options.rules ?? [])].sort((left, right) => left.priority - right.priority);
    this.providerBindings = options.providerBindings;
    this.providerCapabilities = options.providerCapabilities ?? [];
    this.providerHealth = options.providerHealth ?? [];
  }

  decide(input: RoutingDecisionInput): RoutingDecision {
    const matchingRule = this.rules.find((rule) => rule.active && this.matches(rule, input));
    const providerBindingId = matchingRule?.outcome.providerBindingId
      ? this.ensureRoutable(matchingRule.outcome.providerBindingId, input)
      : this.defaultProviderBindingId(input);
    const fallbackProviderBindingIds = this.providerBindings
      .filter(
        (binding) =>
          binding.active &&
          binding.id !== providerBindingId &&
          this.isHealthy(binding.id) &&
          this.supports(binding, input),
      )
      .sort((left, right) => this.fallbackPriority(left) - this.fallbackPriority(right))
      .map((binding) => binding.id);

    return {
      providerBindingId,
      rail: matchingRule?.outcome.rail ?? "internal_book",
      executionMode: "provider_runtime",
      rationale: matchingRule
        ? [`matched routing rule ${matchingRule.name}`]
        : ["selected healthiest capable provider binding"],
      fallbackProviderBindingIds,
    };
  }

  defaultProviderBindingId(input: RoutingDecisionInput): string {
    const binding = this.providerBindings
      .filter(
        (candidate) =>
          candidate.active && this.isHealthy(candidate.id) && this.supports(candidate, input),
      )
      .sort((left, right) => this.fallbackPriority(left) - this.fallbackPriority(right))[0];
    if (!binding) {
      throw new Error("No active provider binding available for routing");
    }
    return binding.id;
  }

  ensureRoutable(providerBindingId: string, input: RoutingDecisionInput): string {
    const binding = this.providerBindings.find((candidate) => candidate.id === providerBindingId);
    if (!binding?.active || !this.isHealthy(binding.id) || !this.supports(binding, input)) {
      return this.defaultProviderBindingId(input);
    }
    return providerBindingId;
  }

  matches(rule: RoutingRule, input: RoutingDecisionInput): boolean {
    return Object.entries(rule.conditions).every(([key, expected]) => {
      if (expected === undefined || expected === null) {
        return true;
      }
      return input[key as keyof RoutingDecisionInput] === expected;
    });
  }

  supports(binding: ProviderBinding, input: RoutingDecisionInput): boolean {
    const capabilities = this.providerCapabilities.filter(
      (capability) =>
        capability.providerId === binding.providerId &&
        capability.capabilityKey === "outbound_payments" &&
        capability.enabled,
    );
    if (capabilities.length === 0) {
      return true;
    }
    return capabilities.some((capability) => {
      const assets = arrayConfig(capability.config.assets);
      const countries = arrayConfig(capability.config.countries);
      const riskFlags = arrayConfig(capability.config.blockedRiskFlags);
      const assetOk = assets.length === 0 || assets.includes(input.asset);
      const countryOk =
        countries.length === 0 || !input.countryCode || countries.includes(input.countryCode);
      const riskOk = input.riskFlags.every((flag) => !riskFlags.includes(flag));
      return assetOk && countryOk && riskOk;
    });
  }

  isHealthy(providerBindingId: string): boolean {
    const health = this.providerHealth.find(
      (candidate) => candidate.providerBindingId === providerBindingId,
    );
    return !health || health.status === "healthy";
  }

  fallbackPriority(binding: ProviderBinding): number {
    const capability = this.providerCapabilities.find(
      (candidate) =>
        candidate.providerId === binding.providerId &&
        candidate.capabilityKey === "outbound_payments",
    );
    const priority = capability?.config.fallbackPriority;
    return typeof priority === "number" ? priority : 100;
  }
}

function arrayConfig(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
