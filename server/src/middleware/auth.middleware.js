/**
 * auth.middleware.js
 * Verifies the JWT Bearer token on incoming requests.
 * Attaches the authenticated user object to req.user.
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required. Please provide a valid token.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your session has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      phone: true,
      avatarUrl: true,
      customer: { select: { id: true } },
    },
  });

  if (!user) {
    throw ApiError.unauthorized('User account not found.');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated. Please contact support.');
  }

  req.user = user;
  next();
});
