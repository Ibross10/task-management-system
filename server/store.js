import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = process.env.TASKFLOW_DB || path.join(here, 'db.json');
let queue = Promise.resolve();

async function readDb() {
  try {
    const data = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
    if (!Array.isArray(data.tasks)) throw new Error('Invalid database structure');
    return data;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    const initial = { tasks: [] };
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}
async function writeDb(data) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  const temp = `${DB_PATH}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2));
  await fs.rename(temp, DB_PATH);
}
export async function listTasks() {
  const db = await readDb();
  return db.tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function createTask(task) {
  return withLock(async () => {
    const db = await readDb();
    const now = new Date().toISOString();
    const saved = { id: crypto.randomUUID(), ...task, createdAt: now, updatedAt: now };
    db.tasks.push(saved);
    await writeDb(db);
    return saved;
  });
}
export async function updateTask(id, changes, replace = false) {
  return withLock(async () => {
    const db = await readDb();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index < 0) return null;
    const next = replace ? { ...changes } : { ...db.tasks[index], ...changes };
    db.tasks[index] = { ...next, id, createdAt: db.tasks[index].createdAt, updatedAt: new Date().toISOString() };
    await writeDb(db);
    return db.tasks[index];
  });
}
export async function deleteTask(id) {
  return withLock(async () => {
    const db = await readDb();
    const before = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.id !== id);
    if (db.tasks.length === before) return false;
    await writeDb(db);
    return true;
  });
}
function withLock(fn) {
  const result = queue.then(fn, fn);
  queue = result.then(() => undefined, () => undefined);
  return result;
}