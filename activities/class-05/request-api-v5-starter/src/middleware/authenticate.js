// ============================================================================
// STARTER NOTE — Station 5.
// Authentication middleware: establishes WHO the actor is, nothing more.
// What the actor may DO is authorization and lives in the module policies.
// ============================================================================
import { AppError } from '../app-error.js';
import { respondError } from '../http/respond-error.js';
import { verifyToken } from '../modules/auth/token.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('auth', 'AUTHENTICATION_REQUIRED', 'Authentication token is required.');
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      throw new AppError('auth', 'AUTHENTICATION_REQUIRED', 'Authentication token is required.');
    }

    const payload = await verifyToken(token);

    req.auth = {
      userId: payload.sub,
      role: payload.role
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return respondError(res, error);
    }
    return respondError(res, new AppError('auth', 'INVALID_TOKEN', 'Authentication token is invalid or expired.'));
  }
}
