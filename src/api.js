const API_BASE = import.meta.env.VITE_API_URL || '';
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
  return data;
}
export const tasksApi = {
  list: () => request('/api/tasks'),
  create: task => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  replace: (id, task) => request(`/api/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(task) }),
  patch: (id, changes) => request(`/api/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  remove: id => request(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
};