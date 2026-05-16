import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../../services/api';
import TaskForm from './TaskForm';
import './TaskList.css';

const STATUS_COLORS = {
  todo:        { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: 'Todo' },
  in_progress: { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d', label: 'In Progress' },
  in_review:   { bg: 'rgba(124,58,237,0.12)',  color: '#a78bfa', label: 'In Review' },
  done:        { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', label: 'Done' },
};

const PRIORITY_COLORS = {
  low:      '#94a3b8',
  medium:   '#fcd34d',
  high:     '#f97316',
  critical: '#ef4444',
};

export default function TaskList() {
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    const res = await getTasks();
    if (res.success) {
      setAllTasks(res.tasks);
      setFromCache(res.fromCache);
    }
    setLoading(false);
  };

  // filter client-side whenever filter or allTasks changes
  useEffect(() => {
    if (filter === 'all') setTasks(allTasks);
    else setTasks(allTasks.filter((t) => t.status === filter));
  }, [filter, allTasks]);

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (data) => {
    setSubmitting(true);
    const res = await createTask(data);
    if (res.success) { setShowForm(false); fetchTasks(); }
    else setError(res.message);
    setSubmitting(false);
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    const res = await updateTask(editTask._id, data);
    if (res.success) { setEditTask(null); fetchTasks(); }
    else setError(res.message);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    fetchTasks();
  };

  const filters = ['all', 'todo', 'in_progress', 'in_review', 'done'];

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dash-header fade-up">
        <div>
          <h1 className="dash-title">Tasks</h1>
          <p className="dash-sub">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            <span className={`cache-badge ${fromCache ? 'cached' : 'fresh'}`}>
              {fromCache ? '⚡ cached' : '🔄 live'}
            </span>
          </p>
        </div>
        <button className="btn-new" onClick={() => setShowForm(true)}>+ New Task</button>
      </div>

      {/* Filter pills */}
      <div className="filters fade-up">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : STATUS_COLORS[f]?.label}
          </button>
        ))}
      </div>

      {error && <div className="dash-error">{error}</div>}

      {/* Task grid */}
      {loading ? (
        <div className="loading-state">
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state fade-up">
          <span className="empty-icon">◻</span>
          <p>No tasks yet</p>
          <button className="btn-new" onClick={() => setShowForm(true)}>Create your first task</button>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task, i) => (
            <div key={task._id} className="task-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>

              <div className="task-top">
                <span className="status-badge" style={{ background: STATUS_COLORS[task.status]?.bg, color: STATUS_COLORS[task.status]?.color }}>
                  {STATUS_COLORS[task.status]?.label}
                </span>
                <span className="priority-dot" style={{ background: PRIORITY_COLORS[task.priority] }} title={task.priority} />
              </div>

              <h3 className="task-title">{task.title}</h3>
              {task.description && <p className="task-desc">{task.description}</p>}

              {task.tags?.length > 0 && (
                <div className="task-tags">
                  {task.tags.map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}

              {task.deadline && (
                <p className="task-deadline">
                  📅 {new Date(task.deadline).toLocaleDateString()}
                </p>
              )}

              <div className="task-actions">
                <button className="btn-edit" onClick={() => setEditTask(task)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(task._id)}>Delete</button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={submitting} />
      )}
      {editTask && (
        <TaskForm initial={editTask} onSubmit={handleUpdate} onCancel={() => setEditTask(null)} loading={submitting} />
      )}
    </div>
  );
}