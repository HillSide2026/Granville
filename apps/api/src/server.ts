import { createPool } from "../../../libs/db/client.ts";
import { runGranvilleMigrations } from "../../../libs/db/migrate.ts";
import { PostgresGranvilleStore } from "../../../libs/persistence/src/postgres-store.ts";
import { GranvilleApi } from "./granville-api.ts";
import { createGranvilleServer, GranvilleHttpControllers } from "./http.ts";

const port = Number(process.env.PORT ?? 8080);

// Reconciliation runs on a schedule to surface exceptions automatically.
// Set GRANVILLE_RECONCILE_INTERVAL_MS=0 to disable background reconciliation.
const reconcileIntervalMs = Number(process.env.GRANVILLE_RECONCILE_INTERVAL_MS ?? 3_600_000); // 1 hour

// Aging pass escalates stale reconciliation exceptions (info → warning → critical).
// Set GRANVILLE_AGING_INTERVAL_MS=0 to disable.
const agingIntervalMs = Number(process.env.GRANVILLE_AGING_INTERVAL_MS ?? 900_000); // 15 minutes

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    process.stderr.write(`Missing required environment variable: ${name}\n`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const adminToken = requireEnv("GRANVILLE_ADMIN_TOKEN");
  const operatorToken = requireEnv("GRANVILLE_OPERATOR_TOKEN");

  const databaseUrl = process.env.DATABASE_URL;
  const client = databaseUrl ? createPool(databaseUrl) : undefined;
  if (client && process.env.GRANVILLE_AUTO_MIGRATE === "1") {
    await runGranvilleMigrations(client, { includeSeeds: true });
  }
  const store = client ? await PostgresGranvilleStore.initialize(client) : undefined;
  const api = new GranvilleApi(store);
  const server = createGranvilleServer(new GranvilleHttpControllers(api, { adminToken, operatorToken }));

  if (reconcileIntervalMs > 0) {
    setInterval(() => {
      try {
        const result = api.postReconciliationRun();
        process.stdout.write(
          `[reconciler] run complete — ${result.exceptionCount} exception(s)\n`,
        );
      } catch (err) {
        process.stderr.write(`[reconciler] run failed: ${err}\n`);
      }
    }, reconcileIntervalMs);
  }

  if (agingIntervalMs > 0) {
    setInterval(() => {
      try {
        api.adminRunAgingPass();
      } catch (err) {
        process.stderr.write(`[reconciler] aging pass failed: ${err}\n`);
      }
    }, agingIntervalMs);
  }

  server.listen(port, () => {
    const mode = databaseUrl ? "postgres" : "in-memory";
    process.stdout.write(`granville-api listening on port ${port} [${mode}]\n`);
    if (reconcileIntervalMs > 0) {
      process.stdout.write(
        `[reconciler] scheduled every ${reconcileIntervalMs / 60_000} min\n`,
      );
    }
  });
}

main().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
