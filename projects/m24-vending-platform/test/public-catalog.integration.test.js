import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/database/pool.js';
import { createPublicCatalogStore } from '../apps/api/src/modules/machines/public-catalog.store.js';

test('PostgreSQL catalog queries remain scoped to the requested machine and tenant', {
  skip: !process.env.M24_TEST_DATABASE_URL && 'Set M24_TEST_DATABASE_URL to a disposable database with migrations and seed.'
}, async () => {
  const database = createPool(process.env.M24_TEST_DATABASE_URL);
  try {
    const store = createPublicCatalogStore(database);
    const catalogA = await store.findByPublicCode('demo-machine-a');
    const catalogB = await store.findByPublicCode('demo-machine-b');

    assert.equal(catalogA.machine.name, 'Demo Machine A');
    assert.deepEqual(catalogA.items.map((item) => item.product.name), ['Water A']);
    assert.equal(catalogB.machine.name, 'Demo Machine B');
    assert.deepEqual(catalogB.items.map((item) => item.product.name), ['Water B']);
  } finally {
    await database.end();
  }
});
