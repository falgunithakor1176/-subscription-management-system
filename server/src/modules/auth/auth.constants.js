/**
 * auth.constants.js
 * Constants scoped to the Authentication module.
 */

export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'Account created successfully.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_SUCCESS: 'Profile retrieved successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  USER_NOT_FOUND: 'No account found with this email address.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  UNAUTHORIZED_ROLE: 'You do not have permission to perform this action.',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact support.',
  ADMIN_REQUIRED: 'Only administrators can create staff accounts.',
};

/**
 * bcrypt work factor.
 * 12 rounds is a good balance between security and performance.
 */
export const BCRYPT_ROUNDS = 12;

/**
 * Roles available in the system.
 * Mirrors the Prisma Role enum.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

/**
 * Roles that represent internal staff (not customer-facing).
 */
export const INTERNAL_ROLES = [ROLES.ADMIN, ROLES.STAFF];
