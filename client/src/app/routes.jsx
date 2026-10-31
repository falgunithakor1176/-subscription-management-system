/**
 * routes.jsx
 * Application route definitions.
 * Implements role-aware protected routes and role-based navigation foundation.
 */

import { Link, Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoginPage from '../modules/auth/pages/LoginPage.jsx';
import RegisterPage from '../modules/auth/pages/RegisterPage.jsx';
import UnauthorizedPage from '../modules/auth/pages/UnauthorizedPage.jsx';
import UsersManagementPage from '../modules/auth/pages/UsersManagementPage.jsx';
import ProfilePage from '../modules/auth/pages/ProfilePage.jsx';
import CustomersPage from '../modules/customers/pages/CustomersPage.jsx';
import CustomerDetailPage from '../modules/customers/pages/CustomerDetailPage.jsx';
import RoleGuard from '../modules/auth/components/RoleGuard.jsx';
import { useAuth } from '../modules/auth/hooks/useAuth.js';
import { 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Loader2, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Users 
} from 'lucide-react';

// ─── Route guards ──────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * If allowedRoles is provided, ensures user.role is in allowedRoles;
 * otherwise redirects to /unauthorized.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="route-loading" aria-label="Loading authentication">
        <Loader2 size={24} className="spin" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // RBAC permission check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

/**
 * PublicOnlyRoute — redirects authenticated users away from auth pages.
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="route-loading" aria-label="Loading authentication">
        <Loader2 size={24} className="spin" aria-hidden="true" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ─── Workspace Overview Page (Role-Aware Foundation) ─────────────────────────
const DashboardHome = () => {
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  return (
    <div className="dashboard-home-view">
      {/* Welcome Banner */}
      <div className="workspace-banner">
        <div>
          <h1 className="workspace-banner__title">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="workspace-banner__subtitle">
            Signed in as <strong>{user?.email}</strong> — Active Session
          </p>
        </div>
        <div className="workspace-banner__badge-box">
          <span className="workspace-banner__label">Active Role:</span>
          <span className={`badge ${isAdmin ? 'badge--admin' : isStaff ? 'badge--staff' : 'badge--customer'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Role-Specific Action Grid */}
      <div className="workspace-grid">
        {/* Administrator RBAC Cards */}
        <RoleGuard allowedRoles={['ADMIN']}>
          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--primary" aria-hidden="true">
                <Users size={20} />
              </div>
              <h2 className="workspace-card__title">Customer Directory</h2>
            </div>
            <p className="workspace-card__desc">
              View customer profiles, add new clients, update billing addresses, and track accounts.
            </p>
            <div className="workspace-card__action">
              <Link to="/customers" className="btn btn--primary">
                <span>View Customers</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--primary" aria-hidden="true">
                <Users size={20} />
              </div>
              <h2 className="workspace-card__title">User & Role Governance</h2>
            </div>
            <p className="workspace-card__desc">
              Manage system accounts, assign RBAC roles (Admin, Staff, Customer), and deactivate compromised profiles.
            </p>
            <div className="workspace-card__action">
              <Link to="/admin/users" className="btn btn--primary">
                <span>Manage Users & Roles</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--success" aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <h2 className="workspace-card__title">Staff Provisioning</h2>
            </div>
            <p className="workspace-card__desc">
              Only Administrators have authority to create and provision internal Staff member credentials.
            </p>
            <div className="workspace-card__action">
              <Link to="/admin/users" className="btn btn--secondary">
                <span>Provision Staff Member</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </RoleGuard>

        {/* Staff RBAC Cards */}
        <RoleGuard allowedRoles={['STAFF']}>
          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--primary" aria-hidden="true">
                <Users size={20} />
              </div>
              <h2 className="workspace-card__title">Customer Management</h2>
            </div>
            <p className="workspace-card__desc">
              Manage client records, add new customers, and update billing and contact information.
            </p>
            <div className="workspace-card__action">
              <Link to="/customers" className="btn btn--primary">
                <span>Go to Customers</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--success" aria-hidden="true">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="workspace-card__title">Staff Operational Access</h2>
            </div>
            <p className="workspace-card__desc">
              You are authenticated with operational staff privileges. You can manage assigned business operations.
            </p>
            <div className="workspace-card__action">
              <span className="badge badge--staff">Operational Privileges Active</span>
            </div>
          </div>

          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--warning" aria-hidden="true">
                <Lock size={20} />
              </div>
              <h2 className="workspace-card__title">Administrative Boundaries</h2>
            </div>
            <p className="workspace-card__desc">
              Staff accounts are prohibited from provisioning other staff accounts or modifying role authorizations.
            </p>
            <div className="workspace-card__action">
              <span className="text-muted text-sm">Protected by Backend RBAC</span>
            </div>
          </div>
        </RoleGuard>

        {/* Customer RBAC Cards */}
        <RoleGuard allowedRoles={['CUSTOMER']}>
          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--primary" aria-hidden="true">
                <User size={20} />
              </div>
              <h2 className="workspace-card__title">Customer Self-Service Account</h2>
            </div>
            <p className="workspace-card__desc">
              Welcome to your SubManage customer account. Your account has strict customer-level data isolation.
            </p>
            <div className="workspace-card__action">
              <span className="badge badge--customer">Customer Profile Active</span>
            </div>
          </div>

          <div className="workspace-card">
            <div className="workspace-card__header">
              <div className="workspace-card__icon workspace-card__icon--primary" aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <h2 className="workspace-card__title">Data Privacy & Isolation</h2>
            </div>
            <p className="workspace-card__desc">
              Your profile and subscription records are strictly isolated. Administrative endpoints are inaccessible.
            </p>
            <div className="workspace-card__action">
              <span className="text-muted text-sm">Customer Sandbox Active</span>
            </div>
          </div>
        </RoleGuard>

        {/* Universal Security Card for all roles */}
        <div className="workspace-card">
          <div className="workspace-card__header">
            <div className="workspace-card__icon workspace-card__icon--primary" aria-hidden="true">
              <KeyRound size={20} />
            </div>
            <h2 className="workspace-card__title">Credential Security</h2>
          </div>
          <p className="workspace-card__desc">
            Keep your credentials up to date. You can review your permissions and update your password at any time.
          </p>
          <div className="workspace-card__action">
            <Link to="/profile" className="btn btn--secondary">
              <span>Security Profile</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Route tree ───────────────────────────────────────────────────────────────
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth routes (Public only) */}
      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Unauthorized access fallback (403) */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected workspace routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* ADMIN & STAFF: Customer Management Directory & Profiles */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'CUSTOMER']}>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN only: User & RBAC Management */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
