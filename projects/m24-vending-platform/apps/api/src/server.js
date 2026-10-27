import 'dotenv/config';
import { createApp } from './app.js';
import { readConfig } from './config.js';
import { createPool } from './database/pool.js';
import { createPublicCatalogService } from './modules/machines/public-catalog.service.js';
import { createPublicCatalogStore } from './modules/machines/public-catalog.store.js';

const config = readConfig();
const database = createPool(config.databaseUrl);
const catalogStore = createPublicCatalogStore(database);
const catalogService = createPublicCatalogService({ store: catalogStore });
const app = createApp({
  publicCatalogService: catalogService,
  checkDatabase: async () => {
    await database.query('SELECT 1');
  }
});

const server = app.listen(config.port, () => {
  console.info(JSON.stringify({
    event: 'api_started',
    port: config.port,
    environment: config.nodeEnv
  }));
});

function shutdown(signal) {
  server.close((serverError) => {
    database.end().then(() => {
      if (serverError) {
        console.error(JSON.stringify({ event: 'server_shutdown_failed', signal }));
        process.exitCode = 1;
      }
    }).catch(() => {
      console.error(JSON.stringify({ event: 'database_shutdown_failed', signal }));
      process.exitCode = 1;
    });
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
