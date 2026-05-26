/**
 * Probe Airwallex API key write permissions.
 * Run: node --experimental-strip-types scripts/airwallex-permissions-probe.ts
 */

const baseUrl = (process.env.AIRWALLEX_BASE_URL ?? "https://api-demo.airwallex.com").replace(/\/+$/, "");
const clientId = process.env.AIRWALLEX_CLIENT_ID!;
const apiKey = process.env.AIRWALLEX_API_KEY!;

// Authenticate
const authRes = await fetch(`${baseUrl}/api/v1/authentication/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-client-id": clientId, "x-api-key": apiKey },
});
const { token } = await authRes.json() as { token: string };
if (!token) { console.error("Auth failed"); process.exit(1); }
console.log(`Auth OK\n`);

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function probe(label: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const b = await res.json().catch(() => ({})) as Record<string, unknown>;
  const status = res.ok ? `✅ ${res.status}` : `❌ ${res.status} ${b.code ?? ""} — ${b.message ?? ""}`;
  console.log(`${method.padEnd(6)} ${path.padEnd(40)} ${status}`);
  if (res.ok) console.log(`       Response keys: ${Object.keys(b).join(", ")}`);
}

// Test beneficiary create (minimal payload)
await probe(
  "POST /beneficiaries/create — write scope",
  "POST",
  "/api/v1/beneficiaries/create",
  {
    beneficiary: {
      type: "PERSONAL",
      entity_type: "PERSONAL",
      first_name: "Test",
      last_name: "Probe",
      address: { country_code: "GB" },
      bank_details: {
        account_currency: "GBP",
        account_name: "Test Probe",
        account_number: "12345678",
        account_routing_type1: "sort_code",
        account_routing_value1: "010203",
        bank_country_code: "GB",
      },
    },
    transfer_methods: ["LOCAL"],
  },
);

// Test transfer create would require a beneficiary ID — only do if above succeeded
