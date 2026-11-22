const request = require('supertest');

jest.mock('../src/db', () => ({ query: jest.fn(), init: jest.fn() }));
const db = require('../src/db');
const app = require('../src/app');

beforeEach(() => db.query.mockReset());

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('GET /api/tasks returns the rows from the database', async () => {
  db.query.mockResolvedValue({ rows: [{ id: 1, title: 'Write docs', status: 'todo' }] });
  const res = await request(app).get('/api/tasks');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
});

test('POST /api/tasks rejects a missing title', async () => {
  const res = await request(app).post('/api/tasks').send({ description: 'no title' });
  expect(res.status).toBe(400);
});

test('POST /api/tasks creates a task', async () => {
  db.query.mockResolvedValue({ rows: [{ id: 2, title: 'Ship it', status: 'todo' }] });
  const res = await request(app).post('/api/tasks').send({ title: 'Ship it' });
  expect(res.status).toBe(201);
  expect(res.body.title).toBe('Ship it');
});

test('PATCH status rejects an invalid value', async () => {
  const res = await request(app).patch('/api/tasks/1/status').send({ status: 'nope' });
  expect(res.status).toBe(400);
});
