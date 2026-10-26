import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask, deleteTask, getTasks, patchTask, replaceTask, validateTask } from '../src/items.js';

beforeEach(() => { global.fetch = vi.fn(); });
function mockResponse(body, status = 200) { fetch.mockResolvedValue({ ok: status < 300, status, json: async () => body }); }

describe('task API module', () => {
  it('loads tasks with GET', async () => {
    mockResponse([{ id: '1', title: 'Read' }]);
    await expect(getTasks()).resolves.toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/tasks', expect.any(Object));
  });
  it('uses POST, PUT, PATCH and DELETE for task changes', async () => {
    mockResponse({ id: '1' }); await createTask({ title: 'Plan' });
    mockResponse({ id: '1' }); await replaceTask('1', { title: 'Edit' });
    mockResponse({ id: '1' }); await patchTask('1', { completed: true });
    fetch.mockResolvedValue({ ok: true, status: 204 }); await deleteTask('1');
    expect(fetch.mock.calls.map((call) => call[1].method)).toEqual(['POST', 'PUT', 'PATCH', 'DELETE']);
  });
  it('validates required task fields', () => {
    expect(validateTask({ title: '', category: 'School', dueDate: '2026-10-30' })).toMatch(/title/i);
    expect(validateTask({ title: 'Plan', category: '', dueDate: '2026-10-30' })).toMatch(/category/i);
    expect(validateTask({ title: 'Plan', category: 'School', dueDate: '' })).toMatch(/due date/i);
    expect(validateTask({ title: 'Plan', category: 'School', dueDate: '2026-10-30' })).toBe('');
  });
});