import { Router } from 'express';

export function createPublicCatalogRouter({ service }) {
  const router = Router();

  router.get('/machines/:publicCode/catalog', async (req, res) => {
    const catalog = await service.getCatalog(req.params.publicCode);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ data: catalog });
  });

  return router;
}
