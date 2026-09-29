// Requests suite: ownership, authorization and the collection contract.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

test('a requester can create a request and becomes its owner', async () => {
  const owner = await createUser({ name: 'owner' });
  const token = await loginAs(owner);

  const created = await createRequestAs(token, { priority: 'high' });

  assert.equal(created.createdBy, owner.id);
  assert.equal(created.status, 'open');
  assert.equal(created.priority, 'high');
});

test('the owner can read their own request', async () => {
  const owner = await createUser({ name: 'reader' });
  const token = await loginAs(owner);
  const created = await createRequestAs(token);

  const response = await request(app)
    .get(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, created.id);
});

test('a requester cannot access another user request', async () => {
  // Prepare
  const owner = await createUser({ name: 'victim' });
  const stranger = await createUser({ name: 'stranger' });
  const ownerToken = await loginAs(owner);
  const strangerToken = await loginAs(stranger);
  const savedRequest = await createRequestAs(ownerToken);

  // Act
  const response = await request(app)
    .get(`/requests/${savedRequest.id}`)
    .set('Authorization', `Bearer ${strangerToken}`);

  // Check
  assert.equal(response.status, 404);
});

test('the collection requires a Bearer token', async () => {
  const response = await request(app).get('/requests');
  assert.equal(response.status, 401);
});

test('a requester cannot change the priority, even of their own request', async () => {
  const owner = await createUser({ name: 'nopriority' });
  const token = await loginAs(owner);
  const created = await createRequestAs(token);

  const response = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ priority: 'low' });

  assert.equal(response.status, 403);
});

test('an agent can move a request through a valid transition', async () => {
  const owner = await createUser({ name: 'transowner' });
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  const response = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ status: 'in_progress' });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'in_progress');
});

// ── BUG-106 regression test ────────────────────────────────────────────
// A valid filter with zero matches is an EMPTY COLLECTION, not a missing
// resource. This test pins that decision so it cannot silently regress.
test('returns an empty array when a valid filter has no matches', async () => {
  const loner = await createUser({ name: 'loner' });
  const token = await loginAs(loner);

  const response = await request(app)
    .get('/requests?status=closed')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

// ── INC-701 regression test ────────────────────────────────────────────
test('rejects non-numeric request id with 400 INVALID_REQUEST_ID', async () => {
  const user = await createUser({ name: 'invalidid' });
  const token = await loginAs(user);

  const response = await request(app)
    .get('/requests/not-a-number')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_ID');
});

test('rejects zero id with 400 INVALID_REQUEST_ID', async () => {
  const user = await createUser({ name: 'zeroid' });
  const token = await loginAs(user);

  const response = await request(app)
    .get('/requests/0')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_ID');
});

test('returns 404 REQUEST_NOT_FOUND for valid but non-existent id', async () => {
  const user = await createUser({ name: 'missingid' });
  const token = await loginAs(user);

  const response = await request(app)
    .get('/requests/999999999')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'REQUEST_NOT_FOUND');
});
