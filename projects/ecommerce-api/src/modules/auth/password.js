// =====================================================================
// EN: Password hashing wrapper. Kept isolated so the rest of the code
// never touches bcrypt details (rounds, salt) directly. Used by the seed
// script and later by the auth module (register/login).
//
// ES: Envoltorio del hash de contraseñas. Aislado para que el resto del
// código nunca toque detalles de bcrypt (rondas, salt) directamente. Lo
// usan el script de seed y más adelante el módulo de auth
// (register/login).
// =====================================================================

import bcrypt from 'bcrypt';

// EN: cost factor; 10 is the sensible default for demo APIs.
// ES: factor de costo; 10 es el default razonable para una API demo.
const ROUNDS = 10;

export function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS);
}