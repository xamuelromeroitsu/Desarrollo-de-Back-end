// ============================================================================
// STARTER NOTE — Stations 2, 3 and 4 live here.
//
// Contracts to honor (see docs/http-contract.md and your auth-contract.md):
//
//   register(body) -> { id, email, role: 'requester', createdAt }
//   login(body) -> { accessToken, tokenType: 'Bearer', expiresIn: <seconds> }
// ============================================================================
import { AppError } from '../../app-error.js';
import {
  hashPassword,
  verifyPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from './password.js';
import { issueToken, TOKEN_TTL_SECONDS } from './token.js';
import { findByEmail, findById, insertUser } from '../users/users.store.js';
import { mapUserRow } from '../users/user.mapper.js';

export async function register(body) {
  // 1. Allowlist validation: reject any unauthorized fields (server-controlled fields).
  const allowedKeys = ['email', 'password'];
  const bodyKeys = Object.keys(body ?? {});
  const hasInvalidKeys = bodyKeys.some((key) => !allowedKeys.includes(key));

  if (hasInvalidKeys) {
    throw new AppError(
      'contract',
      'SERVER_CONTROLLED_FIELD',
      'The register allowlist: only email and password may arrive.'
    );
  }

  const { email, password } = body ?? {};

  // 2. Email validation and normalization (trim + lowercase).
  if (!email || typeof email !== 'string') {
    throw new AppError('contract', 'INVALID_EMAIL', 'Email and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    throw new AppError('contract', 'INVALID_EMAIL', 'Invalid email format.');
  }

  // 3. Password validation (length between 15 and 128 characters).
  if (
    !password ||
    typeof password !== 'string' ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    throw new AppError(
      'contract',
      'INVALID_PASSWORD',
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
    );
  }

  // 4. Hashing password securely with scrypt (Station 3).
  const passwordHash = await hashPassword(password);

  // 5. Persistence and duplicate handling (PostgreSQL error '23505' -> 409).
  try {
    const row = await insertUser({ email: normalizedEmail, passwordHash });
    return mapUserRow(row);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError(
        'domain',
        'ACCOUNT_CANNOT_BE_CREATED',
        'The account cannot be created with the supplied information.'
      );
    }
    throw error;
  }
}

export async function login(body) {
  const { email, password } = body ?? {};

  // Generic credential error to prevent account enumeration (anti-enumeración).
  // Error genérico de credenciales para prevenir enumeración de cuentas.
  const invalidCredentialsError = new AppError(
    'auth',
    'INVALID_CREDENTIALS',
    'Email or password is incorrect.'
  );

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    throw invalidCredentialsError;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findByEmail(normalizedEmail);

  if (!user) {
    throw invalidCredentialsError;
  }

  // Verify password against stored scrypt hash.
  // Verificar contraseña contra el hash scrypt almacenado.
  const isPasswordValid = await verifyPassword(password, user.passwordHash ?? user.password_hash);

  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }

  // Issue JWT access token.
  // Emitir token de acceso JWT.
  const accessToken = await issueToken(user);

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: TOKEN_TTL_SECONDS
  };
}

export async function getCurrentUser(actor) {
  // TODO (station 5): load the user behind actor.userId and answer only
  // id, email and role.
  throw new Error('TODO: getCurrentUser is not implemented yet.');
}
