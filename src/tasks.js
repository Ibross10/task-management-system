const API_URL = "http://localhost:3000/tasks";

async function request(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const getTasks = () => request();
export const createTask = (task) => request("", { method: "POST", body: JSON.stringify(task) });
export const replaceTask = (id, task) => request(`/${id}`, { method: "PUT", body: JSON.stringify(task) });
export const updateTask = (id, changes) => request(`/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
export const deleteTask = (id) => request(`/${id}`, { method: "DELETE" });
