/**
 * Minimal Airwallex authentication probe.
 * Run: node --experimental-strip-types scripts/airwallex-auth-probe.ts
 *
 * Reads AIRWALLEX_BASE_URL, AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY from env.
 * Does nothing but authenticate and print the token metadata.
 * No payment or account operations.
 */

const baseUrl = (process.env.AIRWALLEX_BASE_URL ?? "https://api-demo.airwallex.com").replace(/\/+$/, "");
const clientId = process.env.AIRWALLEX_CLIENT_ID;
const apiKey = process.env.AIRWALLEX_API_KEY;
const loginAs = process.env.AIRWALLEX_LOGIN_AS;

if (!clientId || !apiKey) {
  console.error("AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY must be set");
  process.exit(1);
}

console.log(`Endpoint : ${baseUrl}`);
console.log(`Client ID: ${clientId}`);
console.log(`Login-As : ${loginAs || "(not set)"}`);
console.log("");

const headers: Record<string, string> = {
  "Content-Type": "application/json",
  "x-client-id": clientId,
  "x-api-key": apiKey,
};
if (loginAs) headers["x-login-as"] = loginAs;

const response = await fetch(`${baseUrl}/api/v1/authentication/login`, {
  method: "POST",
  headers,
});

const body = await response.json();

if (!response.ok) {
  console.error(`Auth FAILED  HTTP ${response.status}`);
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

const token: string = body.token ?? "";
const expiresAt: string = body.expires_at ?? body.expiresAt ?? "(not returned)";

console.log(`Auth OK`);
console.log(`Token    : ${token.slice(0, 12)}...${token.slice(-6)} (${token.length} chars)`);
console.log(`Expires  : ${expiresAt}`);

// Step 3 probe: attempt to read account and balance — report what scopes exist.
// No writes, no payments.
console.log("\n--- Scope probe (read-only) ---");

async function probe(label: string, path: string, tok: string) {
  const r = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
  });
  const b = await r.json().catch(() => ({}));
  const summary = r.ok
    ? `OK ${r.status}`
    : `${r.status} ${(b as Record<string, unknown>).code ?? ""} — ${(b as Record<string, unknown>).message ?? ""}`;
  console.log(`  ${label.padEnd(30)} ${summary}`);
  return r.ok ? b : null;
}

await probe("GET /accounts/me",        "/api/v1/accounts/me",          token);
await probe("GET /balances",           "/api/v1/balances",             token);
await probe("GET /transfers (list)",   "/api/v1/transfers?page_num=0&page_size=1", token);
await probe("GET /beneficiaries",      "/api/v1/beneficiaries?page_num=0&page_size=10", token);
