/**
 * RoleGuard.jsx
 * Frontend RBAC component for conditional UI rendering based on user roles.
 *
 * Usage:
 * <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
 *   <button>Internal Action</button>
 * </RoleGuard>
 */

import { useAuth } from '../hooks/useAuth.js';

export const RoleGuard = ({ allowedRoles = [], role, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user?.role) {
    return fallback;
  }

  const rolesToCheck = role ? [role] : allowedRoles;

  if (rolesToCheck.length === 0 || rolesToCheck.includes(user.role)) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGuard;
