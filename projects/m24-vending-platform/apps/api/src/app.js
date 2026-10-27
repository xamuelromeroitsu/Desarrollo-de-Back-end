import express from 'express';
import { createErrorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { requestId } from './middleware/request-id.js';
import { createHealthRouter } from './modules/health/health.routes.js';
import { createPublicCatalogRouter } from './modules/machines/public-catalog.routes.js';

export function createApp({ publicCatalogService, checkDatabase, logger = console }) {
  if (!publicCatalogService || typeof checkDatabase !== 'function') {
    throw new Error('publicCatalogService and checkDatabase are required.');
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(requestId);
  app.use(express.json({ limit: '32kb' }));
  app.use(createHealthRouter({ checkDatabase, logger }));
  app.use('/api/v1/public', createPublicCatalogRouter({ service: publicCatalogService }));
  app.use(notFound);
  app.use(createErrorHandler({ logger }));

  return app;
}
