/**
 * Sidebar.jsx
 * Unified White Enterprise SaaS Sidebar.
 * Features 240px width, crisp #E2E8F0 border, route grouping,
 * and exact active route matching (including nested routes like /customers/:id).
 */

import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../modules/auth/hooks/useAuth.js';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Active check helper supporting nested routes
  const isRouteActive = (basePath, exact = false) => {
    if (exact) return currentPath === basePath;
    return currentPath === basePath || currentPath.startsWith(`${basePath}/`);
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="shared-sidebar__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`shared-sidebar ${isOpen ? 'shared-sidebar--mobile-open' : ''}`} aria-label="Sidebar navigation">
        {/* Brand Header */}
        <div className="shared-sidebar__brand">
          <Link to="/dashboard" className="shared-sidebar__brand-link" onClick={onClose}>
            <svg
              width="28"
              height="28"
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
            <span className="shared-sidebar__brand-text">SubManage</span>
          </Link>

          <button
            type="button"
            className="shared-sidebar__close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="shared-sidebar__nav">
          {/* Main Workspace */}
          <div className="shared-sidebar__section">
            <span className="shared-sidebar__section-title">General</span>
            <Link
              to="/dashboard"
              className={`shared-sidebar__link ${isRouteActive('/dashboard', true) ? 'shared-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={17} aria-hidden="true" />
              <span>Workspace</span>
            </Link>
          </div>

          {/* Operations: Customers, Products, Plans, Quotations, Subscriptions */}
          <div className="shared-sidebar__section">
            <span className="shared-sidebar__section-title">Operations</span>

            {/* Customers (Admin & Staff) */}
            {(isAdmin || isStaff) && (
              <Link
                to="/customers"
                className={`shared-sidebar__link ${isRouteActive('/customers') ? 'shared-sidebar__link--active' : ''}`}
                id="sidebar-nav-customers"
                onClick={onClose}
              >
                <Users size={17} aria-hidden="true" />
                <span>Customers</span>
              </Link>
            )}

            {/* Products (All authenticated roles) */}
            <Link
              to="/products"
              className={`shared-sidebar__link ${isRouteActive('/products') ? 'shared-sidebar__link--active' : ''}`}
              id="sidebar-nav-products"
              onClick={onClose}
            >
              <Package size={17} aria-hidden="true" />
              <span>Products</span>
            </Link>

            {/* Subscription Plans (All authenticated roles) */}
            <Link
              to="/plans"
              className={`shared-sidebar__link ${isRouteActive('/plans') ? 'shared-sidebar__link--active' : ''}`}
              id="sidebar-nav-plans"
              onClick={onClose}
            >
              <CalendarDays size={17} aria-hidden="true" />
              <span>Subscription Plans</span>
            </Link>

            {/* Quotations (All authenticated roles) */}
            <Link
              to="/quotations"
              className={`shared-sidebar__link ${isRouteActive('/quotations') ? 'shared-sidebar__link--active' : ''}`}
              id="sidebar-nav-quotations"
              onClick={onClose}
            >
              <FileText size={17} aria-hidden="true" />
              <span>Quotations</span>
            </Link>

            {/* Subscriptions (All authenticated roles) */}
            <Link
              to="/subscriptions"
              className={`shared-sidebar__link ${isRouteActive('/subscriptions') ? 'shared-sidebar__link--active' : ''}`}
              id="sidebar-nav-subscriptions"
              onClick={onClose}
            >
              <RefreshCw size={17} aria-hidden="true" />
              <span>Subscriptions</span>
            </Link>
          </div>

          {/* Governance (Admin only) */}
          {isAdmin && (
            <div className="shared-sidebar__section">
              <span className="shared-sidebar__section-title">Governance</span>
              <Link
                to="/admin/users"
                className={`shared-sidebar__link ${isRouteActive('/admin/users') ? 'shared-sidebar__link--active' : ''}`}
                onClick={onClose}
              >
                <ShieldCheck size={17} aria-hidden="true" />
                <span>Users & Roles</span>
              </Link>
            </div>
          )}

          {/* Account */}
          <div className="shared-sidebar__section">
            <span className="shared-sidebar__section-title">Account</span>
            <Link
              to="/profile"
              className={`shared-sidebar__link ${isRouteActive('/profile') ? 'shared-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <UserCircle size={17} aria-hidden="true" />
              <span>My Profile</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="shared-sidebar__footer">
          <div className="shared-sidebar__user-box">
            <div className="shared-sidebar__avatar">{getInitials()}</div>
            <div className="shared-sidebar__user-meta">
              <span className="shared-sidebar__user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="shared-sidebar__user-role">{user?.role}</span>
            </div>
          </div>
          <button
            type="button"
            className="shared-sidebar__logout-btn"
            onClick={logout}
            title="Sign out of account"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
