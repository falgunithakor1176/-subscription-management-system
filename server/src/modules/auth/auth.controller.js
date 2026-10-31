/**
 * auth.controller.js
 * HTTP request/response layer for the Authentication module.
 * Receives validated req.body, calls the service, and returns a response.
 * Never contains business logic.
 */

import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import {
  changePassword,
  createStaffAccount,
  getUserProfile,
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
