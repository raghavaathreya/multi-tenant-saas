import { useState } from 'react';
import Auth from './components/Auth/Auth';
import Navbar from './components/Layout/Navbar';
import TaskList from './components/Tasks/TaskList';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [tenant, setTenant] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tenant')); } catch { return null; }
  });

  const handleAuth = (data) => {
    setUser(data.user);
    setTenant(data.tenant || {});
  };

  const handleLogout = () => {
    setUser(null);
    setTenant(null);
  };

  if (!user || !localStorage.getItem('token')) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <>
      <Navbar user={user} tenant={tenant} onLogout={handleLogout} />
      <TaskList />
    </>
  );
}