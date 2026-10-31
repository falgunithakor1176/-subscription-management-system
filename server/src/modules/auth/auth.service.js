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
  createUser,
  emailExists,
  findUserByEmail,
  findUserById,
  updateUserPassword,
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
 * Register a new STAFF or CUSTOMER user.
 * The caller (controller) must enforce who is allowed to register whom.
 *
 * @param {object} dto         - Validated registration data
 * @param {string} [role]      - Role to assign (defaults to STAFF for self-registration)
 * @returns {{ user, token }}
 */
export const registerUser = async (dto, role = ROLES.STAFF) => {
  const { firstName, lastName, email, password, phone } = dto;

  // Check for duplicate email
  const exists = await emailExists(email);
  if (exists) {
    throw ApiError.conflict(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Persist user
  const user = await createUser({
    firstName,
    lastName,
    email,
    passwordHash,
    role,
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
  const dbUser = await findUserByEmail(email);

  if (!dbUser) {
    // Use a generic message to prevent user enumeration
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  if (!dbUser.isActive) {
    throw ApiError.unauthorized(AUTH_MESSAGES.ACCOUNT_INACTIVE);
  }

  const passwordMatch = await bcrypt.compare(password, dbUser.passwordHash);
  if (!passwordMatch) {
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  // Strip the password hash before building the response
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
 * @param {object} dto          - Validated staff creation data
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

  const dbUser = await findUserByEmail(
    (await findUserById(userId)).email
  );

  const passwordMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!passwordMatch) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await updateUserPassword(userId, passwordHash);
};
