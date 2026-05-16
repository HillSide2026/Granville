import { createPool } from "../../../libs/db/client.ts";
import { runGranvilleMigrations } from "../../../libs/db/migrate.ts";
import { PostgresGranvilleStore } from "../../../libs/persistence/src/postgres-store.ts";
import { GranvilleApi } from "./granville-api.ts";
import { createGranvilleServer, GranvilleHttpControllers } from "./http.ts";

const port = Number(process.env.PORT ?? 8080);

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const client = databaseUrl ? createPool(databaseUrl) : undefined;
  if (client && process.env.GRANVILLE_AUTO_MIGRATE === "1") {
    await runGranvilleMigrations(client, { includeSeeds: true });
  }
  const store = client ? await PostgresGranvilleStore.initialize(client) : undefined;
  const api = new GranvilleApi(store);
  const server = createGranvilleServer(new GranvilleHttpControllers(api));
  server.listen(port, () => {
    const mode = databaseUrl ? "postgres" : "in-memory";
    process.stdout.write(`granville-api listening on port ${port} [${mode}]\n`);
  });
}

main().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
