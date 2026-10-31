/**
 * auth.controller.js
 * HTTP request/response layer for the Authentication module.
 * Receives validated req.body, calls the service, and returns a response.
 * Never contains business logic.
 */

import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../../utils/ApiResponse.js';
import {
  changePassword,
  changeUserRole,
  changeUserStatus,
  createStaffAccount,
  getUserProfile,
  listUsers,
  loginUser,
  registerUser,
} from './auth.service.js';
import { AUTH_MESSAGES } from './auth.constants.js';

/**
 * POST /api/auth/register
 * Public — registers a new user with STAFF role (self-registration).
 */
export const register = asyncHandler(async (req, res) => {
  const { user, token } = await registerUser(req.body);

  return sendSuccess(
    res,
    { user, token },
    AUTH_MESSAGES.REGISTER_SUCCESS,
    201
  );
});

/**
 * POST /api/auth/login
 * Public — authenticates user and returns JWT.
 */
export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);

  return sendSuccess(res, { user, token }, AUTH_MESSAGES.LOGIN_SUCCESS);
});

/**
 * GET /api/auth/me
 * Protected — returns the profile of the currently authenticated user.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  return sendSuccess(res, { user }, AUTH_MESSAGES.PROFILE_SUCCESS);
});

/**
 * POST /api/auth/logout
 * Protected — client-side logout acknowledgement.
 * JWT is stateless; the client is responsible for discarding the token.
 */
export const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, null, AUTH_MESSAGES.LOGOUT_SUCCESS);
});

/**
 * POST /api/auth/staff
 * Protected (ADMIN only) — creates a new STAFF account.
 */
export const createStaff = asyncHandler(async (req, res) => {
  const { user, token } = await createStaffAccount(req.body, req.user);

  return sendSuccess(
    res,
    { user, token },
    'Staff account created successfully.',
    201
  );
});

/**
 * PATCH /api/auth/change-password
 * Protected — changes the authenticated user's password.
 */
export const updatePassword = asyncHandler(async (req, res) => {
  await changePassword(req.user.id, req.body);

  return sendSuccess(res, null, AUTH_MESSAGES.PASSWORD_CHANGED);
});

/**
 * GET /api/v1/auth/users
 * Protected (ADMIN only) — returns paginated list of users with roles.
 */
export const getUsers = asyncHandler(async (req, res) => {
  const result = await listUsers(req.user, req.query);

  return sendPaginated(
    res,
    result.users,
    result.total,
    result.page,
    result.limit,
    'Users list retrieved successfully.'
  );
});

/**
 * PATCH /api/v1/auth/users/:id/role
 * Protected (ADMIN only) — updates a user's role.
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await changeUserRole(req.params.id, req.body.role, req.user);

  return sendSuccess(res, { user }, 'User role updated successfully.');
});

/**
 * PATCH /api/v1/auth/users/:id/status
 * Protected (ADMIN only) — deactivates or reactivates a user account.
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await changeUserStatus(req.params.id, req.body.isActive, req.user);

  const statusText = user.isActive ? 'activated' : 'deactivated';
  return sendSuccess(res, { user }, `User account ${statusText} successfully.`);
});
