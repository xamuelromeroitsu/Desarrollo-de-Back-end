import { Router } from 'express';

export function createHealthRouter({ checkDatabase, logger = console }) {
  const router = Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/ready', async (req, res) => {
    try {
      await checkDatabase();
      res.status(200).json({ status: 'ready', database: 'available' });
    } catch (error) {
      logger.error(JSON.stringify({
        event: 'readiness_check_failed',
        requestId: req.requestId,
        code: error.code ?? 'UNKNOWN'
      }));
      res.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  return router;
}
