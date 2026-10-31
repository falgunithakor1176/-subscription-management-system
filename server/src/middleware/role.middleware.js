/**
 * role.middleware.js
 * Role-based access control middleware.
 * Must be used AFTER authenticate middleware.
 */

import { ApiError } from '../utils/ApiError.js';
import { ROLE_PERMISSIONS, ROLES } from '../modules/auth/auth.constants.js';

/**
 * Authorize one or more roles.
 * @param {...string} roles - Allowed roles (e.g. 'ADMIN', 'STAFF')
 * @returns {Function} Express middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. This resource requires one of the following roles: ${roles.join(', ')}.`
      );
    }

    next();
  };
};

/**
 * Authorize specific granular permission.
 * @param {string} permission - The permission required (e.g. 'users:manage_role')
 * @returns {Function} Express middleware
 */
export const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      throw ApiError.forbidden(
        `Access denied. Your role (${req.user.role}) does not possess '${permission}' permission.`
      );
    }

    next();
  };
};

/**
 * Restrict access to ADMIN role only.
 */
export const adminOnly = authorize(ROLES.ADMIN);

/**
 * Restrict access to ADMIN and STAFF roles.
 */
export const staffOrAdmin = authorize(ROLES.ADMIN, ROLES.STAFF);

/**
 * Restrict access to CUSTOMER role only.
 */
export const customerOnly = authorize(ROLES.CUSTOMER);
