/**
 * auth.service.js
 * Business logic for the Authentication module.
 * Sits between the controller (HTTP) and the repository (database).
 * Never imports from Express — it knows nothing about HTTP.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  countActiveAdmins,
  countUsers,
  createUser,
  emailExists,
  findUserByEmail,
  findUserById,
  findUsers,
  findUserWithPasswordById,
  updateUserPassword,
  updateUserRole,
  updateUserStatus,
} from './auth.repository.js';
import {
  AUTH_MESSAGES,
  BCRYPT_ROUNDS,
  ROLES,
} from './auth.constants.js';

// ─── Token generation ─────────────────────────────────────────────────────────

/**
 * Generate a signed JWT for a user.
 * @param {object} user - { id, email, role }
 * @returns {string} Signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

// ─── Service methods ──────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Public self-registration ALWAYS creates a CUSTOMER account.
 * Client-provided role inputs are ignored to prevent privilege escalation.
 *
 * @param {object} dto         - Validated registration data { firstName, lastName, email, password, phone? }
 * @param {string} [role]      - Role to assign (defaults to CUSTOMER)
 * @returns {{ user, token }}
 */
export const registerUser = async (dto, role = ROLES.CUSTOMER) => {
  const { firstName, lastName, email, password, phone } = dto;

  // Enforce valid role assignment
  const assignedRole = role === ROLES.STAFF ? ROLES.STAFF : ROLES.CUSTOMER;

  // Check for duplicate email
  const exists = await emailExists(email);
  if (exists) {
    throw ApiError.conflict(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  // Hash password with 12 bcrypt rounds
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Persist user
  const user = await createUser({
    firstName,
    lastName,
    email: email.trim().toLowerCase(),
    passwordHash,
    role: assignedRole,
    phone: phone || null,
  });

  const token = generateToken(user);

  return { user, token };
};

/**
 * Authenticate a user by email and password.
 * @param {object} dto - { email, password }
 * @returns {{ user, token }}
 */
export const loginUser = async (dto) => {
  const { email, password } = dto;

  // Fetch user including passwordHash (repository returns full record)
  const dbUser = await findUserByEmail(email.trim().toLowerCase());

  if (!dbUser) {
    // Generic message prevents account enumeration
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  if (!dbUser.isActive) {
    throw ApiError.unauthorized(AUTH_MESSAGES.ACCOUNT_INACTIVE);
  }

  const passwordMatch = await bcrypt.compare(password, dbUser.passwordHash);
  if (!passwordMatch) {
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  // Strip the password hash before building response
  const { passwordHash: _hash, ...user } = dbUser;

  const token = generateToken(user);

  return { user, token };
};

/**
 * Retrieve the profile of the currently authenticated user.
 * @param {string} userId
 * @returns {object} User without passwordHash
 */
export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw ApiError.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
  }

  return user;
};

/**
 * Create a new STAFF account. Restricted to ADMIN role only.
 * @param {object} dto            - Validated staff creation data
 * @param {object} requestingUser - The authenticated user making the request
 * @returns {{ user, token }}
 */
export const createStaffAccount = async (dto, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(AUTH_MESSAGES.ADMIN_REQUIRED);
  }

  return registerUser(dto, ROLES.STAFF);
};

/**
 * Change the authenticated user's password.
 * @param {string} userId
 * @param {object} dto - { currentPassword, newPassword }
 */
export const changePassword = async (userId, dto) => {
  const { currentPassword, newPassword } = dto;

  const dbUser = await findUserWithPasswordById(userId);
  if (!dbUser) {
    throw ApiError.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
  }

  const passwordMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!passwordMatch) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await updateUserPassword(userId, passwordHash);
};

/**
 * List all users with pagination and role filtering. (Admin only)
 * @param {object} requestingUser
 * @param {object} query - { page, limit, role, search }
 * @returns {Promise<{ users: User[], total: number, page: number, totalPages: number }>}
 */
export const listUsers = async (requestingUser, query = {}) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(AUTH_MESSAGES.ADMIN_REQUIRED);
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filters = {
    ...(query.role && { role: query.role }),
    ...(query.search && { search: query.search.trim() }),
  };

  const [users, total] = await Promise.all([
    findUsers({ ...filters, skip, take: limit }),
    countUsers(filters),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Change a user's role. (Admin only)
 * Prevents demoting the last active administrator.
 *
 * @param {string} targetUserId
 * @param {string} newRole
 * @param {object} requestingUser
 * @returns {Promise<User>}
 */
export const changeUserRole = async (targetUserId, newRole, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only administrators can manage user roles.');
  }

  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    throw ApiError.notFound('Target user not found.');
  }

  // Safety: Prevent removing the last active ADMIN
  if (targetUser.role === ROLES.ADMIN && newRole !== ROLES.ADMIN) {
    const adminCount = await countActiveAdmins();
    if (adminCount <= 1) {
      throw ApiError.badRequest(
        'Operation prohibited: Cannot demote the only active Administrator.'
      );
    }
  }

  return updateUserRole(targetUserId, newRole);
};

/**
 * Toggle user active status (deactivate or reactivate). (Admin only)
 * Prevents an admin from deactivating themselves or deactivating the last active ADMIN.
 *
 * @param {string} targetUserId
 * @param {boolean} isActive
 * @param {object} requestingUser
 * @returns {Promise<User>}
 */
export const changeUserStatus = async (targetUserId, isActive, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only administrators can modify user account statuses.');
  }

  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    throw ApiError.notFound('Target user not found.');
  }

  // Safety: Prevent self-deactivation
  if (targetUserId === requestingUser.id && !isActive) {
    throw ApiError.badRequest('Administrators cannot deactivate their own account.');
  }

  // Safety: Prevent deactivating the last active ADMIN
  if (targetUser.role === ROLES.ADMIN && !isActive) {
    const adminCount = await countActiveAdmins();
    if (adminCount <= 1) {
      throw ApiError.badRequest(
        'Operation prohibited: Cannot deactivate the only active Administrator.'
      );
    }
  }

  return updateUserStatus(targetUserId, isActive);
};
