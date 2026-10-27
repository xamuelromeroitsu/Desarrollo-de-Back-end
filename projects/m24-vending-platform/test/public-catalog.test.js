import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../apps/api/src/app.js';
import { createPublicCatalogService } from '../apps/api/src/modules/machines/public-catalog.service.js';

const logger = { error() {} };

function createTestApp(catalogs, checkDatabase = async () => {}) {
  const calls = [];
  const store = {
    async findByPublicCode(publicCode) {
      calls.push(publicCode);
      return catalogs[publicCode] ?? null;
    }
  };
  const service = createPublicCatalogService({ store });
  return {
    app: createApp({ publicCatalogService: service, checkDatabase, logger }),
    calls
  };
}

test('health is independent from database readiness', async () => {
  const { app } = createTestApp({}, async () => {
    throw Object.assign(new Error('database unavailable'), { code: 'ECONNREFUSED' });
  });

  await request(app).get('/health').expect(200, { status: 'ok' });
  await request(app).get('/ready').expect(503, {
    status: 'not_ready',
    database: 'unavailable'
  });
});

test('public catalog returns only the machine selected by its public code', async () => {
  const { app, calls } = createTestApp({
    'demo-machine-a': {
      machine: { publicCode: 'demo-machine-a', name: 'Machine A' },
      items: [{ product: { name: 'Product A' }, availableQuantity: 3 }]
    },
    'demo-machine-b': {
      machine: { publicCode: 'demo-machine-b', name: 'Machine B' },
      items: [{ product: { name: 'Product B' }, availableQuantity: 4 }]
    }
  });

  const responseA = await request(app)
    .get('/api/v1/public/machines/demo-machine-a/catalog')
    .expect(200);
  const responseB = await request(app)
    .get('/api/v1/public/machines/demo-machine-b/catalog')
    .expect(200);

  assert.equal(responseA.body.data.machine.name, 'Machine A');
  assert.equal(responseA.body.data.items[0].product.name, 'Product A');
  assert.equal(responseB.body.data.machine.name, 'Machine B');
  assert.equal(responseB.body.data.items[0].product.name, 'Product B');
  assert.deepEqual(calls, ['demo-machine-a', 'demo-machine-b']);
});

test('invalid and unknown public codes do not return catalog data', async () => {
  const { app } = createTestApp({});

  await request(app)
    .get('/api/v1/public/machines/ab/catalog')
    .expect(400)
    .expect((response) => {
      assert.equal(response.body.error.code, 'INVALID_PUBLIC_CODE');
    });
  await request(app)
    .get('/api/v1/public/machines/does-not-exist/catalog')
    .expect(404)
    .expect((response) => {
      assert.equal(response.body.error.code, 'MACHINE_NOT_FOUND');
    });
});

test('catalog response includes a request id and is not cached', async () => {
  const { app } = createTestApp({
    'demo-machine-a': {
      machine: { publicCode: 'demo-machine-a', name: 'Machine A' },
      items: []
    }
  });

  const response = await request(app)
    .get('/api/v1/public/machines/demo-machine-a/catalog')
    .expect(200);

  assert.ok(response.headers['x-request-id']);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.body.requestId, undefined);
});
