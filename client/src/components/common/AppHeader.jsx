/**
 * AppHeader.jsx
 * Unified Application Topbar inspired by Stripe Dashboard & Linear.
 * Features aligned search bar, keyboard shortcut badge, notification center,
 * and user session menu.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../modules/auth/hooks/useAuth.js';

const AppHeader = ({ onToggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to customers or products search based on user
    navigate(`/customers?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className="shared-app-header">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="shared-app-header__left">
        <button
          type="button"
          className="shared-app-header__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          <Menu size={18} />
        </button>

        <form className="shared-app-header__search-form" onSubmit={handleSearchSubmit}>
          <Search size={15} className="shared-app-header__search-icon" aria-hidden="true" />
          <input
            type="text"
            className="shared-app-header__search-input"
            placeholder="Search customers, products, subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search across workspace"
          />
          <div className="shared-app-header__search-shortcut" title="Press Ctrl+K to search">
            <kbd className="shared-app-header__kbd">⌘K</kbd>
          </div>
        </form>
      </div>

      {/* Right: Environment, Notifications, User Menu */}
      <div className="shared-app-header__right">
        {/* Workspace Mode Badge */}
        <div className="shared-app-header__env-badge" title="Live Cloud Workspace">
          <span className="shared-app-header__env-dot" />
          <span className="shared-app-header__env-text">SubManage Cloud</span>
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          className="shared-app-header__icon-btn"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="shared-app-header__notif-badge" />
        </button>

        <div className="shared-app-header__divider" />

        {/* User Dropdown */}
        <div className="shared-app-header__user-menu" ref={userMenuRef}>
          <button
            type="button"
            className="shared-app-header__user-btn"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className="shared-app-header__avatar">{getInitials()}</div>
            <div className="shared-app-header__user-meta">
              <span className="shared-app-header__user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="shared-app-header__user-role">{user?.role}</span>
            </div>
            <ChevronDown size={14} className="shared-app-header__chevron" />
          </button>

          {isUserMenuOpen && (
            <div className="shared-user-dropdown" role="menu">
              <div className="shared-user-dropdown__header">
                <span className="shared-user-dropdown__full-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="shared-user-dropdown__email">{user?.email}</span>
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge--admin' : user?.role === 'STAFF' ? 'badge--staff' : 'badge--customer'}`} style={{ marginTop: '6px', alignSelf: 'flex-start' }}>
                  {user?.role}
                </span>
              </div>

              <div className="shared-user-dropdown__divider" />

              <button
                type="button"
                className="shared-user-dropdown__item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/profile');
                }}
              >
                <UserCircle size={15} />
                <span>My Profile & Security</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className="shared-user-dropdown__item"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/admin/users');
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>Users & Role Governance</span>
                </button>
              )}

              <div className="shared-user-dropdown__divider" />

              <button
                type="button"
                className="shared-user-dropdown__item shared-user-dropdown__item--danger"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
