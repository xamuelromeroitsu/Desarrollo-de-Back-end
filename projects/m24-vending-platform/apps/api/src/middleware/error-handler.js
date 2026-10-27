import { AppError } from '../shared/app-error.js';

export function createErrorHandler({ logger = console } = {}) {
  return function errorHandler(error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof AppError) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message },
        requestId: req.requestId
      });
    }

    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' },
        requestId: req.requestId
      });
    }

    logger.error(JSON.stringify({
      event: 'unexpected_api_error',
      requestId: req.requestId,
      errorName: error.name ?? 'Error'
    }));

    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      requestId: req.requestId
    });
  };
}
