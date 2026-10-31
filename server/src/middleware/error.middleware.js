/**
 * error.middleware.js
 * Global error handling middleware.
 * Must be registered LAST in the Express app, after all routes.
 *
 * Handles:
 *  - ApiError (operational errors)
 *  - Prisma errors (P2002, P2025, P2003)
 *  - Zod validation errors (v4 format)
 *  - JWT errors
 *  - Unhandled errors (programming errors)
 */

import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // ─── Operational errors (thrown deliberately) ────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  // ─── Prisma known errors ─────────────────────────────────────────────────
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Related record not found.',
    });
  }

  // ─── Zod validation errors (v4) ──────────────────────────────────────────
  if (err.name === 'ZodError') {
    const errors = (err.issues || err.errors || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      errors,
    });
  }

  // ─── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.',
    });
  }

  // ─── Unknown / programming errors ────────────────────────────────────────
  console.error('[ERROR]', err);

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    ...(env.isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler for unmatched routes.
 */
export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};

/**
 * Validate request body using a Zod schema.
 * Passes ZodError to the global errorHandler on failure.
 * @param {ZodSchema} schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
};
