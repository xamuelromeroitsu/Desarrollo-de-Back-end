import { AppError } from '../../shared/app-error.js';

const PUBLIC_CODE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,63}$/;

export function createPublicCatalogService({ store }) {
  return {
    async getCatalog(publicCode) {
      if (typeof publicCode !== 'string' || !PUBLIC_CODE_PATTERN.test(publicCode)) {
        throw new AppError(400, 'INVALID_PUBLIC_CODE', 'The public machine code is invalid.');
      }

      const catalog = await store.findByPublicCode(publicCode);
      if (!catalog) {
        throw new AppError(404, 'MACHINE_NOT_FOUND', 'The requested machine was not found.');
      }

      return catalog;
    }
  };
}
