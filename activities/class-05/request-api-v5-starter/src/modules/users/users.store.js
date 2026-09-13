// ============================================================================
// STARTER NOTE — Station 2.
// Data access for users: parameterized queries, rows in/rows out, optional `db`.
// Acceso a datos para usuarios: consultas parametrizadas, filas de entrada/salida.
// ============================================================================
import { pool } from '../../database/pool.js';

export async function findByEmail(email, db = pool) {
  const result = await db.query(
    'SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findById(id, db = pool) {
  const result = await db.query(
    'SELECT id, email, password_hash, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertUser({ email, passwordHash }, db = pool) {
  const result = await db.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, password_hash, role, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
}
