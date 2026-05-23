import type { ProviderBinding } from "../../contracts/provider.ts";
import type {
  AirwallexBeneficiaryPayload,
  AirwallexPayoutPayload,
  AirwallexTransfer,
} from "./airwallex-mapping.ts";

export interface AirwallexConfig {
  baseUrl: string;
  clientId?: string;
  apiKey?: string;
  webhookSecret?: string;
  loginAs?: string;
  dryRun: boolean;
}

export interface AirwallexAccessToken {
  token: string;
  expiresAt?: string;
}

export interface AirwallexBeneficiary {
  id: string;
  beneficiary?: Record<string, unknown>;
  transfer_methods?: string[];
}

export interface AirwallexBalance {
  currency: string;
  total_amount: string | number;
  available_amount: string | number;
  pending_amount?: string | number;
  updated_at?: string;
}

export class AirwallexApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly transient: boolean;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AirwallexApiError";
    this.status = status;
    this.code = code;
    this.transient = status === 429 || status === 503 || status === 502 || status === 504;
  }
}

type FetchLike = typeof fetch;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return defaultValue;
  return !["0", "false", "no", "off"].includes(value.toLowerCase());
}

export function airwallexConfigFromBinding(binding?: ProviderBinding): AirwallexConfig {
  const config = binding?.config ?? {};
  const baseUrl =
    asString(config.baseUrl) ??
    asString(config.apiBaseUrl) ??
    process.env.AIRWALLEX_BASE_URL ??
    "https://api-demo.airwallex.com";

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    clientId: asString(config.clientId) ?? process.env.AIRWALLEX_CLIENT_ID,
    apiKey: asString(config.apiKey) ?? process.env.AIRWALLEX_API_KEY,
    webhookSecret: asString(config.webhookSecret) ?? process.env.AIRWALLEX_WEBHOOK_SECRET,
    loginAs: asString(config.loginAs) ?? process.env.AIRWALLEX_LOGIN_AS,
    dryRun: asBoolean(config.dryRun ?? process.env.AIRWALLEX_DRY_RUN, true),
  };
}

export class AirwallexClient {
  readonly config: AirwallexConfig;
  readonly fetcher: FetchLike;
  #accessToken?: AirwallexAccessToken;

  constructor(config: AirwallexConfig, fetcher: FetchLike = fetch) {
    this.config = config;
    this.fetcher = fetcher;
  }

  async authenticate(): Promise<AirwallexAccessToken> {
    if (this.#accessToken && !this.#isExpired(this.#accessToken)) {
      return this.#accessToken;
    }
    if (!this.config.clientId || !this.config.apiKey) {
      throw new Error("Airwallex credentials are not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-client-id": this.config.clientId,
      "x-api-key": this.config.apiKey,
    };
    if (this.config.loginAs) {
      headers["x-login-as"] = this.config.loginAs;
    }

    const response = await this.fetcher(`${this.config.baseUrl}/api/v1/authentication/login`, {
      method: "POST",
      headers,
    });
    const body = await parseJson(response);
    if (!response.ok) {
      throw new AirwallexApiError(
        response.status,
        `Airwallex authentication failed: ${response.status} ${summarizeError(body)}`,
        asString(body.code),
      );
    }
    const token = asString(body.token);
    if (!token) {
      throw new Error("Airwallex authentication response did not include a token");
    }

    this.#accessToken = {
      token,
      expiresAt: asString(body.expires_at) ?? asString(body.expiresAt),
    };
    return this.#accessToken;
  }

  async createBeneficiary(payload: AirwallexBeneficiaryPayload): Promise<AirwallexBeneficiary> {
    return this.#request<AirwallexBeneficiary>("/api/v1/beneficiaries/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async createPayout(payload: AirwallexPayoutPayload): Promise<AirwallexTransfer> {
    return this.#request<AirwallexTransfer>("/api/v1/transfers/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getPayoutStatus(transferId: string): Promise<AirwallexTransfer> {
    return this.#request<AirwallexTransfer>(`/api/v1/transfers/${transferId}`);
  }

  async getBalances(): Promise<AirwallexBalance[]> {
    const response = await this.#request<{ items?: AirwallexBalance[] } | AirwallexBalance[]>(
      "/api/v1/balances",
    );
    if (Array.isArray(response)) return response;
    return (response as { items?: AirwallexBalance[] }).items ?? [];
  }

  async syncTransactions(
    filter: { from?: string; to?: string } = {},
  ): Promise<AirwallexTransfer[]> {
    const params = new URLSearchParams();
    if (filter.from) params.set("from_created_at", filter.from);
    if (filter.to) params.set("to_created_at", filter.to);
    const suffix = params.size > 0 ? `?${params.toString()}` : "";
    const response = await this.#request<{
      items?: AirwallexTransfer[];
      transfers?: AirwallexTransfer[];
    }>(`/api/v1/transfers${suffix}`);
    return response.items ?? response.transfers ?? [];
  }

  #isExpired(accessToken: AirwallexAccessToken): boolean {
    if (!accessToken.expiresAt) return false;
    return Date.parse(accessToken.expiresAt) <= Date.now() + 60_000;
  }

  async #request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const accessToken = await this.authenticate();
    const response = await this.fetcher(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.token}`,
        ...(init.headers as Record<string, string> | undefined),
      },
    });
    const body = await parseJson(response);
    if (!response.ok) {
      throw new AirwallexApiError(
        response.status,
        `Airwallex request failed: ${response.status} ${summarizeError(body)}`,
        asString(body.code),
      );
    }
    return body as T;
  }
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  const body = await response.text();
  if (!body) return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return { message: body };
  }
}

function summarizeError(body: Record<string, unknown>): string {
  const base = asString(body.message) ?? asString(body.error) ?? JSON.stringify(body);
  if (body.errors) return `${base} — ${JSON.stringify(body.errors)}`;
  return base;
}
