// ============================================================================
// STARTER NOTE — Station 2.
// The single bridge between user rows and their HTTP representation.
// El único puente entre las filas de usuario y su representación HTTP.
// Contract: mapUserRow(row) -> { id, email, role, createdAt }
//
// The row carries password_hash, but the mapper drops it so it never leaks.
// La fila trae password_hash, pero el mapper lo omite para que nunca se filtre.
// ============================================================================
export function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at
  };
}
