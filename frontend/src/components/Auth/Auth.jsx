import { useState } from 'react';
import { login, register } from '../../services/api';
import './Auth.css';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(form);

      if (!res.success) throw new Error(res.message || 'Something went wrong');

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('tenant', JSON.stringify(res.data.tenant || {}));
      onAuth(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-glow" />
      <div className="auth-card fade-up">

        <div className="auth-brand">
          <span className="auth-logo">⬡</span>
          <span className="auth-name">TaskFlow</span>
        </div>

        <h2 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
        </h2>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Sign in to your account'
            : 'Set up your team in seconds'}
        </p>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="field">
                <label>Your Name</label>
                <input name="name" placeholder="Raghav" value={form.name} onChange={update} required />
              </div>
              <div className="field">
                <label>Organization Name</label>
                <input name="orgName" placeholder="Acme Corp" value={form.orgName} onChange={update} required />
              </div>
            </>
          )}

          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={update} required />
          </div>

          <div className="field">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={update} required />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : mode === 'login' ? 'Sign In' : 'Create Workspace'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>

      </div>
    </div>
  );
}