import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Circle, ClipboardList, Clock3, ListTodo, Plus, RefreshCw, Search, Sparkles, Trash2, Pencil, X, CalendarDays } from 'lucide-react';
import { tasksApi } from './api.js';

const blank = { title: '', description: '', category: 'Personal', priority: 'medium', dueDate: '', completed: false };
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await tasksApi.list(); setTasks(Array.isArray(data.tasks) ? data.tasks : []); }
    catch (e) { setError(e.message || 'Could not load tasks.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  const completed = tasks.filter(t => t.completed).length;
  const active = tasks.length - completed;
  const visible = useMemo(() => tasks.filter(t => {
    const q = search.trim().toLowerCase();
    const matchText = !q || [t.title, t.description, t.category].some(v => v?.toLowerCase().includes(q));
    return matchText && (filter === 'all' || (filter === 'completed' ? t.completed : !t.completed));
  }), [tasks, search, filter]);

  function reset() { setForm(blank); setEditingId(null); setError(''); }
  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Please enter a task name before saving.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const payload = { ...form, title: form.title.trim(), description: form.description.trim(), dueDate: form.dueDate || '' };
      if (editingId) { await tasksApi.replace(editingId, payload); setMessage('Task updated successfully.'); }
      else { await tasksApi.create(payload); setMessage('Task added. Nice progress!'); }
      reset(); await loadTasks();
    } catch (e) { setError(e.message || 'Could not save task.'); }
    finally { setSaving(false); }
  }
  function edit(task) {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description || '', category: task.category || 'Personal', priority: task.priority || 'medium', dueDate: task.dueDate || '', completed: Boolean(task.completed) });
    document.getElementById('task-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function toggle(task) {
    setError(''); setMessage('');
    try { await tasksApi.patch(task.id, { completed: !task.completed }); await loadTasks(); }
    catch (e) { setError(e.message || 'Could not update task.'); }
  }
  async function remove(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setError(''); setMessage('');
    try { await tasksApi.remove(task.id); setMessage('Task deleted.'); await loadTasks(); }
    catch (e) { setError(e.message || 'Could not delete task.'); }
  }
  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="TaskFlow home"><span className="brand-mark"><ClipboardList size={20}/></span>TaskFlow</a>
      <span className="topbar-note">A little progress every day adds up.</span>
    </header>
    <section className="hero">
      <div><p className="eyebrow">YOUR PERSONAL WORKSPACE</p><h1>Make room for <span>great work.</span></h1><p className="hero-copy">Organize your day, focus on what matters, and keep moving forward.</p></div>
      <div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
    </section>
    <section className="stats" aria-label="Task summary">
      <article className="stat-card"><span className="stat-icon all-icon"><ListTodo size={20}/></span><div><p>Total tasks</p><strong>{tasks.length}</strong></div></article>
      <article className="stat-card"><span className="stat-icon active-icon"><Clock3 size={20}/></span><div><p>In progress</p><strong>{active}</strong></div></article>
      <article className="stat-card"><span className="stat-icon done-icon"><Check size={20}/></span><div><p>Completed</p><strong>{completed}</strong></div></article>
    </section>
    <div className="notice-area" aria-live="polite">{error && <p className="notice error">{error}</p>}{message && <p className="notice success">{message}</p>}</div>
    <section className="workspace">
      <section className="panel form-panel" id="task-form">
        <div className="panel-heading"><h2>{editingId ? 'Edit task' : 'Create a task'}</h2><span className="heading-spark"><Sparkles size={18}/></span></div>
        <form onSubmit={submit}>
          <label htmlFor="title">Task name <span>*</span></label><input id="title" maxLength="120" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Finish project proposal" required />
          <label htmlFor="description">Description</label><textarea id="description" maxLength="500" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a few details (optional)" />
          <div className="form-row">
            <div><label htmlFor="category">Category</label><select id="category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Personal','Work','Study','Health','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label htmlFor="priority">Priority</label><select id="priority" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['low','medium','high'].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></div>
          </div>
          <label htmlFor="dueDate">Due date</label><input id="dueDate" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
          <div className="form-actions">{editingId && <button className="button secondary" type="button" onClick={reset}><X size={16}/> Cancel</button>}<button className="button primary" type="submit" disabled={saving}>{saving ? <><RefreshCw className="spin" size={16}/> Saving…</> : <><Plus size={17}/>{editingId?'Save changes':'Add task'}</>}</button></div>
        </form>
        <p className="privacy-note">Your tasks are saved to the local API database and persist after refresh.</p>
      </section>
      <section className="tasks-area">
        <div className="tasks-title-row"><div><h2>Your tasks</h2><p className="section-subtitle">Keep your priorities in sight.</p></div><span className="count-pill">{visible.length} shown</span></div>
        <div className="toolbar"><div className="search-box"><Search size={17}/><input aria-label="Search tasks" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..." /></div><select aria-label="Filter tasks" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All tasks</option><option value="active">In progress</option><option value="completed">Completed</option></select></div>
        {loading ? <div className="empty-state"><RefreshCw className="spin" size={22}/><p>Loading your tasks…</p></div> :
        visible.length === 0 ? <div className="empty-state"><span className="empty-icon"><ClipboardList size={24}/></span><h3>{search || filter !== 'all' ? 'No matching tasks' : 'A fresh start'}</h3><p>{search || filter !== 'all' ? 'Try changing your search or filter.' : 'Add your first task to get the ball rolling.'}</p></div> :
        <div className="task-list">{visible.map(task=><article className={`task-card ${task.completed?'is-complete':''}`} key={task.id}>
          <button className={`complete-toggle ${task.completed?'checked':''}`} aria-label={task.completed?'Mark task incomplete':'Mark task complete'} onClick={()=>toggle(task)}>{task.completed?<Check size={16}/>:<Circle size={20}/>}</button>
          <div className="task-content"><div className="task-name-row"><h3>{task.title}</h3><span className={`priority priority-${task.priority||'medium'}`}>{task.priority||'medium'}</span></div>{task.description && <p className="task-description">{task.description}</p>}<div className="task-meta"><span className="category-tag">{task.category||'Personal'}</span>{task.dueDate && <span><CalendarDays size={13}/>{dateLabel(task.dueDate)}</span>}</div></div>
          <div className="task-actions"><button aria-label={`Edit ${task.title}`} onClick={()=>edit(task)}><Pencil size={16}/></button><button aria-label={`Delete ${task.title}`} onClick={()=>remove(task)}><Trash2 size={16}/></button></div>
        </article>)}</div>}
        <footer className="list-footer"><span>{completed} of {tasks.length} tasks completed</span><button className="text-button" onClick={loadTasks}><RefreshCw size={13}/> Refresh</button></footer>
      </section>
    </section>
    <footer className="app-footer"><span>© {new Date().getFullYear()} TaskFlow</span><span>Plan with purpose. Finish with pride.</span></footer>
  </main>;
}