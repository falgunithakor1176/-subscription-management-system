/**
 * DashboardLayout.jsx
 * Enterprise Dashboard Layout matching SubManage SaaS specifications.
 * Features a clean left sidebar, role-based navigation, top bar, and content area.
 */

import { Link, NavLink, Outlet } from 'react-router-dom';
import { 
  Bell, 
  ChevronRight, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  ShieldCheck, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../modules/auth/hooks/useAuth.js';

const DashboardLayout = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="app-shell">
      {/* ─── Left Sidebar ────────────────────────────────────────────────────── */}
      <aside className="app-sidebar" aria-label="Sidebar navigation">
        {/* Brand Header */}
        <div className="app-sidebar__brand">
          <Link to="/dashboard" className="app-sidebar__brand-link">
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M16 2.8L28.2 9.5V22.5L16 29.2L3.8 22.5V9.5L16 2.8Z" fill="#EEF2FF" />
              <path d="M16 3.6L27 9.8L16 16.2L5 9.8L16 3.6Z" fill="#818CF8" />
              <path d="M5 10.6L15.4 16.6V28.2L5 22.2V10.6Z" fill="#6366F1" />
              <path d="M16.6 16.6L27 10.6V22.2L16.6 28.2V16.6Z" fill="#4F46E5" />
            </svg>
            <span className="app-sidebar__brand-text">SubManage</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="app-sidebar__nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
            }
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Workspace</span>
          </NavLink>

          {/* Admin-only RBAC Governance Link */}
          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
              }
            >
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Users & Roles</span>
            </NavLink>
          )}

          {/* Personal Profile & Security */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
            }
          >
            <UserCircle size={18} aria-hidden="true" />
            <span>My Profile</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer: User Card & Sign Out */}
        <div className="app-sidebar__footer">
          <div className="sidebar-user">
            <div className="sidebar-user__avatar" aria-hidden="true">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="sidebar-user__info">
              <span className="sidebar-user__name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="sidebar-user__role">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-user__logout-btn"
            onClick={logout}
            title="Sign out of your session"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─────────────────────────────────────────────── */}
      <div className="app-main">
        {/* Top Header Bar */}
        <header className="app-topbar">
          <div className="app-topbar__search">
            <Search size={16} className="app-topbar__search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search anything..."
              className="app-topbar__search-input"
            />
          </div>

          <div className="app-topbar__actions">
            <button
              type="button"
              className="app-topbar__icon-btn"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <Link to="/profile" className="app-topbar__avatar-btn" title="View profile">
              <div className="app-topbar__avatar" aria-hidden="true">
                {user?.firstName?.[0]}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
