import pg from 'pg';

const { Pool } = pg;

export function createPool(connectionString) {
  const pool = new Pool({ connectionString });
  pool.on('error', (error) => {
    console.error(JSON.stringify({
      event: 'database_idle_client_error',
      code: error.code ?? 'UNKNOWN'
    }));
  });
  return pool;
}
