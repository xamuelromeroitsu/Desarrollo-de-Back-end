// ============================================================================
// STARTER NOTE — Station 4 (guided).
// This module issues and verifies the workshop JWT using the `jose` library.
// Este módulo emite y verifica el JWT del taller usando la librería `jose`.
//
// Claims required / Claims requeridos:
//   sub  -> user id / id de usuario          iat -> issued at / emitido en
//   role -> requester | agent                exp -> iat + TOKEN_TTL_SECONDS (1 hour)
//   iss  -> backend-course-api               aud -> backend-course-client
//
// Rule: decoding lets you read; VERIFYING lets you trust.
// Regla: decodificar permite leer; VERIFICAR permite confiar.
// ============================================================================
import 'dotenv/config';
import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required.');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
const ALGORITHM = 'HS256';
const ISSUER = process.env.JWT_ISSUER ?? 'backend-course-api';
const AUDIENCE = process.env.JWT_AUDIENCE ?? 'backend-course-client';

export const TOKEN_TTL_SECONDS = Number(process.env.JWT_TTL_SECONDS ?? 3600);

export async function issueToken(user) {
  // Build and sign the JWT with mandatory claims.
  // Construir y firmar el JWT con los claims obligatorios.
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationTime = issuedAt + TOKEN_TTL_SECONDS;

  return await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: ALGORITHM, typ: 'JWT' })
    .setSubject(user.id)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expirationTime)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(SECRET_KEY);
}

export async function verifyToken(token) {
  // Verify signature, algorithm, issuer, audience, and expiry.
  // Verificar firma, algoritmo, emisor, audiencia y expiración.
  const { payload } = await jwtVerify(token, SECRET_KEY, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE
  });
  return payload;
}
