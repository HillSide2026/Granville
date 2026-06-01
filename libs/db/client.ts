import pg from "pg";

// Return all timestamp types as ISO strings to match the in-memory store's string timestamps.
// pg parses OIDs 1082 (date), 1114 (timestamp), 1184 (timestamptz) as Date by default.
pg.types.setTypeParser(pg.types.builtins.DATE, (val: string) => val);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (val: string) => val);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (val: string) => new Date(val).toISOString());

export interface SqlClient {
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}

export interface CloseableSqlClient extends SqlClient {
  close(): Promise<void>;
}

export function createPool(databaseUrl: string, options?: { max?: number }): CloseableSqlClient {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: options?.max ?? 3 });
  return {
    query: (sql, params) => pool.query(sql, params as unknown[]),
    close: () => pool.end(),
  };
}
