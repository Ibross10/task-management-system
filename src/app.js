import { getTasks, createTask, updateTask, deleteTask } from "./tasks.js";

const form = document.querySelector("#task-form");
const list = document.querySelector("#task-list");
const message = document.querySelector("#message");
const search = document.querySelector("#search");
let tasks = [];

const showMessage = (text, type = "info") => { message.textContent = text; message.dataset.type = type; };
const visibleTasks = () => tasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(search.value.toLowerCase()));

function render() {
  list.innerHTML = visibleTasks().map((task) => `<li class="task ${task.completed ? "done" : ""}"><div><h3>${task.title}</h3><p>${task.description || "No description"}</p><small>${task.category} · ${task.priority} · Due ${task.dueDate}</small></div><div class="actions"><button data-toggle="${task.id}">${task.completed ? "Reopen" : "Complete"}</button><button data-delete="${task.id}" class="danger">Delete</button></div></li>`).join("") || "<li>No matching tasks yet.</li>";
}

async function load() {
  showMessage("Loading tasks…");
  try { tasks = await getTasks(); render(); showMessage(`${tasks.length} task(s) loaded.`); } catch { showMessage("Could not reach the task API. Start JSON Server on port 3000.", "error"); }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const task = Object.fromEntries(new FormData(form));
  if (!task.title.trim() || !task.dueDate) return showMessage("Title and due date are required.", "error");
  try { const saved = await createTask({ ...task, completed: false }); tasks.unshift(saved); form.reset(); render(); showMessage("Task created.", "success"); }
  catch { showMessage("Task could not be saved.", "error"); }
});

list.addEventListener("click", async (event) => {
  const id = event.target.dataset.toggle || event.target.dataset.delete;
  if (!id) return;
  try {
    if (event.target.dataset.delete) { await deleteTask(id); tasks = tasks.filter((task) => String(task.id) !== id); showMessage("Task deleted.", "success"); }
    else { const task = tasks.find((item) => String(item.id) === id); const saved = await updateTask(id, { completed: !task.completed }); tasks = tasks.map((item) => item.id === saved.id ? saved : item); showMessage("Task updated.", "success"); }
    render();
  } catch { showMessage("Task could not be updated.", "error"); }
});

search.addEventListener("input", render);
load();
