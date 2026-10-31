import { sendError } from '../utils/response.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, `A record with this ${field} already exists`, 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  if (err.code === 'P2003') {
    return sendError(res, 'Related record not found', 400);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return sendError(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Validate request body with Zod schema
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
