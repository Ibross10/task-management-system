import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
let tempDir;
let app;
beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'taskflow-test-'));
  process.env.TASKFLOW_DB = path.join(tempDir, 'db.json');
  vi.resetModules();
  ({ app } = await import('../server/index.js'));
});
afterEach(async () => {
  delete process.env.TASKFLOW_DB;
  await fs.rm(tempDir, { recursive: true, force: true });
});
const task = { title: 'Write tests', description: 'API coverage', category: 'Study', priority: 'high', dueDate: '2026-12-01', completed: false };
describe('Task REST API', () => {
  it('supports GET, POST, PUT, PATCH and DELETE', async () => {
    expect((await request(app).get('/api/health')).status).toBe(200);
    expect((await request(app).get('/api/tasks')).body.tasks).toHaveLength(0);
    const created = await request(app).post('/api/tasks').send(task).expect(201);
    const id = created.body.task.id;
    expect((await request(app).get('/api/tasks')).body.tasks).toHaveLength(1);
    await request(app).put(`/api/tasks/${id}`).send({ ...task, title: 'Revised title' }).expect(200);
    const patched = await request(app).patch(`/api/tasks/${id}`).send({ completed: true }).expect(200);
    expect(patched.body.task.completed).toBe(true);
    await request(app).delete(`/api/tasks/${id}`).expect(200);
    await request(app).delete(`/api/tasks/${id}`).expect(404);
  });
  it('rejects empty titles and invalid priorities', async () => {
    await request(app).post('/api/tasks').send({ ...task, title: ' ' }).expect(400);
    await request(app).post('/api/tasks').send({ ...task, priority: 'urgent' }).expect(400);
    expect((await request(app).get('/api/tasks')).body.tasks).toHaveLength(0);
  });
  it('returns 404 for updates to unknown tasks', async () => {
    await request(app).patch('/api/tasks/not-found').send({ completed: true }).expect(404);
  });
  it('persists tasks between requests', async () => {
    await request(app).post('/api/tasks').send(task).expect(201);
    const list = await request(app).get('/api/tasks').expect(200);
    expect(list.body.tasks[0].title).toBe(task.title);
  });
});