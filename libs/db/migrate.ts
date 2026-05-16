import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createPool, type SqlClient } from "./client.ts";

const dbDir = dirname(fileURLToPath(import.meta.url));

export interface MigrationResult {
  migrationsApplied: string[];
  seedsApplied: string[];
}

export async function runGranvilleMigrations(
  client: SqlClient,
  options: { includeSeeds?: boolean } = {},
): Promise<MigrationResult> {
  const migrationsDir = join(dbDir, "migrations");
  const seedDir = join(dbDir, "seeds");
  const migrations = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();
  const seeds = options.includeSeeds
    ? (await readdir(seedDir)).filter((file) => file.endsWith(".sql")).sort()
    : [];

  for (const file of migrations) {
    await client.query(await readFile(join(migrationsDir, file), "utf8"));
  }

  for (const file of seeds) {
    await client.query(await readFile(join(seedDir, file), "utf8"));
  }

  return { migrationsApplied: migrations, seedsApplied: seeds };
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const client = createPool(databaseUrl);
  try {
    const result = await runGranvilleMigrations(client, { includeSeeds: true });
    process.stdout.write(
      `Applied ${result.migrationsApplied.length} migrations and ${result.seedsApplied.length} seed files\n`,
    );
  } finally {
    await client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
