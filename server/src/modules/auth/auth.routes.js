/**
 * auth.routes.js
 * Route definitions for the Authentication module.
 * Responsibilities: endpoint definition, middleware chaining, validation.
 * No business logic here.
 */

import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '../../middleware/auth.middleware.js';
import { adminOnly } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/error.middleware.js';
import {
  changePasswordSchema,
  createStaffSchema,
  loginSchema,
  registerSchema,
  updateRoleSchema,
  updateStatusSchema,
} from './auth.validation.js';
import {
  createStaff,
  getMe,
  getUsers,
  login,
  logout,
  register,
  updatePassword,
  updateUserRole,
  updateUserStatus,
} from './auth.controller.js';

const router = Router();

// ─── Auth-specific rate limiter ───────────────────────────────────────────────
// Stricter limit for sensitive auth endpoints to mitigate brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Self-registration — creates a STAFF account.
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Authenticates user and returns a JWT.
 */
router.post('/login', authLimiter, validate(loginSchema), login);

// ─── Protected routes ─────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, getMe);

/**
 * POST /api/auth/logout
 * Acknowledges logout on the server (token is discarded client-side).
 */
router.post('/logout', authenticate, logout);

/**
 * PATCH /api/auth/change-password
 * Changes the authenticated user's password.
 */
router.patch('/change-password', authenticate, validate(changePasswordSchema), updatePassword);

// ─── Admin-only routes ────────────────────────────────────────────────────────

/**
 * POST /api/auth/staff
 * ADMIN only — creates a new STAFF user account.
 */
router.post('/staff', authenticate, adminOnly, validate(createStaffSchema), createStaff);

/**
 * GET /api/auth/users
 * ADMIN only — lists users with pagination and search.
 */
router.get('/users', authenticate, adminOnly, getUsers);

/**
 * PATCH /api/auth/users/:id/role
 * ADMIN only — updates a user's role.
 */
router.patch('/users/:id/role', authenticate, adminOnly, validate(updateRoleSchema), updateUserRole);

/**
 * PATCH /api/auth/users/:id/status
 * ADMIN only — toggles user active/inactive status.
 */
router.patch('/users/:id/status', authenticate, adminOnly, validate(updateStatusSchema), updateUserStatus);

export default router;
