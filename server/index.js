import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listTasks, createTask, updateTask, deleteTask } from './store.js';

export const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json({ limit: '32kb' }));

const categories = new Set(['Personal', 'Work', 'Study', 'Health', 'Other']);
const priorities = new Set(['low', 'medium', 'high']);
const text = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Send task details as a JSON object.' };
  const title = text(body.title, 120);
  if (!title) return { error: 'Task name is required.' };
  const category = text(body.category, 40) || 'Personal';
  const priority = text(body.priority, 20) || 'medium';
  if (!categories.has(category)) return { error: 'Choose a valid category.' };
  if (!priorities.has(priority)) return { error: 'Choose a valid priority.' };
  const dueDate = text(body.dueDate, 10);
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: 'Due date must use YYYY-MM-DD format.' };
  return { value: { title, description: text(body.description, 500), category, priority, dueDate, completed: body.completed === true } };
}
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/tasks', async (_req, res, next) => {
  try { res.json({ tasks: await listTasks() }); } catch (e) { next(e); }
});
app.post('/api/tasks', async (req, res, next) => {
  const parsed = validate(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try { return res.status(201).json({ task: await createTask(parsed.value) }); } catch (e) { next(e); }
});
app.put('/api/tasks/:id', async (req, res, next) => {
  const parsed = validate(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const task = await updateTask(req.params.id, parsed.value, true);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    return res.json({ task });
  } catch (e) { next(e); }
});
app.patch('/api/tasks/:id', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'Send valid task changes.' });
  const patch = {};
  if ('completed' in req.body) {
    if (typeof req.body.completed !== 'boolean') return res.status(400).json({ error: 'Completed must be true or false.' });
    patch.completed = req.body.completed;
  }
  if ('title' in req.body) {
    const title = text(req.body.title, 120);
    if (!title) return res.status(400).json({ error: 'Task name is required.' });
    patch.title = title;
  }
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'No supported task changes were supplied.' });
  try {
    const task = await updateTask(req.params.id, patch);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    return res.json({ task });
  } catch (e) { next(e); }
});
app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const deleted = await deleteTask(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found.' });
    return res.json({ deleted: true, id: req.params.id });
  } catch (e) { next(e); }
});
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.resolve(here, '../dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientBuild, 'index.html'), error => {
      if (error) next(error);
    });
  });
}
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'The server could not complete the request. Please try again.' });
});
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => console.log(`TaskFlow API listening on http://localhost:${port}`));
}