import pg from "pg";

export interface SqlClient {
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}

export function createPool(databaseUrl: string): SqlClient {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  return {
    query: (sql, params) => pool.query(sql, params as unknown[]),
  };
}
