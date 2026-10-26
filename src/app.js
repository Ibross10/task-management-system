import { createTask, deleteTask, getTasks, patchTask, replaceTask, validateTask } from './items.js';

const state = { tasks: [], editingId: null };
const byId = (id) => document.getElementById(id);
const form = byId('task-form');
const dialog = byId('task-dialog');

function setMessage(message, error = false) {
  const node = byId('message');
  node.textContent = message;
  node.style.color = error ? '#b42318' : '';
}
function visibleTasks() {
  const query = byId('search').value.trim().toLowerCase();
  const status = byId('status-filter').value;
  const priority = byId('priority-filter').value;
  const category = byId('category-filter').value;
  return state.tasks.filter((task) => {
    const searchable = `${task.title} ${task.description || ''}`.toLowerCase();
    return (!query || searchable.includes(query)) && (status === 'all' || (status === 'completed') === Boolean(task.completed)) && (priority === 'all' || task.priority === priority) && (category === 'all' || task.category === category);
  });
}
function render() {
  const tasks = visibleTasks();
  byId('task-list').innerHTML = tasks.map((task) => `<li class="task ${task.completed ? 'completed' : ''}"><input data-action="toggle" data-id="${task.id}" type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark ${task.title} complete"><div><h3>${task.title}</h3><p>${task.description || 'No description provided.'}</p><div class="task-meta"><span class="badge ${task.priority.toLowerCase()}">${task.priority}</span><span class="badge">${task.category}</span><span>Due ${task.dueDate}</span></div></div><div class="actions"><button data-action="edit" data-id="${task.id}" type="button">Edit</button><button data-action="delete" data-id="${task.id}" type="button">Delete</button></div></li>`).join('');
  byId('empty-state').hidden = tasks.length !== 0;
  byId('total-count').textContent = state.tasks.length;
  byId('active-count').textContent = state.tasks.filter((task) => !task.completed).length;
  byId('complete-count').textContent = state.tasks.filter((task) => task.completed).length;
  const categories = [...new Set(state.tasks.map((task) => task.category))];
  const select = byId('category-filter'); const selected = select.value;
  select.innerHTML = '<option value="all">All categories</option>' + categories.map((item) => `<option>${item}</option>`).join('');
  select.value = categories.includes(selected) ? selected : 'all';
}
async function loadTasks() {
  byId('loading').hidden = false;
  try { state.tasks = await getTasks(); render(); setMessage(''); } catch { setMessage('Could not load tasks. Start the JSON Server and try again.', true); } finally { byId('loading').hidden = true; }
}
function openDialog(task) {
  state.editingId = task?.id || null;
  byId('dialog-title').textContent = task ? 'Edit task' : 'Create a task'; byId('save-button').textContent = task ? 'Save changes' : 'Create task';
  byId('title').value = task?.title || ''; byId('description').value = task?.description || ''; byId('category').value = task?.category || 'General'; byId('priority').value = task?.priority || 'Medium'; byId('due-date').value = task?.dueDate || ''; byId('form-error').textContent = ''; dialog.showModal();
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const task = { title: byId('title').value.trim(), description: byId('description').value.trim(), category: byId('category').value.trim(), priority: byId('priority').value, dueDate: byId('due-date').value, completed: false };
  const invalid = validateTask(task); if (invalid) { byId('form-error').textContent = invalid; return; }
  try { if (state.editingId) { const original = state.tasks.find((item) => String(item.id) === String(state.editingId)); await replaceTask(state.editingId, { ...original, ...task, completed: original.completed }); setMessage('Task updated.'); } else { await createTask(task); setMessage('Task created.'); } dialog.close(); await loadTasks(); } catch { byId('form-error').textContent = 'The task could not be saved. Please try again.'; }
});
byId('new-task-button').addEventListener('click', () => openDialog()); byId('cancel-button').addEventListener('click', () => dialog.close()); byId('close-dialog').addEventListener('click', () => dialog.close());
['search', 'status-filter', 'priority-filter', 'category-filter'].forEach((id) => byId(id).addEventListener('input', render));
byId('task-list').addEventListener('click', async (event) => { const button = event.target.closest('button'); if (!button) return; const task = state.tasks.find((item) => String(item.id) === button.dataset.id); if (button.dataset.action === 'edit') openDialog(task); if (button.dataset.action === 'delete' && confirm(`Delete "${task.title}"?`)) { try { await deleteTask(task.id); setMessage('Task deleted.'); await loadTasks(); } catch { setMessage('The task could not be deleted.', true); } } });
byId('task-list').addEventListener('change', async (event) => { if (event.target.dataset.action !== 'toggle') return; try { await patchTask(event.target.dataset.id, { completed: event.target.checked }); setMessage(event.target.checked ? 'Task completed.' : 'Task moved back to progress.'); await loadTasks(); } catch { setMessage('The task status could not be updated.', true); } });
loadTasks();