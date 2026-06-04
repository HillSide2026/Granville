import type { BackendClient } from "./types.ts";

export class GranvilleBackendClient implements BackendClient {
  readonly baseUrl: string;
  readonly token: string;

  constructor(input: { baseUrl?: string; token?: string } = {}) {
    this.baseUrl = (
      input.baseUrl ??
      process.env.GRANVILLE_API_URL ??
      "http://localhost:8080"
    ).replace(/\/+$/, "");
    this.token = input.token ?? process.env.GRANVILLE_API_TOKEN ?? "dev-admin";
  }

  post(
    path: string,
    body: Record<string, unknown> = {},
    idempotencyKey?: string,
  ): Promise<unknown> {
    return this.request("POST", path, body, idempotencyKey);
  }

  patch(
    path: string,
    body: Record<string, unknown> = {},
    idempotencyKey?: string,
  ): Promise<unknown> {
    return this.request("PATCH", path, body, idempotencyKey);
  }

  get(path: string): Promise<unknown> {
    return this.request("GET", path);
  }

  async request(
    method: "GET" | "POST" | "PATCH",
    path: string,
    body?: Record<string, unknown>,
    idempotencyKey?: string,
  ): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      ...(method === "GET" ? {} : { body: JSON.stringify(body ?? {}) }),
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(`Granville API ${method} ${path} failed: ${response.status} ${text}`);
    }
    return payload;
  }
}
