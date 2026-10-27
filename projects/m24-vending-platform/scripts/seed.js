import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readConfig } from '../apps/api/src/config.js';
import { createPool } from '../apps/api/src/database/pool.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const seedFile = join(scriptDirectory, '..', 'database', 'seed', 'demo.sql');
const config = readConfig();
const pool = createPool(config.databaseUrl);

try {
  const sql = await readFile(seedFile, 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  console.info('Demo seed applied.');
} catch (error) {
  console.error(`Seed failed (${error.code ?? error.name}).`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
