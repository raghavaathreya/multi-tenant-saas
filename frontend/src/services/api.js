const BASE = '/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const register = (data) =>
  fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const login = (data) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const logout = () =>
  fetch(`${BASE}/auth/logout`, { method: 'POST', headers: headers() })
    .then((r) => r.json());

// ─── TASKS ───────────────────────────────────────────────────────────────────

export const getTasks = (params = '') =>
  fetch(`${BASE}/tasks${params}`, { headers: headers() }).then((r) => r.json());

export const createTask = (data) =>
  fetch(`${BASE}/tasks`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const updateTask = (id, data) =>
  fetch(`${BASE}/tasks/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) })
    .then((r) => r.json());

export const deleteTask = (id) =>
  fetch(`${BASE}/tasks/${id}`, { method: 'DELETE', headers: headers() }).then((r) => r.json());