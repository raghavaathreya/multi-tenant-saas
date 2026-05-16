import { useState } from 'react';
import './TaskForm.css';

export default function TaskForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'todo',
    priority: initial?.priority || 'medium',
    deadline: initial?.deadline ? initial.deadline.slice(0, 10) : '',
    tags: initial?.tags?.join(', ') || '',
  });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      deadline: form.deadline || null,
    });
  };

  return (
    <div className="form-overlay" onClick={onCancel}>
      <div className="task-form fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>{initial ? 'Edit Task' : 'New Task'}</h3>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Title *</label>
            <input name="title" placeholder="What needs to be done?" value={form.title} onChange={update} required />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea name="description" placeholder="Add more details..." value={form.description} onChange={update} rows={3} />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={update}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={update}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Deadline</label>
              <input name="deadline" type="date" value={form.deadline} onChange={update} />
            </div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input name="tags" placeholder="frontend, bug, auth" value={form.tags} onChange={update} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : initial ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}