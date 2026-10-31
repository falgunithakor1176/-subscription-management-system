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

/**
 * Granular Permissions definition for RBAC
 */
export const PERMISSIONS = {
  // User & Role Governance (Admin only)
  USERS_VIEW: 'users:view',
  USERS_MANAGE_ROLE: 'users:manage_role',
  USERS_MANAGE_STATUS: 'users:manage_status',
  STAFF_CREATE: 'staff:create',

  // Personal Profile
  PROFILE_VIEW: 'profile:view',
  PASSWORD_UPDATE: 'password:update',
};

/**
 * Role-to-Permissions Mapping
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE_ROLE,
    PERMISSIONS.USERS_MANAGE_STATUS,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PASSWORD_UPDATE,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PASSWORD_UPDATE,
  ],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PASSWORD_UPDATE,
  ],
};
