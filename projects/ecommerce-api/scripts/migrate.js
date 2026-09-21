// =====================================================================
// EN: MIGRATION RUNNER. Applies every pending .sql file from
// database/migrations in lexicographic order (0001..0007), one
// transaction per migration, and remembers what was applied in the
// schema_migrations table — so running it twice is safe. It never drops
// tables and never re-runs an applied migration.
//
// ES: RUNNER DE MIGRACIONES. Aplica cada archivo .sql pendiente de
// database/migrations en orden lexicográfico (0001..0007), una
// transacción por migración, y recuerda lo aplicado en la tabla
// schema_migrations — así correrlo dos veces es seguro. Nunca borra
// tablas y nunca re-ejecuta una migración ya aplicada.
// =====================================================================

import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/database/pool.js';

// EN: absolute path to the migrations folder, independent of the current
// working directory.
// ES: ruta absoluta a la carpeta de migraciones, independiente del
// directorio de trabajo actual.
const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'database', 'migrations'
);

async function main() {
  console.log('DATABASE MIGRATIONS\n');

  // EN: the ledger: who remembers which changes were already applied.
  // ES: el ledger: quien recuerda qué cambios ya fueron aplicados.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // EN: every .sql file, sorted. Lexicographic order == dependency order
  // (0001 users -> 0007 indexes).
  // ES: todos los archivos .sql ordenados. El orden lexicográfico == orden
  // de dependencias (0001 users -> 0007 índices).
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const appliedResult = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(appliedResult.rows.map((row) => row.name));

  let pending = 0;
  for (const file of files) {
    // EN: already recorded in the ledger -> skip silently.
    // ES: ya registrado en el ledger -> se omite en silencio.
    if (applied.has(file)) {
      console.log(`[SKIPPED] ${file}`);
      continue;
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      // EN: one transaction per migration: it fully applies or fully rolls
      // back. The ledger row is written INSIDE the transaction, so a failed
      // migration is never recorded as applied.
      // ES: una transacción por migración: se aplica completa o revierte
      // completa. La fila del ledger se escribe DENTRO de la transacción,
      // así una migración fallida nunca queda registrada como aplicada.
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[APPLIED] ${file}`);
      pending += 1;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`\n[FAILED] ${file}`);
      console.error(`Reason: ${error.message}`);
      console.error('Rolled back: this migration left no partial changes.');
      process.exitCode = 1;
      return;
    } finally {
      client.release();
    }
  }

  console.log('');
  console.log(pending > 0 ? 'Database schema is ready.' : 'No pending migrations.');
}

try {
  await main();
} catch (error) {
  console.error('Migration runner error:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}