import { logout } from '../../services/api';
import './Navbar.css';

export default function Navbar({ user, tenant, onLogout }) {
  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-logo">⬡</span>
        <span className="nav-brand">TaskFlow</span>
        {tenant?.name && (
          <>
            <span className="nav-sep">/</span>
            <span className="nav-tenant">{tenant.name}</span>
          </>
        )}
      </div>
      <div className="nav-right">
        <span className="nav-user">{user?.name}</span>
        <span className="nav-role">admin</span>
        <button className="nav-logout" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}