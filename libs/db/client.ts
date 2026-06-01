import pg from "pg";

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
