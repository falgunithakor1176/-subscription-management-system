/**
 * role.middleware.js
 * Role-based access control middleware.
 * Must be used AFTER authenticate middleware.
 */

import { ApiError } from '../utils/ApiError.js';

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
 * Restrict access to ADMIN role only.
 */
export const adminOnly = authorize('ADMIN');

/**
 * Restrict access to ADMIN and STAFF roles.
 */
export const staffOrAdmin = authorize('ADMIN', 'STAFF');
